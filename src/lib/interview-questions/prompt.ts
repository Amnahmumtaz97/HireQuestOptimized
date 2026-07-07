export type InterviewGenerationParams = {
  industryKey: string
  industryKeys?: string[]
  industryLabels?: string[]
  roleCategoryKey: string
  roleCategoryKeys?: string[]
  roleCategoryLabels?: string[]
  interviewType: 'technical' | 'behavioral' | 'both'
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive'
  totalQuestions: number
  technicalQuestionRatio: number
}

// Shared generation params; Gemini prompts live in lib/gemini.
