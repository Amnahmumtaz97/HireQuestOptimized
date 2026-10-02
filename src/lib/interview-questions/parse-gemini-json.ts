import { z } from 'zod'
import type { RawAnswerKey } from '@/lib/interview-questions/answer-keys'

const codingTestSchema = z.object({
  input: z.union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.string(), z.any())]),
  expected: z.union([z.string(), z.number(), z.boolean(), z.array(z.any()), z.record(z.string(), z.any())]),
})

/** Models return key points as bare strings or objects with some text-ish field; both are accepted. */
const looseKeyPointSchema = z.union([z.string(), z.record(z.string(), z.unknown())])

const geminiItemSchema = z.object({
  question: z.string(),
  topic: z.string().optional(),
  type: z.enum(['technical', 'behavioral', 'hr']).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  requiresDiagram: z.boolean().optional(),
  kind: z.enum(['spoken', 'coding']).optional(),
  language: z.enum(['javascript', 'python']).optional(),
  starterCode: z.string().optional(),
  functionName: z.string().optional(),
  publicTests: z.array(codingTestSchema).optional(),
  hiddenTests: z.array(codingTestSchema).optional(),

  // Answer key: accepted in whatever shape the model produced — a malformed key
  // must never fail the whole batch. normalizeAnswerKey() coerces and trims it.
  rubric: z.string().optional().nullable(),
  keyPoints: z.array(looseKeyPointSchema).optional().nullable().catch(undefined),
  redFlags: z.array(z.unknown()).optional().nullable().catch(undefined),
  idealAnswerSummary: z.string().optional().nullable().catch(undefined),
  competency: z.string().optional().nullable().catch(undefined),
  expectedComplexity: z
    .union([z.object({ time: z.unknown().optional(), space: z.unknown().optional() }), z.string()])
    .optional()
    .nullable()
    .catch(undefined),
  edgeCases: z.array(z.unknown()).optional().nullable().catch(undefined),
  scaleHints: z.array(z.unknown()).optional().nullable().catch(undefined),
})

const geminiArraySchema = z.array(geminiItemSchema).min(1)

export function extractJsonArrayText(raw: string): string {
  const t = raw.trim()
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fence?.[1]) return fence[1].trim()
  const start = t.indexOf('[')
  const end = t.lastIndexOf(']')
  if (start >= 0 && end > start) return t.slice(start, end + 1)
  return t
}

function stringifyTestValue(v: unknown): string {
  if (typeof v === 'string') return v
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

export type ParsedGeminiQuestion = RawAnswerKey & {
  question: string
  topic?: string
  type?: 'technical' | 'behavioral' | 'hr'
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  requiresDiagram?: boolean
  kind?: 'spoken' | 'coding'
  language?: 'javascript' | 'python'
  starterCode?: string
  functionName?: string
  publicTests?: Array<{ input: string; expected: string }>
  hiddenTests?: Array<{ input: string; expected: string }>
  /** Model's own routing hint; validated against the session's kinds downstream. */
  rubric?: string | null
}

export function parseGeminiQuestionJsonArray(raw: string): ParsedGeminiQuestion[] {
  const jsonText = extractJsonArrayText(raw)
  const parsed = JSON.parse(jsonText) as unknown
  const items = geminiArraySchema.parse(parsed)
  return items.map((item) => ({
    question: item.question,
    topic: item.topic,
    type: item.type,
    difficulty: item.difficulty,
    requiresDiagram: item.requiresDiagram,
    kind: item.kind,
    language: item.language,
    starterCode: item.starterCode,
    functionName: item.functionName,
    publicTests: item.publicTests?.map((t) => ({
      input: stringifyTestValue(t.input),
      expected: stringifyTestValue(t.expected),
    })),
    hiddenTests: item.hiddenTests?.map((t) => ({
      input: stringifyTestValue(t.input),
      expected: stringifyTestValue(t.expected),
    })),
    rubric: item.rubric,
    keyPoints: item.keyPoints,
    redFlags: item.redFlags,
    idealAnswerSummary: item.idealAnswerSummary,
    competency: item.competency,
    expectedComplexity: item.expectedComplexity,
    edgeCases: item.edgeCases,
    scaleHints: item.scaleHints,
  }))
}
