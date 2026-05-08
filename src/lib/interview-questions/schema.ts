import { z } from 'zod'

export const interviewQuestionSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  type: z.enum(['technical', 'behavioral']),
  topic: z.string().trim().min(1).max(200),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  /** data:image/...;base64,... from Gemini image model when the question needs a figure */
  illustrationDataUrl: z.string().min(1).max(2_500_000).optional().nullable(),
  /** True when this item was meant to include a figure (candidate is never asked to draw). */
  illustrationRequired: z.boolean().optional(),
})

export const interviewQuestionsArraySchema = z.array(interviewQuestionSchema).min(1)

export type InterviewQuestionItem = z.infer<typeof interviewQuestionSchema>
