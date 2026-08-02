import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel } from '@/models/LearningPath'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { serializeProgress } from '@/lib/learning-paths/serialize'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const rows = await UserPathProgressModel.find({
      userId: session.user.id,
    })
      .sort({ lastActivityAt: -1 })
      .lean()

    const pathIds = rows.map((r) => r.pathId)
    const paths = await LearningPathModel.find({ _id: { $in: pathIds } }).lean()
    const pathMap = new Map(paths.map((p) => [String(p._id), p]))

    return NextResponse.json({
      progress: rows.map((row) => {
        const path = pathMap.get(String(row.pathId))
        return {
          ...serializeProgress(row),
          path: path
            ? {
                id: String(path._id),
                title: path.title,
                description: path.description,
                targetAudience: path.targetAudience,
              }
            : null,
        }
      }),
    })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load progress' },
      { status: 500 },
    )
  }
}
