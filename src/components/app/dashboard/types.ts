import type { Difficulty } from '@/components/app/DifficultySelector'
import type { InterviewType } from '@/components/app/InterviewTypeSelector'
import type { DepartmentConfig } from '@/lib/interview-catalog/types'

export type RoleCategoryConfig = {
  key: string
  label: string
  interviewTypes: string[]
  technicalTopics: string[]
  behavioralTopics: string[]
  hrTopics?: string[]
  technicalQuestionRatio: number
  durationEnabled: boolean
  durations: number[]
}

/** @deprecated Use DepartmentConfig from interview-catalog */
export type InterviewConfig = {
  _id: string
  industryKey: string
  industryLabel: string
  roleCategories: RoleCategoryConfig[]
}

export type InterviewQuestion = {
  type: 'technical' | 'behavioral' | 'hr'
  topic: string
  question: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export type InterviewSession = {
  _id: string
  industryKey: string
  departmentKey?: string
  departmentKeys?: string[]
  selectAllDepartments?: boolean
  industryKeys?: string[]
  selectAllIndustries?: boolean
  roleCategoryKey: string
  specializationKey?: string
  specializationRefs?: string[]
  roleRefs?: string[]
  specializationKeys?: string[]
  roleCategoryKeys?: string[]
  selectAllSpecializations?: boolean
  selectAllRoleCategories?: boolean
  selectAllTopics?: boolean
  interviewType: 'technical' | 'behavioral' | 'both' | 'hr' | 'coding' | 'system_design' | 'mixed'
  interviewTypes?: Array<'technical' | 'behavioral' | 'hr' | 'coding' | 'system_design'>
  topics: string[]
  codingCategories?: string[]
  behavioralCompetencies?: string[]
  systemDesignTopics?: string[]
  hrSections?: string[]
  difficulty: Difficulty
  totalQuestions: number
  durationMinutes?: number | null
  status: 'created' | 'in_progress' | 'completed'
  createdAt?: string
  questions?: InterviewQuestion[]
  questionSource?: 'gemini' | 'template'
  flaggedQuestionIndexes?: number[]
}

export type WizardStepKey =
  | 'interviewType'
  | 'department'
  | 'specialization'
  | 'topics'
  | 'difficulty'
  | 'generate'

export type CreateInterviewDraft = {
  departmentKey: string
  specializationKey: string
  specializationRefs: string[]
  specializationKeys: string[]
  selectAllSpecializations: boolean
  selectAllTopics: boolean
  interviewType: InterviewType | null
  topics: string[]
  difficulty: Difficulty
  totalQuestions: number
  technicalQuestionRatio: number
  durationMinutes?: number | null
  /** Legacy aliases for local draft restore */
  industryKey?: string
  departmentKeys?: string[]
  industryKeys?: string[]
  selectAllDepartments?: boolean
  selectAllIndustries?: boolean
  roleCategoryKey?: string
  roleRefs?: string[]
  roleCategoryKeys?: string[]
  selectAllRoleCategories?: boolean
}

export type { DepartmentConfig }

