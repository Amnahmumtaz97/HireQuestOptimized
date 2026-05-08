export type InterviewGenerationParams = {
  industryKey: string
  roleCategoryKey: string
  interviewType: 'technical' | 'behavioral' | 'both'
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  totalQuestions: number
  technicalQuestionRatio: number
}

// Shared generation params; Gemini prompts live in lib/gemini.
