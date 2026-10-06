import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { redactSessionForClient } from '@/lib/evaluation/redact'
import {
  softSkillsRequiresSpoken,
  SOFT_SKILLS_TYPED_REJECT_MESSAGE,
} from '@/lib/interview/soft-skills-answer'

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
    return NextResponse.json({ session: redactSessionForClient(doc) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load interview' },
      { status: 500 },
    )
  }
}

/** DeliveryStats as produced by summarizeDelivery(); only the fields evaluation reads are enforced. */
const deliveryStatsSchema = z
  .object({
    durationSec: z.number().min(0),
    speakingSec: z.number().min(0),
    wordCount: z.number().int().min(0),
    tokenCount: z.number().int().min(0),
    wordsPerMinute: z.number().min(0),
    articulationRate: z.number().min(0),
    disfluencies: z.object({
      total: z.number().int().min(0),
      perMinute: z.number().min(0),
      breakdown: z.array(z.object({ word: z.string(), count: z.number().int().min(0) })).max(40),
    }),
    crutches: z.array(z.object({ phrase: z.string(), count: z.number().int().min(0) })).max(40),
    pauses: z.object({
      count: z.number().int().min(0),
      totalSec: z.number().min(0),
      longestSec: z.number().min(0),
      averageSec: z.number().min(0),
      byTier: z.object({
        short: z.number().int().min(0),
        medium: z.number().int().min(0),
        long: z.number().int().min(0),
      }),
    }),
    silenceRatio: z.number().min(0).max(1),
  })
  .strict()

/**
 * Phase 2 — what the editor captured alongside the text. Spoken answers carry the
 * transcript + delivery stats; typed answers just say so, which clears any stale capture.
 */
const captureSchema = z.discriminatedUnion('inputMode', [
  z.object({ inputMode: z.literal('typed') }),
  z.object({
    inputMode: z.literal('spoken'),
    transcript: z.object({
      verbatim: z.string().trim().min(1).max(20_000),
      annotated: z.string().trim().min(1).max(30_000),
    }),
    delivery: deliveryStatsSchema,
    audioConfidence: z.number().min(0).max(1).nullable().optional(),
  }),
])

const patchSchema = z.object({
  status: z.enum(['created', 'in_progress', 'completed']).optional(),
  currentQuestionIndex: z.number().int().min(0).optional(),
  answer: z
    .object({
      index: z.number().int().min(0),
      // Pause markers now live in transcript.annotated, so the cap only has to fit the words.
      answer: z.string().trim().min(1).max(10_000),
      capture: captureSchema.optional(),
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
    // Completion only marks the session; scoring and any path advance happen in
    // POST /evaluate once a real score exists (§19 step 7).
    if (parsed.data.status === 'completed' && !wasCompleted) {
      baseSet.evaluationStatus = 'pending'
      baseSet.evaluation = null
      baseSet.evaluationError = null
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
      const { index, answer, capture } = parsed.data.answer
      const question = exists.questions?.[index]
      const isCoding = question?.kind === 'coding'
      const voiceOnly = softSkillsRequiresSpoken({
        interviewType: exists.interviewType,
        questionType: question?.type,
        questionKind: question?.kind,
      })

      if (voiceOnly) {
        const prior = Array.isArray(exists.answers)
          ? exists.answers.find((a) => a.index === index)
          : undefined
        if (capture?.inputMode === 'typed') {
          return NextResponse.json(
            { message: SOFT_SKILLS_TYPED_REJECT_MESSAGE },
            { status: 400 },
          )
        }
        if (capture?.inputMode !== 'spoken' && prior?.inputMode !== 'spoken') {
          return NextResponse.json(
            { message: SOFT_SKILLS_TYPED_REJECT_MESSAGE },
            { status: 400 },
          )
        }
      }

      // capture omitted → keep whatever was captured before (a text edit after a spoken
      // answer must not throw away its delivery stats); explicit typed → clear it.
      const captureSet: Record<string, unknown> = {}
      const captureUnset: Record<string, 1> = {}
      if (isCoding) {
        captureSet.inputMode = 'coding'
      } else if (capture?.inputMode === 'spoken') {
        captureSet.inputMode = 'spoken'
        captureSet.transcript = capture.transcript
        captureSet.delivery = capture.delivery
        captureSet.audioConfidence = capture.audioConfidence ?? null
      } else if (capture?.inputMode === 'typed') {
        captureSet.inputMode = 'typed'
        captureUnset.transcript = 1
        captureUnset.delivery = 1
        captureUnset.audioConfidence = 1
      }

      const positional: Record<string, unknown> = {
        'answers.$.answer': answer,
        'answers.$.updatedAt': now,
      }
      for (const [k, v] of Object.entries(captureSet)) positional[`answers.$.${k}`] = v
      const positionalUnset: Record<string, 1> = {}
      for (const k of Object.keys(captureUnset)) positionalUnset[`answers.$.${k}`] = 1

      const afterAnswerUpdate = await InterviewSessionModel.findOneAndUpdate(
        { ...filter, 'answers.index': index },
        {
          $set: positional,
          ...(Object.keys(positionalUnset).length ? { $unset: positionalUnset } : {}),
        },
        { returnDocument: 'after' },
      ).lean()

      if (afterAnswerUpdate) {
        updated = afterAnswerUpdate
      } else {
        updated = await InterviewSessionModel.findOneAndUpdate(
          filter,
          {
            $push: {
              answers: { index, answer, updatedAt: now, inputMode: 'typed', ...captureSet },
            },
          },
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
        updated = withStart
      }
    }

    return NextResponse.json({
      session: redactSessionForClient(updated as Record<string, unknown>),
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
