import { describe, expect, it } from 'vitest'
import { applyTestsCap, complexityRank, complexityScore, testsScore } from '@/lib/evaluation/coding-score'
import { codeFailsToLoad, runAllTests, runOne } from '@/lib/evaluation/code-runner'

describe('testsScore', () => {
  it('weights hidden tests 60/40 (§12 worked example → 80)', () => {
    expect(testsScore({ publicPassed: 4, publicTotal: 4, hiddenPassed: 4, hiddenTotal: 6 })).toBe(80)
    expect(testsScore({ publicPassed: 1, publicTotal: 4, hiddenPassed: 1, hiddenTotal: 6 })).toBe(20)
  })

  it('uses whichever set exists when the other is empty', () => {
    expect(testsScore({ publicPassed: 2, publicTotal: 2, hiddenPassed: 0, hiddenTotal: 0 })).toBe(100)
    expect(testsScore({ publicPassed: 0, publicTotal: 0, hiddenPassed: 1, hiddenTotal: 2 })).toBe(50)
    expect(testsScore({ publicPassed: 0, publicTotal: 0, hiddenPassed: 0, hiddenTotal: 0, failedToRun: true })).toBe(0)
  })
})

describe('complexity', () => {
  it('ranks common classes', () => {
    expect(complexityRank('O(1)')).toBe(0)
    expect(complexityRank('O(log n)')).toBe(1)
    expect(complexityRank('O(n)')).toBe(3)
    expect(complexityRank('O(m + n)')).toBe(3)
    expect(complexityRank('O(min(n, alphabet))')).toBe(3)
    expect(complexityRank('O(n log n)')).toBe(4)
    expect(complexityRank('O(n log k)')).toBe(4)
    expect(complexityRank('O(n^2)')).toBe(5)
    expect(complexityRank('O(n²)')).toBe(5)
    expect(complexityRank('O(m·n)')).toBe(5)
    expect(complexityRank('O(2^n)')).toBe(7)
    expect(complexityRank('O(n!)')).toBe(8)
    expect(complexityRank('linear-ish')).toBeNull()
  })

  it('scores by class distance (§12 table)', () => {
    expect(complexityScore('O(n)', 'O(n)')).toBe(100)
    expect(complexityScore('O(log n)', 'O(n)')).toBe(100)
    expect(complexityScore('O(n log n)', 'O(n)')).toBe(75)
    expect(complexityScore('O(n^2)', 'O(n)')).toBe(40)
    expect(complexityScore('O(2^n)', 'O(n)')).toBe(15)
    expect(complexityScore(undefined, 'O(n)')).toBe(15)
  })
})

describe('applyTestsCap', () => {
  it('caps at testsScore + 15 (§12: beautiful code, 1/4 public 1/6 hidden → 35)', () => {
    const tests = { publicPassed: 1, publicTotal: 4, hiddenPassed: 1, hiddenTotal: 6 }
    expect(applyTestsCap(42, tests)).toEqual({ score: 35, capped: true })
    expect(applyTestsCap(78, { publicPassed: 4, publicTotal: 4, hiddenPassed: 4, hiddenTotal: 6 })).toEqual({ score: 78, capped: false })
  })

  it('caps at 15 when nothing runs', () => {
    expect(applyTestsCap(90, { publicPassed: 0, publicTotal: 2, hiddenPassed: 0, hiddenTotal: 2, failedToRun: true }).score).toBe(15)
  })
})

describe('code-runner', () => {
  const solution = 'function twoSum(nums, target) { const seen = new Map(); for (let i = 0; i < nums.length; i++) { const c = target - nums[i]; if (seen.has(c)) return [seen.get(c), i]; seen.set(nums[i], i) } return [] }'

  it('runs a test in the sandbox', () => {
    expect(runOne(solution, 'twoSum', '[[2,7,11,15],9]', '[0,1]').ok).toBe(true)
    expect(runOne(solution, 'twoSum', '[[3,2,4],6]', '[0,1]').ok).toBe(false)
  })

  it('re-runs public and hidden tests and reports failed hidden indexes only', () => {
    const summary = runAllTests(
      solution,
      'twoSum',
      [{ input: '[[2,7,11,15],9]', expected: '[0,1]' }, { input: '[[3,2,4],6]', expected: '[1,2]' }],
      [{ input: '[[3,3],6]', expected: '[0,1]' }, { input: '[[1,2],5]', expected: '[9,9]' }],
    )
    expect(summary).toMatchObject({ publicPassed: 2, publicTotal: 2, hiddenPassed: 1, hiddenTotal: 2, failedToRun: false })
    expect(summary.failedHiddenIndexes).toEqual([1])
  })

  it('detects code that cannot load', () => {
    expect(codeFailsToLoad('function twoSum( {', 'twoSum')).toBe(true)
    expect(codeFailsToLoad('function other() {}', 'twoSum')).toBe(true)
    expect(codeFailsToLoad(solution, 'twoSum')).toBe(false)
    expect(runAllTests('while(true){}', 'twoSum', [{ input: '[1]', expected: '1' }]).failedToRun).toBe(true)
  })
})
