/**
 * Single source of truth for interview practice types (UI order, labels, storage).
 * Components and APIs should import from here — do not redefine option lists inline.
 */

export const INTERVIEW_TYPE_KEYS = [
  'technical',
  'coding',
  'system_design',
  'behavioral',
  'hr',
  'mixed',
] as const

/** Canonical UI / create-flow types (excludes legacy `both`). */
export type InterviewTypeKey = (typeof INTERVIEW_TYPE_KEYS)[number]

/** Values accepted in persistence / Zod (includes legacy `both`). */
export const STORED_INTERVIEW_TYPE_KEYS = [...INTERVIEW_TYPE_KEYS, 'both'] as const
export type StoredInterviewTypeKey = (typeof STORED_INTERVIEW_TYPE_KEYS)[number]

export const INTERVIEW_TYPE_LABELS: Record<StoredInterviewTypeKey, string> = {
  technical: 'Technical',
  coding: 'Coding',
  system_design: 'System Design',
  behavioral: 'Behavioral',
  hr: 'Screening HR',
  mixed: 'Mixed',
  both: 'Mixed',
}

/** Fixed display order for selectors across Manual / Resume / Path. */
export const INTERVIEW_TYPE_UI_ORDER: InterviewTypeKey[] = [...INTERVIEW_TYPE_KEYS]

export const INTERVIEW_TYPE_SET = new Set<string>(STORED_INTERVIEW_TYPE_KEYS)

export function isStoredInterviewType(value: string): value is StoredInterviewTypeKey {
  return INTERVIEW_TYPE_SET.has(value)
}

/** Normalize legacy `both` → `mixed` for writes. */
export function normalizeStoredInterviewType(
  value: string | null | undefined,
): InterviewTypeKey | null {
  if (!value) return null
  const k = value.trim().toLowerCase()
  if (k === 'both') return 'mixed'
  if ((INTERVIEW_TYPE_KEYS as readonly string[]).includes(k)) return k as InterviewTypeKey
  return null
}

export function formatInterviewTypeKeyLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const k = value.trim().toLowerCase()
  if (isStoredInterviewType(k)) return INTERVIEW_TYPE_LABELS[k]
  return value.replace(/^\w/, (c) => c.toUpperCase())
}

/** Types that use Mongo catalog Department → Specialization → Topics. */
export function interviewTypeNeedsCatalog(type: string | null | undefined): boolean {
  return normalizeStoredInterviewType(type) === 'technical'
}

/** Types that use static banks (coding categories, competencies, HR sections, SD topics). */
export function interviewTypeUsesStaticBank(type: string | null | undefined): boolean {
  const t = normalizeStoredInterviewType(type)
  return (
    t === 'coding' ||
    t === 'behavioral' ||
    t === 'hr' ||
    t === 'system_design' ||
    t === 'mixed'
  )
}

/** Default mix weight template (must sum to 100). */
export const DEFAULT_MIX_WEIGHTS = {
  coding: 40,
  behavioral: 30,
  hr: 20,
  system_design: 10,
} as const
