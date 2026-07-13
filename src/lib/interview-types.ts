/** Selectable interview practice kinds (UI multi-select). */
export type InterviewTypeKind = 'technical' | 'behavioral' | 'hr'

/** Stored session/API value: a single kind, or `both` when multiple kinds are selected. */
export type InterviewTypeStored = InterviewTypeKind | 'both'

export const INTERVIEW_TYPE_KINDS: InterviewTypeKind[] = ['technical', 'behavioral', 'hr']

const KIND_LABELS: Record<InterviewTypeKind, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  hr: 'HR Interview',
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

/** Encode UI selection for persistence (`both` = any multi-kind mix). */
export function encodeInterviewType(kinds: readonly InterviewTypeKind[]): InterviewTypeStored | null {
  const normalized = normalizeInterviewTypeKinds(kinds)
  if (normalized.length === 0) return null
  if (normalized.length === 1) return normalized[0]
  return 'both'
}

/** Resolve concrete kinds from stored type + optional kinds array. */
export function decodeInterviewTypeKinds(
  interviewType: InterviewTypeStored | null | undefined,
  interviewTypes?: readonly InterviewTypeKind[] | null,
): InterviewTypeKind[] {
  const fromArray = normalizeInterviewTypeKinds(interviewTypes ?? undefined)
  if (fromArray.length > 0) return fromArray
  if (!interviewType) return []
  if (interviewType === 'both') return ['technical', 'behavioral']
  if (interviewType === 'technical' || interviewType === 'behavioral' || interviewType === 'hr') {
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
  if (kinds.length > 0) return formatInterviewTypeKindsLabel(kinds)
  if (interviewType == null || interviewType === '') return '—'
  const k = String(interviewType).trim().toLowerCase()
  if (k === 'both') return 'Technical, Behavioral'
  if (k === 'technical') return 'Technical'
  if (k === 'behavioral') return 'Behavioral'
  if (k === 'hr') return 'HR Interview'
  return String(interviewType).replace(/^\w/, (c) => c.toUpperCase())
}

/** Whether the tech/behavioral (or tech/other) ratio slider applies. */
export function needsQuestionMixRatio(kinds: readonly InterviewTypeKind[]): boolean {
  const normalized = normalizeInterviewTypeKinds(kinds)
  return normalized.length > 1 && normalized.includes('technical')
}
