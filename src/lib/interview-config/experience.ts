/**
 * Single source of truth for seniority / experience selectors.
 */

export const SENIORITY_LEVELS = ['junior', 'mid', 'senior'] as const
export type SeniorityLevel = (typeof SENIORITY_LEVELS)[number]

export const SENIORITY_UI_OPTIONS: Array<{ key: SeniorityLevel; label: string }> = [
  { key: 'junior', label: 'Junior' },
  { key: 'mid', label: 'Mid' },
  { key: 'senior', label: 'Senior' },
]

export const SENIORITY_SET = new Set<string>(SENIORITY_LEVELS)

export function isSeniorityLevel(value: string | null | undefined): value is SeniorityLevel {
  return Boolean(value && SENIORITY_SET.has(value))
}
