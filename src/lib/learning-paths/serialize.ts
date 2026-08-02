import type { Types } from 'mongoose'
import type { IStage } from '@/models/Stage'
import type { ILearningPath } from '@/models/LearningPath'
import type { IUserPathProgress } from '@/models/UserPathProgress'
import { STAGE_LEVEL_LABELS, type StageLevel } from '@/lib/learning-paths/constants'

export function serializeStage(stage: IStage & { _id: Types.ObjectId }) {
  const level =
    typeof stage.level === 'number' && stage.level >= 1 && stage.level <= 6
      ? (stage.level as StageLevel)
      : null
  return {
    id: String(stage._id),
    pathId: String(stage.pathId),
    order: stage.order,
    title: stage.title,
    type: stage.type,
    contentRef: stage.contentRef || '',
    unlockMinScore:
      typeof stage.unlockMinScore === 'number' ? stage.unlockMinScore : null,
    level,
    levelLabel: level ? STAGE_LEVEL_LABELS[level] : null,
    departmentKey: stage.departmentKey || '',
    specializationKeys: stage.specializationKeys || [],
    interviewType: stage.interviewType || null,
    difficulty: stage.difficulty || null,
    suggestedTopics: stage.suggestedTopics || [],
    totalQuestions:
      typeof stage.totalQuestions === 'number' ? stage.totalQuestions : null,
    technicalQuestionRatio:
      typeof stage.technicalQuestionRatio === 'number'
        ? stage.technicalQuestionRatio
        : null,
    isRemediation: Boolean(stage.isRemediation),
  }
}

export function serializePath(
  path: ILearningPath & { _id: Types.ObjectId },
  stages: Array<IStage & { _id: Types.ObjectId }> = [],
) {
  const ordered = stages.slice().sort((a, b) => a.order - b.order)
  return {
    id: String(path._id),
    title: path.title,
    description: path.description,
    targetAudience: path.targetAudience,
    slug: path.slug || null,
    category: path.category || 'technology',
    subcategory: path.subcategory || '',
    tags: path.tags || [],
    estimatedInterviews:
      typeof path.estimatedInterviews === 'number' ? path.estimatedInterviews : null,
    difficultyLabel: path.difficultyLabel || null,
    estimatedMinutes:
      typeof path.estimatedMinutes === 'number' ? path.estimatedMinutes : null,
    isFeatured: Boolean(path.isFeatured),
    publishedAt: (path as { createdAt?: Date }).createdAt || null,
    ownerUserId: path.ownerUserId || null,
    stages: ordered.map(serializeStage),
  }
}

export function deriveProgressAnalytics(
  progress: IUserPathProgress,
  stages: Array<IStage & { _id: Types.ObjectId }> = [],
) {
  const ordered = stages.slice().sort((a, b) => a.order - b.order)
  const total = ordered.length
  const completed = (progress.completedStageIds || []).length
  const completionPercent = total > 0 ? Math.round((completed / total) * 100) : 0

  const current = ordered.find((s) => String(s._id) === String(progress.currentStageId))
  const currentLevel =
    typeof current?.level === 'number'
      ? current.level
      : current
        ? Math.min(6, Math.max(1, current.order))
        : progress.status === 'completed'
          ? 6
          : null

  const scoreEntries = Object.entries(progress.stageScores || {})
  let strongest: { stageId: string; title: string; score: number } | null = null
  let weakest: { stageId: string; title: string; score: number } | null = null
  for (const [stageId, score] of scoreEntries) {
    const stage = ordered.find((s) => String(s._id) === stageId)
    const title = stage?.title || 'Stage'
    if (!strongest || score > strongest.score) strongest = { stageId, title, score }
    if (!weakest || score < weakest.score) weakest = { stageId, title, score }
  }

  const topicEntries = Object.entries(progress.topicStats || {}).map(([topic, stat]) => ({
    topic,
    attempts: stat.attempts,
    avgScore: stat.avgScore,
  }))
  topicEntries.sort((a, b) => a.avgScore - b.avgScore)
  const weakestTopics = topicEntries.slice(0, 5)
  const strongestTopics = [...topicEntries].sort((a, b) => b.avgScore - a.avgScore).slice(0, 5)

  const activeRemediation = (progress.remediationQueue || []).find(
    (r) => r.id === progress.activeRemediationId && !r.completed,
  )

  return {
    completionPercent,
    currentLevel,
    currentLevelLabel:
      currentLevel && currentLevel >= 1 && currentLevel <= 6
        ? STAGE_LEVEL_LABELS[currentLevel as StageLevel]
        : null,
    strongestStage: strongest,
    weakestStage: weakest,
    weakestTopics,
    strongestTopics,
    recommendedTopics: weakestTopics.filter((t) => t.avgScore < 70).map((t) => t.topic),
    activeRemediation: activeRemediation || null,
    xpEarned: progress.xpEarned || 0,
  }
}

export function serializeProgress(
  progress: IUserPathProgress & { _id: Types.ObjectId },
  stages: Array<IStage & { _id: Types.ObjectId }> = [],
) {
  return {
    id: String(progress._id),
    userId: progress.userId,
    pathId: String(progress.pathId),
    currentStageId: progress.currentStageId
      ? String(progress.currentStageId)
      : null,
    completedStageIds: (progress.completedStageIds || []).map(String),
    stageScores: progress.stageScores || {},
    status: progress.status,
    startedAt: progress.startedAt,
    lastActivityAt: progress.lastActivityAt,
    topicStats: progress.topicStats || {},
    remediationQueue: progress.remediationQueue || [],
    activeRemediationId: progress.activeRemediationId || null,
    xpEarned: progress.xpEarned || 0,
    analytics: deriveProgressAnalytics(progress, stages),
  }
}
