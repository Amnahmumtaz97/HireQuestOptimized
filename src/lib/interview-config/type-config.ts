import { z } from 'zod'
import { CODING_CATEGORIES, CODING_CATEGORY_SET } from '@/lib/interview-config/banks/coding-categories'
import {
  BEHAVIORAL_COMPETENCIES,
  BEHAVIORAL_COMPETENCY_SET,
} from '@/lib/interview-config/banks/behavioral-competencies'
import { HR_SECTIONS, HR_SECTION_KEYS, HR_SECTION_SET, hrSectionLabel } from '@/lib/interview-config/banks/hr-sections'
import {
  SYSTEM_DESIGN_TOPICS,
  SYSTEM_DESIGN_TOPIC_SET,
} from '@/lib/interview-config/banks/system-design-topics'
import {
  STORED_INTERVIEW_TYPE_KEYS,
  type InterviewTypeKey,
} from '@/lib/interview-config/interview-types'

/** @deprecated Prefer INTERVIEW_TYPE_KEYS / STORED_INTERVIEW_TYPE_KEYS from interview-types.ts */
export const PRACTICE_INTERVIEW_TYPES = STORED_INTERVIEW_TYPE_KEYS

export type PracticeInterviewType = (typeof PRACTICE_INTERVIEW_TYPES)[number]

export type { InterviewTypeKey }

export type MixKind = 'technical' | 'coding' | 'behavioral' | 'hr' | 'system_design'

const mixKindSchema = z.enum(['technical', 'coding', 'behavioral', 'hr', 'system_design'])

const mixSectionSchema = z.object({
  kind: mixKindSchema,
  weight: z.number().int().min(0).max(100),
  /** Flattened labels for that slice (topics / categories / competencies / section labels). */
  selection: z.array(z.string().trim().min(1)).min(1),
})

export const interviewConfigByTypeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('technical'),
    departmentKey: z.string().trim().min(1),
    specializationRefs: z.array(z.string().trim().min(1)).min(1),
    topics: z.array(z.string().trim().min(1)).min(1),
    selectAllTopics: z.boolean().optional(),
  }),
  z.object({
    type: z.literal('coding'),
    categories: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    type: z.literal('behavioral'),
    competencies: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    type: z.literal('hr'),
    sections: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    type: z.literal('system_design'),
    topics: z.array(z.string().trim().min(1)).min(1),
  }),
  z.object({
    type: z.literal('mixed'),
    sections: z.array(mixSectionSchema).min(1),
  }),
])

export type InterviewConfigByType = z.infer<typeof interviewConfigByTypeSchema>

export function validateBankSelection(
  type: Exclude<PracticeInterviewType, 'both' | 'mixed' | 'technical'>,
  labels: string[],
): string | null {
  if (labels.length === 0) return 'Select at least one option'
  if (type === 'coding') {
    const bad = labels.filter((l) => !CODING_CATEGORY_SET.has(l))
    if (bad.length) return `Invalid coding categories: ${bad.slice(0, 3).join(', ')}`
  }
  if (type === 'behavioral') {
    const bad = labels.filter((l) => !BEHAVIORAL_COMPETENCY_SET.has(l))
    if (bad.length) return `Invalid competencies: ${bad.slice(0, 3).join(', ')}`
  }
  if (type === 'hr') {
    const bad = labels.filter((l) => !HR_SECTION_SET.has(l))
    if (bad.length) return `Invalid HR sections: ${bad.slice(0, 3).join(', ')}`
  }
  if (type === 'system_design') {
    const bad = labels.filter((l) => !SYSTEM_DESIGN_TOPIC_SET.has(l))
    if (bad.length) return `Invalid system design topics: ${bad.slice(0, 3).join(', ')}`
  }
  return null
}

/** Flatten confirmed selection into the session `topics` array used by generation. */
export function selectionLabels(config: InterviewConfigByType): string[] {
  switch (config.type) {
    case 'technical':
      return [...new Set(config.topics.map((t) => t.trim()).filter(Boolean))]
    case 'coding':
      return [...new Set(config.categories.map((t) => t.trim()).filter(Boolean))]
    case 'behavioral':
      return [...new Set(config.competencies.map((t) => t.trim()).filter(Boolean))]
    case 'hr':
      return [
        ...new Set(
          config.sections
            .map((k) => hrSectionLabel(k.trim()))
            .filter(Boolean),
        ),
      ]
    case 'system_design':
      return [...new Set(config.topics.map((t) => t.trim()).filter(Boolean))]
    case 'mixed':
      return [
        ...new Set(
          config.sections.flatMap((s) => {
            if (s.kind === 'hr') {
              return s.selection.map((k) =>
                HR_SECTION_SET.has(k) ? hrSectionLabel(k) : k.trim(),
              )
            }
            return s.selection.map((t) => t.trim()).filter(Boolean)
          }),
        ),
      ]
    default:
      return []
  }
}

export function preferredFormatForType(
  type: string,
): 'coding' | null {
  return type === 'coding' ? 'coding' : null
}

/** Placeholder department/spec for non-catalog interview types (session required fields). */
export const NON_CATALOG_SCOPE = {
  departmentKey: 'practice',
  specializationKey: 'general',
} as const

export {
  CODING_CATEGORIES,
  BEHAVIORAL_COMPETENCIES,
  HR_SECTIONS,
  HR_SECTION_KEYS,
  SYSTEM_DESIGN_TOPICS,
}
