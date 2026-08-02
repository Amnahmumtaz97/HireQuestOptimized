/** Selectable interview practice kinds (legacy multi-select helpers). */
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_KEYS,
  type InterviewTypeKey,
} from '@/lib/interview-config/interview-types'

export type InterviewTypeKind = Exclude<InterviewTypeKey, 'mixed'>

/** Stored session/API value. */
export type InterviewTypeStored =
  | InterviewTypeKind
  | 'both'
  | 'mixed'

export const INTERVIEW_TYPE_KINDS: InterviewTypeKind[] = INTERVIEW_TYPE_KEYS.filter(
  (k): k is InterviewTypeKind => k !== 'mixed',
)

const KIND_LABELS: Record<InterviewTypeKind, string> = {
  technical: INTERVIEW_TYPE_LABELS.technical,
  behavioral: INTERVIEW_TYPE_LABELS.behavioral,
  hr: INTERVIEW_TYPE_LABELS.hr,
  coding: INTERVIEW_TYPE_LABELS.coding,
  system_design: INTERVIEW_TYPE_LABELS.system_design,
}

export function normalizeInterviewTypeKinds(
  kinds: readonly InterviewTypeKind[] | null | undefined,
): InterviewTypeKind[] {
  if (!kinds?.length) return []
  const order = new Map(INTERVIEW_TYPE_KINDS.map((k, i) => [k, i]))
  return [...new Set(kinds.filter((k) => order.has(k)))].sort(
    (a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0),
  )
}

/** Encode UI selection for persistence (`both`/`mixed` = multi-kind mix). */
export function encodeInterviewType(kinds: readonly InterviewTypeKind[]): InterviewTypeStored | null {
  const normalized = normalizeInterviewTypeKinds(kinds)
  if (normalized.length === 0) return null
  if (normalized.length === 1) return normalized[0]
  return 'mixed'
}

/** Resolve concrete kinds from stored type + optional kinds array. */
export function decodeInterviewTypeKinds(
  interviewType: InterviewTypeStored | string | null | undefined,
  interviewTypes?: readonly InterviewTypeKind[] | null,
): InterviewTypeKind[] {
  const fromArray = normalizeInterviewTypeKinds(interviewTypes ?? undefined)
  if (fromArray.length > 0) return fromArray
  if (!interviewType) return []
  if (interviewType === 'both' || interviewType === 'mixed') return ['technical', 'behavioral']
  if (
    interviewType === 'technical' ||
    interviewType === 'behavioral' ||
    interviewType === 'hr' ||
    interviewType === 'coding' ||
    interviewType === 'system_design'
  ) {
    return [interviewType]
  }
  return []
}

export function formatInterviewTypeKindsLabel(
  kinds: readonly InterviewTypeKind[] | null | undefined,
): string {
  const normalized = normalizeInterviewTypeKinds(kinds)
  if (normalized.length === 0) return '—'
  return normalized.map((k) => KIND_LABELS[k]).join(', ')
}

export function formatInterviewTypeStoredLabel(
  interviewType: InterviewTypeStored | string | null | undefined,
  interviewTypes?: readonly InterviewTypeKind[] | null,
): string {
  const kinds = decodeInterviewTypeKinds(
    interviewType as InterviewTypeStored | null | undefined,
    interviewTypes,
  )
  if (kinds.length > 0 && interviewType !== 'coding' && interviewType !== 'system_design') {
    if (interviewType === 'mixed' || interviewType === 'both') {
      return formatInterviewTypeKindsLabel(kinds)
    }
  }
  if (interviewType == null || interviewType === '') return '—'
  const k = String(interviewType).trim().toLowerCase()
  if (k === 'both' || k === 'mixed') return INTERVIEW_TYPE_LABELS.mixed
  if (k in INTERVIEW_TYPE_LABELS) {
    return INTERVIEW_TYPE_LABELS[k as keyof typeof INTERVIEW_TYPE_LABELS]
  }
  return String(interviewType).replace(/^\w/, (c) => c.toUpperCase())
}

/** Whether the tech/behavioral (or tech/other) ratio slider applies. */
export function needsQuestionMixRatio(kinds: readonly InterviewTypeKind[]): boolean {
  const normalized = normalizeInterviewTypeKinds(kinds)
  return normalized.length > 1 && normalized.includes('technical')
}
