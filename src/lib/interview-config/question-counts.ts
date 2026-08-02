/**
 * Single source of truth for question-count presets and valid ranges.
 */

/** Manual / resume wizard preset tiles. */
export const QUESTION_COUNT_PRESETS = [
  { value: 10, title: '10', subtitle: 'Quick (~5 min)' },
  { value: 20, title: '20', subtitle: 'Standard (~10 min)' },
  { value: 30, title: '30', subtitle: 'Thorough (~15 min)' },
] as const

export const QUESTION_COUNT_PRESET_VALUES = QUESTION_COUNT_PRESETS.map((p) => p.value)

/** Path / free-form create range. */
export const QUESTION_COUNT_MIN = 5
export const QUESTION_COUNT_MAX = 40
export const QUESTION_COUNT_DEFAULT = 20
export const QUESTION_COUNT_PATH_DEFAULT = 12

export function clampQuestionCount(n: number): number {
  if (!Number.isFinite(n)) return QUESTION_COUNT_DEFAULT
  return Math.min(QUESTION_COUNT_MAX, Math.max(QUESTION_COUNT_MIN, Math.round(n)))
}

export function isValidQuestionCount(n: number): boolean {
  return Number.isInteger(n) && n >= QUESTION_COUNT_MIN && n <= QUESTION_COUNT_MAX
}
