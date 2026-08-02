import { z } from 'zod'

const codingTestSchema = z.object({
  input: z.string().max(2000),
  expected: z.string().max(2000),
})

export const interviewQuestionSchema = z.object({
  question: z.string().trim().min(1).max(4000),
  type: z.enum(['technical', 'behavioral', 'hr']),
  topic: z.string().trim().min(1).max(200),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  /** data:image/...;base64,... from Gemini image model when the question needs a figure */
  illustrationDataUrl: z.string().min(1).max(2_500_000).optional().nullable(),
  /** True when this item was meant to include a figure (candidate is never asked to draw). */
  illustrationRequired: z.boolean().optional(),
  kind: z.enum(['spoken', 'coding']).optional().default('spoken'),
  language: z.enum(['javascript', 'python']).optional(),
  starterCode: z.string().max(20_000).optional(),
  functionName: z.string().max(80).optional(),
  publicTests: z.array(codingTestSchema).max(12).optional(),
  hiddenTests: z.array(codingTestSchema).max(12).optional(),
})

export const interviewQuestionsArraySchema = z.array(interviewQuestionSchema).min(1)

export type InterviewQuestionItem = z.infer<typeof interviewQuestionSchema>
