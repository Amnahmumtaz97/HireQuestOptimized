import { z } from 'zod'
import { extractJsonArrayText } from '@/lib/interview-questions/parse-gemini-json'

/**
 * §9.6 — what the judge returns for one question. Everything is an observation
 * with evidence; nothing here is a score. Validated strictly; invalid → retry.
 */

// Models routinely emit numbers as strings ("3", "0"); coerce rather than reject.
const index = z.coerce.number().int().min(0)
/** Quotes are trimmed, never rejected, for length: a long quote still verifies against the answer. */
const evidence = z
  .string()
  .nullable()
  .optional()
  .transform((v) => (typeof v === 'string' ? v.slice(0, 600) : v))

const keyPointObservation = z.object({
  index,
  status: z.enum(['hit', 'partial', 'missed']),
  evidence,
})

const errorObservation = z.object({
  severity: z.enum(['minor', 'major']),
  claim: z.string().transform((s) => s.slice(0, 300)),
  evidence,
})

const redFlagObservation = z.object({
  index,
  evidence,
})

const edgeCaseObservation = z.object({
  index,
  status: z.enum(['hit', 'missed']),
  evidence,
})

const alternativeObservation = z.object({
  alternative: z.string().transform((s) => s.slice(0, 200)),
  reason: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (typeof v === 'string' ? v.slice(0, 300) : v)),
  evidence,
})

const level = z.coerce.number().min(0).max(4)

export const judgeObservationSchema = z.object({
  id: index,
  keyPoints: z.array(keyPointObservation).max(12).default([]),
  errors: z.array(errorObservation).max(10).default([]),
  redFlagsObserved: z.array(redFlagObservation).max(10).default([]),
  levels: z.record(z.string(), level).default({}),
  /** behavioral: the sentences that form each STAR element */
  segments: z
    .object({
      situation: evidence,
      task: evidence,
      action: evidence,
      result: evidence,
    })
    .partial()
    .optional(),
  /** behavioral: judge confirms there is no specific past event */
  hypothetical: z.boolean().optional(),
  /** system_design */
  alternatives: z.array(alternativeObservation).max(8).optional(),
  /** coding */
  complexity: z.object({ time: z.string().max(40), space: z.string().max(40) }).optional(),
  edgeCases: z.array(edgeCaseObservation).max(10).optional(),
  /** answer is not in the interview language */
  languageMismatch: z.boolean().optional(),
  tips: z
    .array(z.string())
    .default([])
    .transform((tips) => tips.slice(0, 5).map((t) => t.slice(0, 400))),
})

export type JudgeObservation = z.infer<typeof judgeObservationSchema>

export const judgeBatchSchema = z.array(judgeObservationSchema).min(1)

export class JudgeParseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'JudgeParseError'
  }
}

export function parseJudgeBatch(raw: string, expectedIds: number[]): JudgeObservation[] {
  let json: unknown
  try {
    json = JSON.parse(extractJsonArrayText(raw))
  } catch (e) {
    throw new JudgeParseError(`Judge returned invalid JSON: ${(e as Error).message}`)
  }
  const result = judgeBatchSchema.safeParse(json)
  if (!result.success) {
    throw new JudgeParseError(`Judge output failed validation: ${result.error.issues[0]?.message ?? 'unknown'}`)
  }
  const byId = new Map(result.data.map((o) => [o.id, o]))
  const missing = expectedIds.filter((id) => !byId.has(id))
  if (missing.length > 0) {
    throw new JudgeParseError(`Judge output is missing ids: ${missing.join(', ')}`)
  }
  return expectedIds.map((id) => byId.get(id) as JudgeObservation)
}
