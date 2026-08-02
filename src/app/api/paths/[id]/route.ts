import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { serializePath, serializeProgress } from '@/lib/learning-paths/serialize'

export async function GET(
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

    const stages = await StageModel.find({ pathId: id }).sort({ order: 1 }).lean()
    const progress = await UserPathProgressModel.findOne({
      userId: session.user.id,
      pathId: id,
    }).lean()

    return NextResponse.json({
      path: serializePath(path, stages),
      progress: progress ? serializeProgress(progress, stages) : null,
    })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load learning path' },
      { status: 500 },
    )
  }
}
