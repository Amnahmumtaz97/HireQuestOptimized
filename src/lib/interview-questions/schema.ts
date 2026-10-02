import { z } from 'zod'

const codingTestSchema = z.object({
  input: z.string().max(2000),
  expected: z.string().max(2000),
})

export const rubricSchema = z.enum(['technical', 'coding', 'behavioral', 'system_design', 'hr'])

const keyPointSchema = z.object({
  text: z.string().trim().min(1).max(300),
  /** system_design only: requirements | components | scale | tradeoffs */
  dimension: z.string().trim().max(40).optional(),
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

  // Answer key + routing, decided at generation time (EVALUATION_PLAN §4, §7).
  // These fields are the answer key: never sent to the browser while a session is open.
  rubric: rubricSchema.optional(),
  keyPoints: z.array(keyPointSchema).max(8).optional(),
  redFlags: z.array(z.string().trim().min(1).max(300)).max(6).optional(),
  idealAnswerSummary: z.string().trim().max(600).optional(),
  /** behavioral */
  competency: z.string().trim().max(120).optional(),
  /** coding */
  expectedComplexity: z.object({ time: z.string().max(40), space: z.string().max(40) }).optional(),
  /** coding */
  edgeCases: z.array(z.string().trim().min(1).max(200)).max(8).optional(),
  /** system_design */
  scaleHints: z.array(z.string().trim().min(1).max(200)).max(6).optional(),
})

export const interviewQuestionsArraySchema = z.array(interviewQuestionSchema).min(1)

export type InterviewQuestionItem = z.infer<typeof interviewQuestionSchema>
