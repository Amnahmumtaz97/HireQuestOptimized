import type { InterviewTypeKind, InterviewTypeStored } from '@/lib/interview-types'

export type InterviewSetupGenerationContext = {
  categories: string[]
  topics: string[]
  topicCategories: Record<string, string>
  difficulty?: string | null
  interviewRoundType?: string | null
  preferredQuestionFormat?: string | null
  targetCompanyType?: string | null
  focusAreas: string[]
  language: string
  targetRole?: string | null
  companies?: string[]
  achievements?: string[]
}

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
  /** Optional resume-derived context persisted on the session. */
  resumeContext?: {
    name?: string | null
    yearsExperience?: number | null
    seniorityLevel?: string | null
    domain?: string | null
    skills?: string[]
    projects?: Array<{ name: string; description: string; technologies?: string[] }>
  } | null
  learningPathTitle?: string | null
  learningStageTitle?: string | null
  /** Stage type when linked to a learning path (practice vs mock_interview, etc.). */
  learningStageType?: string | null
  /** Confirmed InterviewSetup — when set, generation must use ONLY these topics. */
  interviewSetup?: InterviewSetupGenerationContext | null
  /**
   * When true, curated coding / system-design / generic banks may be used if Gemini
   * fails or GEMINI_API_KEY is missing. Production routes leave this unset/false so
   * every interview type requires Gemini (`questionSource: "gemini"`).
   */
  allowTemplateFallback?: boolean
  /** Top-level coding preference (also mirrored on interviewSetup.preferredQuestionFormat). */
  preferredQuestionFormat?: string | null
  /** Typed config snapshot from session (coding categories, HR sections, mixed weights, …). */
  configPayload?: Record<string, unknown> | null
}

// Shared generation params; Gemini prompts live in lib/gemini.
