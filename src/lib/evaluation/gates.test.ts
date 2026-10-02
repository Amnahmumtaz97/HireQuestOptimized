import { describe, expect, it } from 'vitest'
import { definesFunction, gateCodingAnswer, gateSpokenAnswer, isEcho, isGibberish } from '@/lib/evaluation/gates'

const QUESTION = 'How would you handle a memory leak in a Node service?'
const GOOD =
  'First I would check whether RSS keeps climbing under steady load, then take a heap snapshot with --inspect and compare two snapshots to see which objects are retained. Usually it is a cache with no eviction or a listener that never gets removed.'

describe('gateSpokenAnswer', () => {
  it('passes a real answer', () => {
    expect(gateSpokenAnswer('technical', GOOD, QUESTION)).toEqual({ ok: true })
  })

  it('applies per-rubric minimums (junk filter, not a brevity penalty)', () => {
    const twelve = Array.from({ length: 12 }, (_, i) => ['alpha', 'beta', 'gamma', 'delta'][i % 4]).join(' ')
    expect(gateSpokenAnswer('technical', twelve, QUESTION).ok).toBe(true)
    expect(gateSpokenAnswer('behavioral', twelve, QUESTION).ok).toBe(false)
    expect(gateSpokenAnswer('system_design', twelve, QUESTION).ok).toBe(false)
    expect(gateSpokenAnswer('hr', 'I want this role because payments at scale excite me.', QUESTION).ok).toBe(true)
    // A short but real system-design answer must reach the judge.
    expect(
      gateSpokenAnswer(
        'system_design',
        'Split it into user, restaurant, order and payment services behind an API gateway, each owning its own data.',
        'How would you break a food delivery platform into services?',
      ).ok,
    ).toBe(true)
  })

  it('does not count fillers toward the minimum', () => {
    const fillers = 'um uh er hmm '.repeat(10) + 'I like Go.'
    const r = gateSpokenAnswer('technical', fillers, QUESTION)
    expect(r.ok).toBe(false)
    if (r.ok === false) expect(r.flag).toBe('too_short')
  })

  it('catches gibberish', () => {
    expect(isGibberish('asdf asdf qwer zxcv x x x x x x x x x x x x x x x')).toBe(true)
    expect(isGibberish(GOOD)).toBe(false)
    expect(isGibberish('We estimated 10B redirects per day which is about 115k rps at peak so caching matters.')).toBe(false)
  })

  it('catches an echoed question', () => {
    expect(isEcho('Handle a memory leak in a Node service, I would handle the memory leak.', QUESTION)).toBe(true)
    expect(isEcho(GOOD, QUESTION)).toBe(false)
    // The technical minimum (15 words) already exceeds 1.5× this 10-word question, so use HR (10).
    const r = gateSpokenAnswer('hr', 'How would I handle a memory leak in a Node service? Handle the memory leak.', QUESTION)
    expect(r.ok).toBe(false)
    if (r.ok === false) expect(r.flag).toBe('echoed_question')
  })
})

describe('gateCodingAnswer', () => {
  const starter = 'function twoSum(nums, target) {\n  // return indices\n}\n'

  it('rejects unchanged starter code (whitespace-insensitive)', () => {
    const r = gateCodingAnswer('function twoSum(nums,   target) {\n\n  // return indices\n}', starter, 'twoSum')
    expect(r.ok).toBe(false)
    if (r.ok === false) expect(r.flag).toBe('no_solution')
  })

  it('rejects code without the target function', () => {
    const r = gateCodingAnswer('const add = (a, b) => a + b', starter, 'twoSum')
    expect(r.ok).toBe(false)
  })

  it('accepts a real solution in any declaration style', () => {
    expect(gateCodingAnswer('function twoSum(nums, t) { return [0, 1] }', starter, 'twoSum').ok).toBe(true)
    expect(definesFunction('const twoSum = (nums, t) => [0, 1]', 'twoSum')).toBe(true)
    expect(definesFunction('let twoSum = function (n) { return n }', 'twoSum')).toBe(true)
    expect(definesFunction('twoSum = n => n', 'twoSum')).toBe(true)
  })
})
