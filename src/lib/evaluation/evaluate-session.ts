import type {
  EvalAnswer,
  EvalQuestion,
  EvaluationFlag,
  QuestionEvaluation,
  Rubric,
  SessionEvaluation,
  TestRunSummary,
} from '@/lib/evaluation/types'
import { routeRubric } from '@/lib/evaluation/route-rubric'
import { gateCodingAnswer, gateSpokenAnswer } from '@/lib/evaluation/gates'
import { cleanTranscriptForGrading, computeTextSignals, type TextSignals } from '@/lib/evaluation/text-signals'
import { evaluateDelivery } from '@/lib/evaluation/delivery-score'
import { runAllTests, sanitizeFunctionName } from '@/lib/evaluation/code-runner'
import { PROMPT_VERSION, answerHash } from '@/lib/evaluation/hash'
import { buildJudgePrompt, type JudgeContext, type JudgeItem } from '@/lib/evaluation/prompt'
import type { JudgeFn } from '@/lib/evaluation/gemini-judge'
import type { JudgeObservation } from '@/lib/evaluation/parse'
import { scoreObservation } from '@/lib/evaluation/score'
import { aggregateSession } from '@/lib/evaluation/aggregate'

/** §19 — five per call: small enough to parse reliably, large enough to be cheap. */
export const JUDGE_BATCH_SIZE = 5

export type EvaluateSessionInput = {
  questions: EvalQuestion[]
  answers: EvalAnswer[]
  session: {
    interviewType?: string | null
    interviewTypes?: string[] | null
  }
  context: JudgeContext
}

export type EvaluateSessionDeps = {
  /** null → Tier 3 unavailable; deterministic parts only. */
  judge: JudgeFn | null
  /** Called as soon as a question's evaluation is final, so a timeout loses at most one batch. */
  onQuestionEvaluated?: (index: number, evaluation: QuestionEvaluation) => Promise<void>
  batchSize?: number
  now?: () => Date
}

export type EvaluateSessionResult = {
  evaluations: Map<number, QuestionEvaluation>
  session: SessionEvaluation
  /** Human-readable reasons for any batch that could not be AI-graded. */
  failures: string[]
}

type Pending = {
  index: number
  rubric: Rubric
  question: EvalQuestion
  answerText: string
  signals?: TextSignals
  base: QuestionEvaluation
  tests?: TestRunSummary
  codeUnverified?: boolean
}

function emptyEvaluation(
  rubric: Rubric,
  hash: string,
  now: Date,
  overrides: Partial<QuestionEvaluation> = {},
): QuestionEvaluation {
  return {
    rubric,
    contentScore: 0,
    deliveryScore: null,
    scores: {},
    levels: {},
    keyPointsHit: [],
    keyPointsPartial: [],
    keyPointsMissed: [],
    factualErrors: [],
    capsApplied: [],
    rationale: '',
    tips: [],
    flags: [],
    answerHash: hash,
    promptVersion: PROMPT_VERSION,
    evaluatedAt: now,
    aiGraded: false,
    ...overrides,
  }
}

/**
 * §10 / §19 — the shared flow. Deterministic steps run for every question first
 * and are persisted immediately; the judge is called last, in batches by rubric.
 */
export async function evaluateSession(
  input: EvaluateSessionInput,
  deps: EvaluateSessionDeps,
): Promise<EvaluateSessionResult> {
  const now = deps.now ?? (() => new Date())
  const batchSize = deps.batchSize ?? JUDGE_BATCH_SIZE
  const evaluations = new Map<number, QuestionEvaluation>()
  const pending: Pending[] = []
  const failures: string[] = []
  const answersByIndex = new Map(input.answers.map((a) => [a.index, a]))

  const persist = async (index: number, ev: QuestionEvaluation) => {
    evaluations.set(index, ev)
    if (answersByIndex.has(index) && deps.onQuestionEvaluated) {
      await deps.onQuestionEvaluated(index, ev)
    }
  }

  // ① – ⑤ for every question in questions[] — never answers[] (§2).
  for (let index = 0; index < input.questions.length; index++) {
    const question = input.questions[index]
    const rubric = routeRubric(question, input.session)
    const answer = answersByIndex.get(index)
    const hasKey = (question.keyPoints?.length ?? 0) > 0

    if (!answer || !answer.answer.trim()) {
      evaluations.set(
        index,
        emptyEvaluation(rubric, '', now(), { flags: ['unanswered'], rationale: 'No answer was saved for this question.' }),
      )
      continue
    }

    const hash = answerHash(answer.answer, rubric, question)

    if (rubric === 'coding') {
      const functionName = sanitizeFunctionName(question.functionName)
      const gate = gateCodingAnswer(answer.answer, question.starterCode, functionName)
      if (gate.ok === false) {
        await persist(index, emptyEvaluation(rubric, hash, now(), { flags: [gate.flag], rationale: gate.reason }))
        continue
      }
      const stored = answer.evaluation
      if (stored && stored.answerHash === hash && stored.aiGraded) {
        evaluations.set(index, stored)
        continue
      }
      const language = question.language ?? 'javascript'
      const codeUnverified = language !== 'javascript'
      const tests = codeUnverified
        ? undefined
        : runAllTests(answer.answer, functionName, question.publicTests, question.hiddenTests)
      const base = emptyEvaluation(rubric, hash, now(), { tests })
      pending.push({ index, rubric, question, answerText: answer.answer, base, tests, codeUnverified })
      continue
    }

    // Spoken / typed answers — content is graded on clean text (§6).
    const spoken = answer.inputMode === 'spoken'
    const answerText = spoken ? cleanTranscriptForGrading(answer.answer) : answer.answer.trim()
    const delivery = evaluateDelivery({
      inputMode: answer.inputMode,
      delivery: answer.delivery,
      audioConfidence: answer.audioConfidence,
    })
    const deliveryFlags: EvaluationFlag[] =
      delivery.scorable === false && delivery.flag ? [delivery.flag] : []
    const deliveryScore = delivery.scorable === true ? delivery.score : null
    const deliveryTips = delivery.scorable === true ? delivery.tips : []

    const gate = gateSpokenAnswer(rubric, answerText, question.question)
    if (gate.ok === false) {
      await persist(
        index,
        emptyEvaluation(rubric, hash, now(), {
          deliveryScore,
          flags: [gate.flag, ...deliveryFlags],
          tips: deliveryTips,
          rationale: gate.reason,
        }),
      )
      continue
    }

    if (!hasKey) {
      // §20 — pre-answer-key session: nothing to grade content against.
      await persist(
        index,
        emptyEvaluation(rubric, hash, now(), {
          contentScore: null,
          deliveryScore,
          flags: ['no_answer_key', ...deliveryFlags],
          tips: deliveryTips,
          rationale: 'This question was created before scoring was enabled and has no answer key.',
        }),
      )
      continue
    }

    const stored = answer.evaluation
    if (stored && stored.answerHash === hash && stored.aiGraded) {
      evaluations.set(index, stored)
      continue
    }

    const signals = computeTextSignals(answerText)
    const base = emptyEvaluation(rubric, hash, now(), {
      deliveryScore,
      flags: deliveryFlags,
      tips: deliveryTips,
    })
    pending.push({ index, rubric, question, answerText, signals, base })
  }

  // ⑥ – ⑧ Tier 3, batched by rubric so one prompt carries one set of anchors.
  const byRubric = new Map<Rubric, Pending[]>()
  for (const p of pending) {
    const list = byRubric.get(p.rubric) ?? []
    list.push(p)
    byRubric.set(p.rubric, list)
  }

  // Batches are independent, so they are judged concurrently: a 20-question
  // session is four calls in the time of one, not four in a row.
  const batches: Array<{ rubric: Rubric; batch: Pending[]; ordinal: number }> = []
  for (const [rubric, items] of byRubric) {
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push({ rubric, batch: items.slice(i, i + batchSize), ordinal: i / batchSize + 1 })
    }
  }

  const judgeBatch = async ({ rubric, batch, ordinal }: (typeof batches)[number]) => {
    const judgeItems: JudgeItem[] = batch.map((p) => ({
      id: p.index,
      rubric,
      question: p.question,
      answerText: p.answerText,
      signals: p.signals,
    }))

    let observations: Map<number, JudgeObservation> | null = null
    let model: string | undefined
    if (deps.judge) {
      try {
        const result = await deps.judge(buildJudgePrompt(rubric, judgeItems, input.context), batch.map((p) => p.index))
        observations = new Map(result.observations.map((o) => [o.id, o]))
        model = result.model
      } catch (e) {
        const message = e instanceof Error ? e.message : 'unknown error'
        failures.push(`${rubric} batch ${ordinal}: ${message}`)
        console.error('[evaluate] judge failed', rubric, message)
      }
    } else {
      failures.push(`${rubric}: AI grading is not configured (GEMINI_API_KEY missing).`)
    }
    return { batch, rubric, observations, model }
  }

  const judged = await Promise.all(batches.map(judgeBatch))

  for (const { batch, rubric, observations, model } of judged) {
    {
      for (const p of batch) {
        const obs = observations?.get(p.index) ?? null
        const scored = scoreObservation({
          rubric,
          question: p.question,
          answerText: p.answerText,
          observation: obs,
          signals: p.signals,
          tests: p.tests,
          codeUnverified: p.codeUnverified,
        })
        const languageMismatch = obs?.languageMismatch === true
        const flags = [...new Set([...p.base.flags, ...scored.flags, ...(languageMismatch ? (['language_mismatch'] as EvaluationFlag[]) : [])])]

        // Non-coding questions with no AI observation have no content score at all (§19 failure handling).
        const contentScore = languageMismatch
          ? 0
          : obs === null && rubric !== 'coding'
            ? null
            : scored.contentScore

        const ev: QuestionEvaluation = {
          ...p.base,
          contentScore,
          scores: scored.scores,
          levels: scored.levels,
          keyPointsHit: scored.keyPointsHit,
          keyPointsPartial: scored.keyPointsPartial,
          keyPointsMissed: scored.keyPointsMissed,
          factualErrors: scored.factualErrors,
          capsApplied: scored.capsApplied,
          rationale: languageMismatch
            ? 'The answer is not in the interview language, so it could not be graded.'
            : scored.rationale,
          tips: [...scored.tips, ...p.base.tips].slice(0, 8),
          flags,
          model,
          evaluatedAt: now(),
          aiGraded: obs !== null,
        }
        await persist(p.index, ev)
      }
    }
  }

  const session = aggregateSession({ questions: input.questions, evaluations })
  return { evaluations, session, failures }
}
