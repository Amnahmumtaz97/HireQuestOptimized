import { createContext, Script } from 'vm'
import type { CodingTest, TestRunSummary } from '@/lib/evaluation/types'

/** Per-test budget. A loop that never terminates must not stall an evaluation. */
export const TEST_TIMEOUT_MS = 800

export type TestResult = { ok: boolean; actual?: string; error?: string }

function parseArg(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

export function sanitizeFunctionName(name: string | undefined | null): string {
  return (name || 'solve').replace(/[^\w$]/g, '') || 'solve'
}

/**
 * Runs one test in a fresh `vm` context. Shared by the interactive judge
 * (`run-code` route) and the evaluator, so both agree on what "passed" means.
 */
export function runOne(
  code: string,
  functionName: string,
  inputRaw: string,
  expectedRaw: string,
): TestResult {
  try {
    const sandbox: Record<string, unknown> = { console: { log() {}, warn() {}, error() {} } }
    const context = createContext(sandbox)
    const script = new Script(`${code}\n;typeof ${functionName} === 'function' ? ${functionName} : null;`)
    const fn = script.runInContext(context, { timeout: TEST_TIMEOUT_MS })
    if (typeof fn !== 'function') {
      return { ok: false, error: `Function "${functionName}" not found` }
    }
    const input = parseArg(inputRaw)
    const args = Array.isArray(input) ? input : [input]
    const result = (fn as (...a: unknown[]) => unknown).apply(null, args)
    const actual = JSON.stringify(result)
    const expected = JSON.stringify(parseArg(expectedRaw))
    return { ok: actual === expected, actual, error: actual === expected ? undefined : `expected ${expected}` }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Runtime error' }
  }
}

/** True when the code cannot even be loaded — syntax error or the named function is missing. */
export function codeFailsToLoad(code: string, functionName: string): boolean {
  try {
    const context = createContext({ console: { log() {}, warn() {}, error() {} } })
    const script = new Script(`${code}\n;typeof ${functionName} === 'function';`)
    return script.runInContext(context, { timeout: TEST_TIMEOUT_MS }) !== true
  } catch {
    return true
  }
}

/**
 * §12 — re-run every public and hidden test on the final saved code. Stored
 * counts from the candidate's last "Run" click are never trusted.
 */
export function runAllTests(
  code: string,
  functionName: string,
  publicTests: CodingTest[] = [],
  hiddenTests: CodingTest[] = [],
): TestRunSummary {
  const fn = sanitizeFunctionName(functionName)
  if (codeFailsToLoad(code, fn)) {
    return {
      publicPassed: 0,
      publicTotal: publicTests.length,
      hiddenPassed: 0,
      hiddenTotal: hiddenTests.length,
      failedToRun: true,
      failedHiddenIndexes: hiddenTests.map((_, i) => i),
    }
  }

  const publicPassed = publicTests.filter((t) => runOne(code, fn, t.input, t.expected).ok).length
  const failedHiddenIndexes: number[] = []
  hiddenTests.forEach((t, i) => {
    if (!runOne(code, fn, t.input, t.expected).ok) failedHiddenIndexes.push(i)
  })

  return {
    publicPassed,
    publicTotal: publicTests.length,
    hiddenPassed: hiddenTests.length - failedHiddenIndexes.length,
    hiddenTotal: hiddenTests.length,
    failedToRun: false,
    failedHiddenIndexes,
  }
}
