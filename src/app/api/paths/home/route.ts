import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { Types } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel, type ILearningPath } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { serializePath, serializeProgress } from '@/lib/learning-paths/serialize'
import { visibilityQuery } from '@/lib/learning-paths/constants'
import { popularPathIds, recommendPathsForUser } from '@/lib/learning-paths/recommend'

type PathLean = ILearningPath & { _id: Types.ObjectId; createdAt?: Date }

async function hydratePaths(pathDocs: PathLean[]) {
  const pathIds = pathDocs.map((p) => p._id)
  const stages = await StageModel.find({ pathId: { $in: pathIds } })
    .sort({ order: 1 })
    .lean()
  const stagesByPath = new Map<string, typeof stages>()
  for (const stage of stages) {
    const key = String(stage.pathId)
    const list = stagesByPath.get(key) ?? []
    list.push(stage)
    stagesByPath.set(key, list)
  }
  return pathDocs.map((p) => serializePath(p, stagesByPath.get(String(p._id)) ?? []))
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()
    const userId = session.user.id

    const progressRows = await UserPathProgressModel.find({ userId })
      .sort({ lastActivityAt: -1 })
      .lean()

    const continueIds = progressRows
      .filter((p) => p.status === 'in_progress')
      .map((p) => p.pathId)
      .slice(0, 8)
    const completedIds = progressRows
      .filter((p) => p.status === 'completed')
      .map((p) => p.pathId)
      .slice(0, 8)

    const [continueDocs, completedDocs, newDocs, recommended, popularMap] =
      await Promise.all([
        continueIds.length
          ? LearningPathModel.find({ _id: { $in: continueIds } }).lean<PathLean[]>()
          : Promise.resolve([] as PathLean[]),
        completedIds.length
          ? LearningPathModel.find({ _id: { $in: completedIds } }).lean<PathLean[]>()
          : Promise.resolve([] as PathLean[]),
        LearningPathModel.find(visibilityQuery(userId))
          .sort({ createdAt: -1 })
          .limit(8)
          .lean<PathLean[]>(),
        recommendPathsForUser(userId, 8),
        popularPathIds(24),
      ])

    const popularIds = [...popularMap.keys()].slice(0, 8)
    const popularDocs = popularIds.length
      ? await LearningPathModel.find({
          _id: { $in: popularIds },
          ...visibilityQuery(userId),
        }).lean<PathLean[]>()
      : ([] as PathLean[])

    // Preserve continue order by last activity
    const continueOrder = new Map(continueIds.map((id, i) => [String(id), i]))
    continueDocs.sort(
      (a, b) =>
        (continueOrder.get(String(a._id)) ?? 99) -
        (continueOrder.get(String(b._id)) ?? 99),
    )
    const popularOrder = new Map(popularIds.map((id, i) => [id, i]))
    popularDocs.sort(
      (a, b) =>
        (popularOrder.get(String(a._id)) ?? 99) -
        (popularOrder.get(String(b._id)) ?? 99),
    )

    const [continuePaths, completedPaths, newPaths, popularPaths] = await Promise.all([
      hydratePaths(continueDocs),
      hydratePaths(completedDocs),
      hydratePaths(newDocs),
      hydratePaths(popularDocs),
    ])

    const progressByPath = new Map(
      progressRows.map((row) => [String(row.pathId), serializeProgress(row)]),
    )

    const weakTopics = new Map<string, number>()
    for (const row of progressRows) {
      for (const [topic, stat] of Object.entries(row.topicStats || {})) {
        if (stat.avgScore < 70) {
          weakTopics.set(topic, Math.min(stat.avgScore, weakTopics.get(topic) ?? 100))
        }
      }
    }

    return NextResponse.json({
      continueLearning: continuePaths.map((path) => ({
        path,
        progress: progressByPath.get(path.id) || null,
      })),
      completed: completedPaths.map((path) => ({
        path,
        progress: progressByPath.get(path.id) || null,
      })),
      recommended: recommended.map((r) => ({
        path: r.path,
        reason: r.reason,
        score: r.score,
      })),
      popular: popularPaths,
      new: newPaths,
      weakTopics: [...weakTopics.entries()]
        .sort((a, b) => a[1] - b[1])
        .slice(0, 8)
        .map(([topic, avgScore]) => ({ topic, avgScore })),
    })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load learning paths home' },
      { status: 500 },
    )
  }
}
