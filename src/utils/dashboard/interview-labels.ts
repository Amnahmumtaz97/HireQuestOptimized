/** Consistent Title Case labels for session metadata (match difficulty style). */

const TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  both: 'Both',
}

const DIFF_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function formatInterviewTypeLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const k = value.trim().toLowerCase()
  if (TYPE_LABELS[k]) return TYPE_LABELS[k]
  return value.replace(/^\w/, (c) => c.toUpperCase())
}

export function formatDifficultyLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const k = value.trim().toLowerCase()
  if (DIFF_LABELS[k]) return DIFF_LABELS[k]
  return value.replace(/^\w/, (c) => c.toUpperCase())
}
