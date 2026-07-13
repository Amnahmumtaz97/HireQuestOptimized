import type { InterviewTypeKind, InterviewTypeStored } from '@/lib/interview-types'

export type InterviewGenerationParams = {
  industryKey: string
  industryKeys?: string[]
  industryLabels?: string[]
  roleCategoryKey: string
  roleCategoryKeys?: string[]
  roleCategoryLabels?: string[]
  interviewType: InterviewTypeStored
  /** Concrete kinds when interviewType is `both` (multi-select). */
  interviewTypes?: InterviewTypeKind[]
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive'
  totalQuestions: number
  technicalQuestionRatio: number
}

// Shared generation params; Gemini prompts live in lib/gemini.
