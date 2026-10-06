/**
 * Interview duration options (minutes), tied to question count.
 * Minimum pace: 1.5 minutes per question.
 */

import {
  QUESTION_COUNT_DEFAULT,
  QUESTION_COUNT_PRESET_VALUES,
} from '@/lib/interview-config/question-counts'

/** Minutes of interview time required per question. */
export const MIN_MINUTES_PER_QUESTION = 1.5

export const DURATION_MAX = 180

/** Absolute floor when question count is at its minimum (5 × 1.5). */
export const DURATION_MIN = Math.ceil(5 * MIN_MINUTES_PER_QUESTION)

/** Default question count is 20 → minimum / recommended mid option is 30. */
export const DURATION_DEFAULT = 30

/**
 * Exactly three duration choices per wizard question-count preset.
 * All values are ≥ questionCount × 1.5.
 */
export const DURATION_OPTIONS_BY_QUESTION_COUNT: Record<number, readonly [number, number, number]> = {
  10: [15, 20, 25],
  20: [30, 35, 40],
  30: [45, 50, 60],
}

/** Fallback when no question count is known (matches 20-question preset). */
export const DURATION_OPTIONS_DEFAULT = DURATION_OPTIONS_BY_QUESTION_COUNT[QUESTION_COUNT_DEFAULT]

export function minDurationForQuestionCount(questionCount: number): number {
  if (!Number.isFinite(questionCount) || questionCount <= 0) {
    return DURATION_MIN
  }
  return Math.ceil(questionCount * MIN_MINUTES_PER_QUESTION)
}

export function isValidDurationMinutes(n: number): boolean {
  return Number.isInteger(n) && n >= DURATION_MIN && n <= DURATION_MAX
}

/**
 * Server/client rule: duration must be an integer minute value and
 * at least 1.5 minutes per question.
 */
export function isValidDurationForQuestionCount(
  durationMinutes: number,
  questionCount: number,
): boolean {
  if (!Number.isInteger(durationMinutes) || !Number.isInteger(questionCount)) return false
  if (durationMinutes > DURATION_MAX || questionCount <= 0) return false
  return durationMinutes >= minDurationForQuestionCount(questionCount)
}

/** Three options for a given question count (presets use the fixed table). */
export function durationOptionsForQuestionCount(questionCount: number): number[] {
  const preset = DURATION_OPTIONS_BY_QUESTION_COUNT[questionCount]
  if (preset) return [...preset]

  const min = minDurationForQuestionCount(questionCount)
  const mid = Math.min(DURATION_MAX, min + 5)
  const high = Math.min(DURATION_MAX, min + 10)
  const unique = [...new Set([min, mid, high].filter((d) => d >= min && d <= DURATION_MAX))]
  while (unique.length < 3 && unique[unique.length - 1]! < DURATION_MAX) {
    unique.push(Math.min(DURATION_MAX, unique[unique.length - 1]! + 5))
  }
  return unique.slice(0, 3)
}

/** Pick the closest option; ties prefer the higher (more time) option. */
export function pickClosestDuration(
  preferred: number | null | undefined,
  options: readonly number[],
): number {
  if (options.length === 0) return DURATION_DEFAULT
  if (preferred == null || !Number.isFinite(preferred)) return options[0]!
  let best = options[0]!
  let bestDist = Math.abs(best - preferred)
  for (let i = 1; i < options.length; i++) {
    const opt = options[i]!
    const dist = Math.abs(opt - preferred)
    if (dist < bestDist || (dist === bestDist && opt > best)) {
      best = opt
      bestDist = dist
    }
  }
  return best
}

/**
 * When question count changes, keep the current duration if still allowed;
 * otherwise snap to the closest of the three valid options.
 */
export function resolveDurationForQuestionCount(
  questionCount: number,
  currentDuration: number | null | undefined,
): number {
  const options = durationOptionsForQuestionCount(questionCount)
  if (
    currentDuration != null &&
    Number.isFinite(currentDuration) &&
    options.includes(Math.round(currentDuration))
  ) {
    return Math.round(currentDuration)
  }
  return pickClosestDuration(currentDuration, options)
}

export function clampDurationMinutes(n: number | null | undefined): number | null {
  if (n == null || !Number.isFinite(n)) return null
  const v = Math.round(n)
  if (v < DURATION_MIN || v > DURATION_MAX) return null
  return v
}

/** Union + sort unique duration options from specialization configs (admin/catalog). */
export function mergeDurationOptions(lists: Array<readonly number[] | number[]>): number[] {
  const set = new Set<number>()
  for (const list of lists) {
    for (const d of list) {
      if (isValidDurationMinutes(d)) set.add(d)
    }
  }
  if (set.size === 0) return [...DURATION_OPTIONS_DEFAULT]
  return [...set].sort((a, b) => a - b)
}

/** Zod-friendly refine helper message. */
export function durationQuestionCountError(
  durationMinutes: number,
  questionCount: number,
): string {
  const min = minDurationForQuestionCount(questionCount)
  return `Duration must be at least ${min} minutes for ${questionCount} questions (1.5 min per question).`
}

export function assertPresetDurationCoverage(): void {
  for (const q of QUESTION_COUNT_PRESET_VALUES) {
    const opts = DURATION_OPTIONS_BY_QUESTION_COUNT[q]
    if (!opts || opts.length !== 3) {
      throw new Error(`Missing 3 duration options for ${q} questions`)
    }
    const min = minDurationForQuestionCount(q)
    for (const d of opts) {
      if (d < min) throw new Error(`Duration ${d} < min ${min} for ${q} questions`)
    }
  }
}
