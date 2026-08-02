import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId, Types } from 'mongoose'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { StageModel } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { serializeProgress } from '@/lib/learning-paths/serialize'

const progressBodySchema = z.object({
  stageId: z.string().min(1),
  /** Only used for concept / ai_feedback stages. Ignored for practice/mock. */
  score: z.number().min(0).max(100).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id: pathId } = await params
    if (!isValidObjectId(pathId)) {
      return NextResponse.json({ message: 'Invalid path id' }, { status: 400 })
    }

    const json = await request.json()
    const parsed = progressBodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    const { stageId, score } = parsed.data
    if (!isValidObjectId(stageId)) {
      return NextResponse.json({ message: 'Invalid stage id' }, { status: 400 })
    }

    await connectToDatabase()

    const stage = await StageModel.findOne({ _id: stageId, pathId }).lean()
    if (!stage) {
      return NextResponse.json({ message: 'Stage not found' }, { status: 404 })
    }

    // Interview stages must be completed via a linked interview session — not client score.
    if (stage.type === 'practice' || stage.type === 'mock_interview') {
      return NextResponse.json(
        {
          message:
            'Complete a path-linked interview to finish this stage. Manual score unlock is not allowed.',
        },
        { status: 400 },
      )
    }

    const progress = await UserPathProgressModel.findOne({
      userId: session.user.id,
      pathId,
    })
    if (!progress) {
      return NextResponse.json(
        { message: 'Not enrolled in this path. Enroll first.' },
        { status: 400 },
      )
    }

    const completedIds = new Set(
      (progress.completedStageIds || []).map((x) => String(x)),
    )

    const allStages = await StageModel.find({ pathId }).sort({ order: 1 }).lean()

    if (completedIds.has(stageId)) {
      return NextResponse.json({
        progress: serializeProgress(progress.toObject(), allStages),
        unlocked: true,
        nextStageId: progress.currentStageId ? String(progress.currentStageId) : null,
        message: 'Stage already completed',
      })
    }

    // Repair null currentStageId to first incomplete stage
    let currentId = progress.currentStageId ? String(progress.currentStageId) : null
    if (!currentId) {
      const nextOpen = allStages.find((s) => !completedIds.has(String(s._id)))
      if (!nextOpen) {
        return NextResponse.json(
          { message: 'No open stage on this path' },
          { status: 400 },
        )
      }
      currentId = String(nextOpen._id)
      progress.currentStageId = nextOpen._id
      progress.status = 'in_progress'
    }

    if (currentId !== stageId) {
      return NextResponse.json(
        { message: 'Complete the current stage before advancing further.' },
        { status: 400 },
      )
    }

    const minScore =
      typeof stage.unlockMinScore === 'number' ? stage.unlockMinScore : null
    if (minScore !== null) {
      const earned = typeof score === 'number' ? score : 0
      if (earned < minScore) {
        return NextResponse.json(
          {
            message: `Score ${earned} is below the unlock minimum of ${minScore}. Keep practicing this stage.`,
            unlocked: false,
            requiredScore: minScore,
            score: earned,
          },
          { status: 400 },
        )
      }
    }

    completedIds.add(stageId)
    progress.completedStageIds = [...completedIds].map(
      (sid) => new Types.ObjectId(sid),
    )

    if (typeof score === 'number') {
      progress.stageScores = {
        ...(progress.stageScores || {}),
        [stageId]: score,
      }
    }

    const nextStage = allStages.find((s) => !completedIds.has(String(s._id)))

    if (nextStage) {
      progress.currentStageId = nextStage._id
      progress.status = 'in_progress'
    } else {
      progress.currentStageId = null
      progress.status = 'completed'
    }

    progress.lastActivityAt = new Date()
    await progress.save()

    return NextResponse.json({
      progress: serializeProgress(progress.toObject(), allStages),
      unlocked: true,
      nextStageId: nextStage ? String(nextStage._id) : null,
    })
  } catch (error) {
    console.error('[paths/progress]', error)
    return NextResponse.json(
      { message: 'Failed to update path progress' },
      { status: 500 },
    )
  }
}
