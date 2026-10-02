import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel, type IInterviewSession } from '@/models/InterviewSession'
import { advancePathProgressForInterview } from '@/lib/learning-paths/advance-on-complete'
import { formatIndustryDisplay, formatRoleCategoryDisplay } from '@/utils/dashboard/interview-labels'
import { createGeminiJudge } from '@/lib/evaluation/gemini-judge'
import { evaluateSession } from '@/lib/evaluation/evaluate-session'
import type { EvalAnswer, EvalQuestion, QuestionEvaluation } from '@/lib/evaluation/types'

/** A run that has shown no progress for this long is treated as dead and may be restarted. */
export const STALE_RUN_MS = 5 * 60 * 1000

function roleContextFor(doc: IInterviewSession): string {
  const role = formatRoleCategoryDisplay(doc.industryKey, doc.specializationKey || doc.roleCategoryKey)
  const industry = formatIndustryDisplay(doc.departmentKey || doc.industryKey)
  return [role, industry].filter((s) => s && s !== '—').join(', ') || 'the advertised role'
}

/**
 * §19 — the whole pipeline for one session. Per-question results are persisted as
 * they are produced, so a timeout loses at most one batch and a re-call resumes
 * (unchanged answers are reused via `answerHash`).
 */
export async function runEvaluationForSession(sessionId: string, userId: string): Promise<void> {
  await connectToDatabase()
  const filter = { _id: sessionId, userId }
  const doc = await InterviewSessionModel.findOne(filter).lean()
  if (!doc) return

  try {
    const questions = (doc.questions ?? []) as EvalQuestion[]
    const answers = (doc.answers ?? []).map(
      (a): EvalAnswer => ({
        index: a.index,
        answer: a.answer,
        transcript: a.transcript ?? null,
        delivery: a.delivery ?? null,
        audioConfidence: a.audioConfidence ?? null,
        inputMode: a.inputMode ?? null,
        evaluation: a.evaluation ?? null,
      }),
    )

    const result = await evaluateSession(
      {
        questions,
        answers,
        session: { interviewType: doc.interviewType, interviewTypes: doc.interviewTypes },
        context: { roleContext: roleContextFor(doc) },
      },
      {
        judge: createGeminiJudge(),
        onQuestionEvaluated: async (index: number, evaluation: QuestionEvaluation) => {
          await InterviewSessionModel.updateOne(
            { ...filter, 'answers.index': index },
            { $set: { 'answers.$.evaluation': evaluation, evaluationStartedAt: new Date() } },
          )
        },
      },
    )

    await InterviewSessionModel.updateOne(filter, {
      $set: {
        evaluation: result.session,
        evaluationStatus: 'ready',
        evaluationError: result.failures.length ? result.failures.join(' | ').slice(0, 1000) : null,
      },
    })

    // Step 7 — only now, and only with a full grade, does the learning path move (§19, open question 3).
    if (result.session.pathEligible && result.session.contentScore !== null && doc.learningPathId) {
      await advancePathProgressForInterview({
        userId,
        learningPathId: doc.learningPathId,
        learningStageId: doc.learningStageId,
        score: result.session.contentScore,
        questionsAnswered: result.session.answeredCount,
        remediationId: doc.pathRemediationId,
      })
    }
  } catch (error) {
    console.error('[evaluate] run failed', sessionId, error)
    await InterviewSessionModel.updateOne(filter, {
      $set: {
        evaluationStatus: 'failed',
        evaluationError: error instanceof Error ? error.message.slice(0, 1000) : 'Evaluation failed',
      },
    })
  }
}
