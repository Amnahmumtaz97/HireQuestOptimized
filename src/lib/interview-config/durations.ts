/**
 * Single source of truth for interview duration options (minutes).
 * Catalog specializations may further restrict available durations.
 */

export const DURATION_OPTIONS_DEFAULT = [20, 30, 45, 60] as const
export const DURATION_MIN = 5
export const DURATION_MAX = 180
export const DURATION_DEFAULT = 30

export function clampDurationMinutes(n: number | null | undefined): number | null {
  if (n == null || !Number.isFinite(n)) return null
  const v = Math.round(n)
  if (v < DURATION_MIN || v > DURATION_MAX) return null
  return v
}

export function isValidDurationMinutes(n: number): boolean {
  return Number.isInteger(n) && n >= DURATION_MIN && n <= DURATION_MAX
}

/** Union + sort unique duration options from specialization configs. */
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
