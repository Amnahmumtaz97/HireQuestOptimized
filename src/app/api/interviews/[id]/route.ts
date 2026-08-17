import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { advancePathProgressForInterview } from '@/lib/learning-paths/advance-on-complete'

function validateId(id: string): NextResponse | null {
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid interview id' }, { status: 400 })
  }
  return null
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const idError = validateId(id)
  if (idError) return idError

  try {
    await connectToDatabase()
    const doc = await InterviewSessionModel.findOne({ _id: id, userId: session.user.id }).lean()
    if (!doc) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }
    return NextResponse.json({ session: doc })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load interview' },
      { status: 500 },
    )
  }
}

const patchSchema = z.object({
  status: z.enum(['created', 'in_progress', 'completed']).optional(),
  currentQuestionIndex: z.number().int().min(0).optional(),
  answer: z
    .object({
      index: z.number().int().min(0),
      answer: z.string().trim().min(1).max(10_000),
    })
    .optional(),
  flag: z
    .object({
      index: z.number().int().min(0),
      flagged: z.boolean(),
    })
    .optional(),
})

/** Share of questions with a non-empty answer (0–100). No invented baseline. */
function completionScore(doc: {
  questions?: unknown[]
  answers?: Array<{ index?: number; answer?: string }>
}): number {
  const total = Array.isArray(doc.questions) ? doc.questions.length : 0
  if (total <= 0) return 0
  const answered = (doc.answers ?? []).filter(
    (a) => typeof a.answer === 'string' && a.answer.trim().length > 0,
  ).length
  return Math.max(0, Math.min(100, Math.round((answered / total) * 100)))
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const idError = validateId(id)
  if (idError) return idError

  try {
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const filter = { _id: id, userId: session.user.id }

    const exists = await InterviewSessionModel.findOne(filter).lean()
    if (!exists) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }

    const questionCount = Array.isArray(exists.questions) ? exists.questions.length : 0

    if (parsed.data.answer) {
      if (questionCount <= 0) {
        return NextResponse.json(
          { message: 'Generate questions before saving answers' },
          { status: 400 },
        )
      }
      if (parsed.data.answer.index >= questionCount) {
        return NextResponse.json({ message: 'Answer index out of range' }, { status: 400 })
      }
    }
    if (parsed.data.flag) {
      if (questionCount <= 0 || parsed.data.flag.index >= questionCount) {
        return NextResponse.json({ message: 'Flag index out of range' }, { status: 400 })
      }
    }
    if (
      typeof parsed.data.currentQuestionIndex === 'number' &&
      questionCount > 0 &&
      parsed.data.currentQuestionIndex >= questionCount
    ) {
      return NextResponse.json(
        { message: 'currentQuestionIndex out of range' },
        { status: 400 },
      )
    }

    if (parsed.data.status === 'completed') {
      if (questionCount <= 0) {
        return NextResponse.json(
          { message: 'Cannot complete an interview with no questions' },
          { status: 400 },
        )
      }
      if (exists.status === 'created') {
        return NextResponse.json(
          { message: 'Start the interview before marking it completed' },
          { status: 400 },
        )
      }
    }

    const wasCompleted = exists.status === 'completed'
    const baseSet: Record<string, unknown> = {}
    if (parsed.data.status) baseSet.status = parsed.data.status
    if (typeof parsed.data.currentQuestionIndex === 'number') {
      baseSet.currentQuestionIndex = parsed.data.currentQuestionIndex
    }

    let updated: unknown = exists

    if (Object.keys(baseSet).length > 0) {
      updated = await InterviewSessionModel.findOneAndUpdate(
        filter,
        { $set: baseSet },
        { returnDocument: 'after' },
      ).lean()
    }

    if (parsed.data.answer) {
      const now = new Date()
      const { index, answer } = parsed.data.answer

      const afterAnswerUpdate = await InterviewSessionModel.findOneAndUpdate(
        { ...filter, 'answers.index': index },
        {
          $set: {
            'answers.$.answer': answer,
            'answers.$.updatedAt': now,
          },
        },
        { returnDocument: 'after' },
      ).lean()

      if (afterAnswerUpdate) {
        updated = afterAnswerUpdate
      } else {
        updated = await InterviewSessionModel.findOneAndUpdate(
          filter,
          { $push: { answers: { index, answer, updatedAt: now } } },
          { returnDocument: 'after' },
        ).lean()
      }
    }

    if (parsed.data.flag) {
      const { index, flagged } = parsed.data.flag
      updated = await InterviewSessionModel.findOneAndUpdate(
        filter,
        flagged
          ? { $addToSet: { flaggedQuestionIndexes: index } }
          : { $pull: { flaggedQuestionIndexes: index } },
        { returnDocument: 'after' },
      ).lean()
    }

    if (!updated) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }

    const sessionDoc = updated as {
      durationMinutes?: number | null
      interviewStartedAt?: Date | null
      status?: string
      learningPathId?: string | null
      learningStageId?: string | null
      questions?: unknown[]
      answers?: Array<{ index?: number; answer?: string }>
    }
    if (
      sessionDoc.durationMinutes &&
      !sessionDoc.interviewStartedAt &&
      sessionDoc.status === 'in_progress'
    ) {
      const withStart = await InterviewSessionModel.findOneAndUpdate(
        filter,
        { $set: { interviewStartedAt: new Date() } },
        { returnDocument: 'after' },
      ).lean()
      if (withStart) {
        updated = withStart
      }
    }

    let pathProgress: { advanced: boolean; message?: string } | null = null
    if (sessionDoc.status === 'completed' && !wasCompleted) {
      pathProgress = await advancePathProgressForInterview({
        userId: session.user.id,
        learningPathId: sessionDoc.learningPathId,
        learningStageId: sessionDoc.learningStageId,
        score: completionScore(sessionDoc),
        questionsAnswered: (sessionDoc.answers ?? []).filter(
          (a) => typeof a.answer === 'string' && a.answer.trim().length > 0,
        ).length,
        remediationId: (sessionDoc as { pathRemediationId?: string | null }).pathRemediationId,
      })
    }

    return NextResponse.json({
      session: updated,
      ...(pathProgress ? { pathProgress } : {}),
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update interview' },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const idError = validateId(id)
  if (idError) return idError

  try {
    await connectToDatabase()
    const deleted = await InterviewSessionModel.findOneAndDelete({
      _id: id,
      userId: session.user.id,
    }).lean()
    if (!deleted) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete interview' },
      { status: 500 },
    )
  }
}
