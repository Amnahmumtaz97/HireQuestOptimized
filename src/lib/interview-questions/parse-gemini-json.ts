import { z } from 'zod'

const geminiItemSchema = z.object({
  question: z.string(),
  topic: z.string().optional(),
  type: z.enum(['technical', 'behavioral', 'hr']).optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
  requiresDiagram: z.boolean().optional(),
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

export type ParsedGeminiQuestion = {
  question: string
  topic?: string
  type?: 'technical' | 'behavioral' | 'hr'
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  requiresDiagram?: boolean
}

export function parseGeminiQuestionJsonArray(raw: string): ParsedGeminiQuestion[] {
  const jsonText = extractJsonArrayText(raw)
  const parsed = JSON.parse(jsonText) as unknown
  return geminiArraySchema.parse(parsed)
}
