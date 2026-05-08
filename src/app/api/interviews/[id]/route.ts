import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'

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
      return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 })
    }

    await connectToDatabase()

    const filter = { _id: id, userId: session.user.id }

    const exists = await InterviewSessionModel.findOne(filter).lean()
    if (!exists) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }

    const baseSet: Record<string, unknown> = {}
    if (parsed.data.status) baseSet.status = parsed.data.status
    if (typeof parsed.data.currentQuestionIndex === 'number') {
      baseSet.currentQuestionIndex = parsed.data.currentQuestionIndex
    }

    let updated: unknown = exists

    if (Object.keys(baseSet).length > 0) {
      updated = await InterviewSessionModel.findOneAndUpdate(filter, { $set: baseSet }, { returnDocument: 'after' }).lean()
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
        return NextResponse.json({ session: withStart })
      }
    }

    return NextResponse.json({ session: updated })
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
    const deleted = await InterviewSessionModel.findOneAndDelete({ _id: id, userId: session.user.id }).lean()
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
