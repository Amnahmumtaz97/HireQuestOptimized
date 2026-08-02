export type StageType = 'concept' | 'practice' | 'mock_interview' | 'ai_feedback'

export type PathCategory =
  | 'technology'
  | 'role'
  | 'company'
  | 'skills'
  | 'dsa'
  | 'system_design'
  | 'project'
  | 'resume'

export type LearningStage = {
  id: string
  pathId: string
  order: number
  title: string
  type: StageType
  contentRef: string
  unlockMinScore: number | null
  level?: number | null
  levelLabel?: string | null
  departmentKey?: string
  specializationKeys?: string[]
  interviewType?: 'technical' | 'behavioral' | 'both' | 'hr' | null
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Adaptive' | null
  suggestedTopics?: string[]
  totalQuestions?: number | null
  technicalQuestionRatio?: number | null
  isRemediation?: boolean
}

export type LearningPath = {
  id: string
  title: string
  description: string
  targetAudience: string
  slug: string | null
  category: PathCategory
  subcategory?: string
  tags?: string[]
  estimatedInterviews?: number | null
  difficultyLabel?: 'Beginner' | 'Intermediate' | 'Advanced' | null
  estimatedMinutes?: number | null
  isFeatured?: boolean
  publishedAt?: string | null
  ownerUserId?: string | null
  stages: LearningStage[]
}

export type TopicStat = {
  attempts: number
  totalScore: number
  avgScore: number
}

export type RemediationQueueItem = {
  id: string
  sourceStageId: string
  title: string
  topics: string[]
  departmentKey: string
  specializationKeys: string[]
  interviewType: 'technical' | 'behavioral' | 'both' | 'hr' | null
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive' | null
  totalQuestions: number
  technicalQuestionRatio: number
  completed: boolean
}

export type ProgressAnalytics = {
  completionPercent: number
  currentLevel: number | null
  currentLevelLabel: string | null
  strongestStage: { stageId: string; title: string; score: number } | null
  weakestStage: { stageId: string; title: string; score: number } | null
  weakestTopics: Array<{ topic: string; attempts: number; avgScore: number }>
  strongestTopics: Array<{ topic: string; attempts: number; avgScore: number }>
  recommendedTopics: string[]
  activeRemediation: RemediationQueueItem | null
  xpEarned: number
}

export type UserPathProgress = {
  id: string
  userId: string
  pathId: string
  currentStageId: string | null
  completedStageIds: string[]
  stageScores: Record<string, number>
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: string
  lastActivityAt: string
  topicStats?: Record<string, TopicStat>
  remediationQueue?: RemediationQueueItem[]
  activeRemediationId?: string | null
  xpEarned?: number
  analytics?: ProgressAnalytics
}

export type StageUiState = 'completed' | 'current' | 'locked'

export function getStageUiState(
  stage: LearningStage,
  progress: UserPathProgress | null,
): StageUiState {
  if (!progress) return stage.order === 1 ? 'current' : 'locked'
  if (progress.completedStageIds.includes(stage.id)) return 'completed'
  if (progress.status === 'completed') return 'completed'
  if (progress.currentStageId === stage.id) return 'current'
  if (!progress.currentStageId && stage.order === 1) return 'current'
  return 'locked'
}
