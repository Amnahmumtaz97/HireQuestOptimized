import type { TestRunSummary } from '@/lib/evaluation/types'

/** §12 — hidden tests weigh more because public ones can be hard-coded. */
export const PUBLIC_TEST_WEIGHT = 40
export const HIDDEN_TEST_WEIGHT = 60

/** Good style can add at most this many points above what the tests prove. */
export const TESTS_CAP_BONUS = 15
/** Code that does not run cannot score above this. */
export const NO_RUN_CAP = 15
/** A solution the judge could not execute (non-JS) cannot outscore a verified one. */
export const UNVERIFIED_CODE_CAP = 60

export function testsScore(t: TestRunSummary): number {
  if (t.failedToRun) return 0
  const publicRate = t.publicTotal > 0 ? t.publicPassed / t.publicTotal : null
  const hiddenRate = t.hiddenTotal > 0 ? t.hiddenPassed / t.hiddenTotal : null
  if (publicRate === null && hiddenRate === null) return 0
  if (publicRate === null) return (hiddenRate as number) * 100
  if (hiddenRate === null) return publicRate * 100
  return publicRate * PUBLIC_TEST_WEIGHT + hiddenRate * HIDDEN_TEST_WEIGHT
}

/**
 * Complexity classes ranked from best to worst:
 *   0 constant · 1 log · 2 sqrt · 3 linear (n, m+n, min(n,k)) · 4 n log n ·
 *   5 quadratic (n², m·n) · 6 cubic · 7 exponential · 8 factorial
 * Anything unparseable is null, which scores as "cannot be determined" (§12).
 */
export function complexityRank(raw: string | null | undefined): number | null {
  if (!raw) return null
  let s = raw.toLowerCase().replace(/\s+/g, '').replace(/[·×]/g, '*').replace(/\*\*/g, '^')
  s = s.replace(/²/g, '^2').replace(/³/g, '^3')
  const wrapped = s.match(/^o\((.+)\)$/)
  if (wrapped) s = wrapped[1]
  if (!s) return null

  if (s === '1') return 0
  if (/^(log|lg|ln)\(?[a-z]+\)?$/.test(s)) return 1
  if (/^(sqrt|√)\(?[a-z]+\)?$/.test(s)) return 2
  // "nlogn" is all letters too, so the log-linear pattern must run before the plain-variable one.
  if (/^[a-z]\*?(log|lg)\(?[a-z]+\)?$/.test(s)) return 4
  if (/^[a-z]+$/.test(s)) {
    // "mn" / "nk" is a product of two variables; a word like "alphabet" is one variable.
    if (s.length === 2 && /^[mnkve]{2}$/.test(s)) return 5
    return 3
  }
  if (/^[a-z]+(\+[a-z]+)+$/.test(s)) return 3
  if (/^(min|max)\([a-z]+(,[a-z]+)+\)$/.test(s)) return 3
  if (/^[a-z]+\*[a-z]+$/.test(s)) return 5
  if (/^[a-z]+\^2$/.test(s)) return 5
  if (/^[a-z]+\^3$/.test(s)) return 6
  if (/^2\^[a-z]+$/.test(s)) return 7
  if (/^[a-z]+!$/.test(s)) return 8
  return null
}

/** §12 complexity table. */
export function complexityScore(candidate: string | null | undefined, expected: string | null | undefined): number {
  const c = complexityRank(candidate)
  const e = complexityRank(expected)
  if (c === null || e === null) return 15
  const diff = c - e
  if (diff <= 0) return 100
  if (diff === 1) return 75
  if (diff === 2) return 40
  return 15
}

export function applyTestsCap(weighted: number, tests: TestRunSummary): { score: number; capped: boolean } {
  const cap = tests.failedToRun ? NO_RUN_CAP : testsScore(tests) + TESTS_CAP_BONUS
  return { score: Math.min(weighted, cap), capped: weighted > cap }
}
