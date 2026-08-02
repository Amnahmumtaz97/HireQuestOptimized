import { Types } from 'mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { LearningPathModel, type ILearningPath } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { visibilityQuery } from '@/lib/learning-paths/constants'
import { serializePath } from '@/lib/learning-paths/serialize'

export type RecommendedPath = {
  path: ReturnType<typeof serializePath>
  score: number
  reason: string
}

function tokenize(...parts: Array<string | undefined | null>): Set<string> {
  const set = new Set<string>()
  for (const part of parts) {
    if (!part) continue
    for (const token of part
      .toLowerCase()
      .split(/[^a-z0-9+#]+/i)
      .filter((t) => t.length > 1)) {
      set.add(token)
    }
  }
  return set
}

/**
 * Rank catalog paths from interview history + path topicStats (deterministic, no LLM).
 */
export async function recommendPathsForUser(
  userId: string,
  limit = 6,
): Promise<RecommendedPath[]> {
  const [progressRows, interviews, catalog] = await Promise.all([
    UserPathProgressModel.find({ userId }).lean(),
    InterviewSessionModel.find({ userId, status: 'completed' })
      .select('topics departmentKey specializationKeys answers questions')
      .limit(80)
      .lean(),
    LearningPathModel.find(visibilityQuery(userId)).lean(),
  ])

  const completedPathIds = new Set(
    progressRows.filter((p) => p.status === 'completed').map((p) => String(p.pathId)),
  )
  const inProgressIds = new Set(
    progressRows.filter((p) => p.status === 'in_progress').map((p) => String(p.pathId)),
  )

  const weakTopics = new Map<string, number>()
  for (const row of progressRows) {
    for (const [topic, stat] of Object.entries(row.topicStats || {})) {
      if (stat.avgScore < 70) {
        weakTopics.set(topic.toLowerCase(), (weakTopics.get(topic.toLowerCase()) || 0) + 1)
      }
    }
  }
  for (const session of interviews) {
    const total = Array.isArray(session.questions) ? session.questions.length : 0
    const answered = (session.answers || []).filter(
      (a) => typeof a.answer === 'string' && a.answer.trim(),
    ).length
    const score = total ? Math.round((answered / total) * 100) : 0
    if (score >= 70) continue
    for (const topic of session.topics || []) {
      weakTopics.set(topic.toLowerCase(), (weakTopics.get(topic.toLowerCase()) || 0) + 1)
    }
  }

  const weakTokens = new Set<string>()
  for (const topic of weakTopics.keys()) {
    for (const t of tokenize(topic)) weakTokens.add(t)
  }

  const pathIds = catalog.map((p) => p._id)
  const stages = await StageModel.find({ pathId: { $in: pathIds } })
    .sort({ order: 1 })
    .lean()
  const stagesByPath = new Map<string, typeof stages>()
  for (const s of stages) {
    const key = String(s.pathId)
    const list = stagesByPath.get(key) ?? []
    list.push(s)
    stagesByPath.set(key, list)
  }

  const ranked: RecommendedPath[] = []
  for (const path of catalog) {
    const id = String(path._id)
    if (completedPathIds.has(id)) continue
    if (path.ownerUserId && path.ownerUserId !== userId) continue

    const pathStages = stagesByPath.get(id) ?? []
    const hay = tokenize(
      path.title,
      path.description,
      path.subcategory,
      ...(path.tags || []),
      ...pathStages.flatMap((s) => s.suggestedTopics || []),
    )

    let score = 0
    let matchedWeak = ''
    for (const token of weakTokens) {
      if (hay.has(token)) {
        score += 3
        if (!matchedWeak) matchedWeak = token
      }
    }
    for (const [topic] of weakTopics) {
      if ((path.tags || []).some((t) => t.toLowerCase().includes(topic))) {
        score += 5
        matchedWeak = topic
      }
    }
    if (inProgressIds.has(id)) score += 8
    if (path.isFeatured) score += 2
    if (path.category === 'dsa' && weakTokens.has('arrays')) score += 2

    if (score <= 0 && !inProgressIds.has(id)) continue

    const reason = inProgressIds.has(id)
      ? 'Continue where you left off'
      : matchedWeak
        ? `Weak on ${matchedWeak}`
        : 'Matches your recent practice'

    ranked.push({
      path: serializePath(path as ILearningPath & { _id: Types.ObjectId }, pathStages),
      score,
      reason,
    })
  }

  ranked.sort((a, b) => b.score - a.score || a.path.title.localeCompare(b.path.title))
  return ranked.slice(0, limit)
}

export async function popularPathIds(limit = 12): Promise<Map<string, number>> {
  const rows = await UserPathProgressModel.aggregate<{
    _id: Types.ObjectId
    count: number
  }>([
    { $group: { _id: '$pathId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit * 3 },
  ])
  const map = new Map<string, number>()
  for (const row of rows) map.set(String(row._id), row.count)
  return map
}
