import { randomUUID } from 'crypto'
import { Types } from 'mongoose'
import { StageModel } from '@/models/Stage'
import { UserPathProgressModel, type TopicStat } from '@/models/UserPathProgress'
import { awardInterviewGamification } from '@/lib/learning-paths/gamification'

const REMEDIATION_SCORE_THRESHOLD = 80

function bumpTopicStats(
  existing: Record<string, TopicStat> | undefined,
  topics: string[],
  score: number,
): Record<string, TopicStat> {
  const next: Record<string, TopicStat> = { ...(existing || {}) }
  for (const topic of topics) {
    const key = topic.trim()
    if (!key) continue
    const prev = next[key] || { attempts: 0, totalScore: 0, avgScore: 0 }
    const attempts = prev.attempts + 1
    const totalScore = prev.totalScore + score
    next[key] = {
      attempts,
      totalScore,
      avgScore: Math.round(totalScore / attempts),
    }
  }
  return next
}

/**
 * Advance learning-path progress when a path-linked interview is completed.
 * Enforces current-stage order and unlockMinScore when set.
 * May queue a per-user remediation focus before unlocking the next stage.
 */
export async function advancePathProgressForInterview(input: {
  userId: string
  learningPathId?: string | null
  learningStageId?: string | null
  score?: number | null
  questionsAnswered?: number
  remediationId?: string | null
}): Promise<{ advanced: boolean; message?: string; remediationQueued?: boolean }> {
  const { userId, learningPathId, learningStageId } = input
  if (!learningPathId || !learningStageId) {
    return { advanced: false, message: 'No path linkage' }
  }
  if (!Types.ObjectId.isValid(learningPathId) || !Types.ObjectId.isValid(learningStageId)) {
    return { advanced: false, message: 'Invalid path/stage id' }
  }

  const stage = await StageModel.findOne({
    _id: learningStageId,
    pathId: learningPathId,
  }).lean()
  if (!stage) return { advanced: false, message: 'Stage not found' }

  const progress = await UserPathProgressModel.findOne({
    userId,
    pathId: learningPathId,
  })
  if (!progress) return { advanced: false, message: 'Not enrolled' }

  const score =
    typeof input.score === 'number' && Number.isFinite(input.score)
      ? Math.max(0, Math.min(100, input.score))
      : null

  // Completing an active remediation focus practice
  if (input.remediationId && progress.activeRemediationId === input.remediationId) {
    const queue = [...(progress.remediationQueue || [])]
    const idx = queue.findIndex((r) => r.id === input.remediationId)
    if (idx >= 0) {
      const rem = queue[idx]
      queue[idx] = { ...rem, completed: true }
      progress.remediationQueue = queue
      progress.activeRemediationId = null
      if (score !== null) {
        progress.topicStats = bumpTopicStats(progress.topicStats, rem.topics, score)
      }

      const completedIds = new Set((progress.completedStageIds || []).map(String))
      if (!completedIds.has(rem.sourceStageId) && Types.ObjectId.isValid(rem.sourceStageId)) {
        completedIds.add(rem.sourceStageId)
        progress.completedStageIds = [...completedIds].map((id) => new Types.ObjectId(id))
        if (score !== null) {
          progress.stageScores = {
            ...(progress.stageScores || {}),
            [rem.sourceStageId]: Math.max(
              progress.stageScores?.[rem.sourceStageId] ?? 0,
              score,
            ),
          }
        }
        const allStages = await StageModel.find({ pathId: learningPathId })
          .sort({ order: 1 })
          .lean()
        const next = allStages.find((s) => !completedIds.has(String(s._id)))
        if (next) {
          progress.currentStageId = next._id
          progress.status = 'in_progress'
        } else {
          progress.currentStageId = null
          progress.status = 'completed'
        }
      }

      progress.xpEarned = (progress.xpEarned || 0) + 15
      progress.lastActivityAt = new Date()
      await progress.save()
      await awardInterviewGamification({
        userId,
        score,
        questionsAnswered: input.questionsAnswered,
        skillsStage: false,
      })
      return { advanced: true, message: 'Remediation completed; next stage unlocked' }
    }
  }

  const completedIds = new Set((progress.completedStageIds || []).map(String))
  if (completedIds.has(learningStageId)) {
    return { advanced: false, message: 'Stage already completed' }
  }

  let currentId = progress.currentStageId ? String(progress.currentStageId) : null
  if (!currentId) {
    const ordered = await StageModel.find({ pathId: learningPathId }).sort({ order: 1 }).lean()
    const nextOpen = ordered.find((s) => !completedIds.has(String(s._id)))
    if (nextOpen) {
      currentId = String(nextOpen._id)
      progress.currentStageId = nextOpen._id
      progress.status = 'in_progress'
      await progress.save()
    }
  }

  // Block advancing main line while remediation is active
  if (progress.activeRemediationId) {
    return {
      advanced: false,
      message: 'Complete recommended focus practice before continuing',
    }
  }

  if (!currentId || currentId !== learningStageId) {
    return {
      advanced: false,
      message: 'Interview stage is not the current unlocked path stage',
    }
  }

  const minScore =
    typeof stage.unlockMinScore === 'number' ? stage.unlockMinScore : null
  if (minScore !== null) {
    const earned = score ?? 0
    if (earned < minScore) {
      if (score !== null) {
        progress.stageScores = {
          ...(progress.stageScores || {}),
          [learningStageId]: earned,
        }
        progress.topicStats = bumpTopicStats(
          progress.topicStats,
          stage.suggestedTopics || [],
          earned,
        )
        progress.lastActivityAt = new Date()
        await progress.save()
      }
      return {
        advanced: false,
        message: `Score ${earned} below unlock minimum ${minScore}`,
      }
    }
  }

  if (score !== null) {
    progress.stageScores = {
      ...(progress.stageScores || {}),
      [learningStageId]: score,
    }
    progress.topicStats = bumpTopicStats(
      progress.topicStats,
      stage.suggestedTopics || [],
      score,
    )
  }

  // Queue remediation instead of advancing when score is soft-pass
  const topics = (stage.suggestedTopics || []).filter(Boolean)
  if (
    score !== null &&
    score < REMEDIATION_SCORE_THRESHOLD &&
    topics.length > 0 &&
    (stage.type === 'practice' || stage.type === 'mock_interview')
  ) {
    const weak = topics.slice(0, 3)
    const remId = randomUUID()
    const item = {
      id: remId,
      sourceStageId: learningStageId,
      title: `Focus: ${weak.join(', ')}`,
      topics: weak,
      departmentKey: stage.departmentKey || '',
      specializationKeys: stage.specializationKeys || [],
      interviewType: stage.interviewType || null,
      difficulty: stage.difficulty || 'Medium',
      totalQuestions: Math.min(10, stage.totalQuestions || 8),
      technicalQuestionRatio: stage.technicalQuestionRatio ?? 80,
      completed: false,
    }
    progress.remediationQueue = [...(progress.remediationQueue || []), item]
    progress.activeRemediationId = remId
    progress.lastActivityAt = new Date()
    await progress.save()
    await awardInterviewGamification({
      userId,
      score,
      questionsAnswered: input.questionsAnswered,
      skillsStage: stage.interviewType === 'behavioral' || stage.interviewType === 'hr',
    })
    return {
      advanced: false,
      remediationQueued: true,
      message: 'Focus practice recommended before unlocking the next stage',
    }
  }

  completedIds.add(learningStageId)
  progress.completedStageIds = [...completedIds].map((id) => new Types.ObjectId(id))
  progress.xpEarned = (progress.xpEarned || 0) + (score !== null && score >= 90 ? 40 : 25)

  const allStages = await StageModel.find({ pathId: learningPathId })
    .sort({ order: 1 })
    .lean()
  const next = allStages.find((s) => !completedIds.has(String(s._id)))
  if (next) {
    progress.currentStageId = next._id
    progress.status = 'in_progress'
  } else {
    progress.currentStageId = null
    progress.status = 'completed'
  }
  progress.lastActivityAt = new Date()
  await progress.save()

  await awardInterviewGamification({
    userId,
    score,
    questionsAnswered: input.questionsAnswered,
    skillsStage: stage.interviewType === 'behavioral' || stage.interviewType === 'hr',
  })

  return { advanced: true }
}
