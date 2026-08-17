import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { serializeProgress } from '@/lib/learning-paths/serialize'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid path id' }, { status: 400 })
    }

    await connectToDatabase()
    const path = await LearningPathModel.findById(id).lean()
    if (!path) {
      return NextResponse.json({ message: 'Path not found' }, { status: 404 })
    }

    const firstStage = await StageModel.findOne({ pathId: id })
      .sort({ order: 1 })
      .lean()

    if (!firstStage) {
      return NextResponse.json(
        { message: 'This learning path has no stages yet' },
        { status: 400 },
      )
    }

    const existing = await UserPathProgressModel.findOne({
      userId: session.user.id,
      pathId: id,
    })

    const stages = await StageModel.find({ pathId: id }).sort({ order: 1 }).lean()

    if (existing) {
      if (existing.status === 'abandoned') {
        existing.status = 'in_progress'
        existing.lastActivityAt = new Date()
        if (!existing.currentStageId) {
          existing.currentStageId = firstStage._id
        }
        await existing.save()
      } else if (!existing.currentStageId && existing.status !== 'completed') {
        existing.currentStageId = firstStage._id
        await existing.save()
      }
      return NextResponse.json({
        progress: serializeProgress(existing.toObject(), stages),
        enrolled: true,
      })
    }

    const created = await UserPathProgressModel.create({
      userId: session.user.id,
      pathId: id,
      currentStageId: firstStage._id,
      completedStageIds: [],
      stageScores: {},
      status: 'in_progress',
      startedAt: new Date(),
      lastActivityAt: new Date(),
    })

    return NextResponse.json(
      { progress: serializeProgress(created.toObject(), stages), enrolled: true },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { message: 'Failed to enroll in learning path' },
      { status: 500 },
    )
  }
}
