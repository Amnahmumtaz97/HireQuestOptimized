/**
 * Single source of truth for interview difficulty.
 * Session/API use Adaptive; setup legacy "Mixed" maps to Adaptive.
 */

export const SESSION_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Adaptive'] as const
export type SessionDifficulty = (typeof SESSION_DIFFICULTIES)[number]

/**
 * Setup / resume configure may use Adaptive or legacy Mixed (= Adaptive AI).
 * Prefer Adaptive in new UI; Mixed is accepted for backwards compatibility.
 */
export const SETUP_DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Adaptive', 'Mixed'] as const
export type SetupDifficulty = (typeof SETUP_DIFFICULTIES)[number]

export const SESSION_DIFFICULTY_SET = new Set<string>(SESSION_DIFFICULTIES)

export const DIFFICULTY_UI_OPTIONS: Array<{
  key: SessionDifficulty
  label: string
  subtitle: string
}> = [
  { key: 'Easy', label: 'Easy', subtitle: 'Fundamentals & basics' },
  { key: 'Medium', label: 'Medium', subtitle: 'Application & analysis' },
  { key: 'Hard', label: 'Hard', subtitle: 'Advanced & tricky' },
  { key: 'Adaptive', label: 'Adaptive AI', subtitle: 'AI adjusts difficulty per question' },
]

/** Map any user/setup difficulty string to a session difficulty. */
export function normalizeSessionDifficulty(
  value: string | null | undefined,
  fallback: SessionDifficulty = 'Adaptive',
): SessionDifficulty {
  if (!value) return fallback
  const k = value.trim()
  if (k === 'Mixed' || k.toLowerCase() === 'mixed') return 'Adaptive'
  if (SESSION_DIFFICULTY_SET.has(k)) return k as SessionDifficulty
  const lower = k.toLowerCase()
  if (lower === 'easy') return 'Easy'
  if (lower === 'medium') return 'Medium'
  if (lower === 'hard') return 'Hard'
  if (lower === 'adaptive') return 'Adaptive'
  return fallback
}

export function formatSessionDifficultyLabel(value: string | null | undefined): string {
  const d = normalizeSessionDifficulty(value, 'Adaptive')
  if (d === 'Adaptive') return 'Adaptive AI'
  return d
}
