import type { Difficulty } from '@/components/app/DifficultySelector'
import type { InterviewType } from '@/components/app/InterviewTypeSelector'

export type RoleCategoryConfig = {
  key: string
  label: string
  interviewTypes: string[]
  technicalTopics: string[]
  behavioralTopics: string[]
  technicalQuestionRatio: number
  durationEnabled: boolean
  durations: number[]
}

export type InterviewConfig = {
  _id: string
  industryKey: string
  industryLabel: string
  roleCategories: RoleCategoryConfig[]
}

export type InterviewQuestion = {
  type: 'technical' | 'behavioral'
  topic: string
  question: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export type InterviewSession = {
  _id: string
  industryKey: string
  roleCategoryKey: string
  interviewType: 'technical' | 'behavioral' | 'both'
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  totalQuestions: number
  durationMinutes?: number | null
  status: 'created' | 'in_progress' | 'completed'
  createdAt?: string
  questions?: InterviewQuestion[]
  questionSource?: 'gemini' | 'template'
  flaggedQuestionIndexes?: number[]
}

export type WizardStepKey = 'roleSelection' | 'topicsAndType' | 'experienceDifficulty' | 'reviewGenerate'

export type CreateInterviewDraft = {
  industryKey: string
  roleCategoryKey: string
  interviewType: InterviewType | null
  topics: string[]
  difficulty: Difficulty
  totalQuestions: number
  technicalQuestionRatio: number
  durationMinutes?: number | null
}

