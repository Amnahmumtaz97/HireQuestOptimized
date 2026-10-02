import { describe, expect, it } from 'vitest'
import { diceSimilarity, quoteAppearsIn } from '@/lib/evaluation/verify'

const ANSWER =
  "First I'd check whether RSS keeps climbing, then take a heap snapshot with --inspect. Usually it's a cache with no eviction. [pause 1.4s] GC only runs when memory is full."

describe('quoteAppearsIn', () => {
  it('accepts exact quotes regardless of case, punctuation and whitespace', () => {
    expect(quoteAppearsIn(ANSWER, 'check whether RSS keeps climbing')).toBe(true)
    expect(quoteAppearsIn(ANSWER, 'Check   whether rss keeps climbing!')).toBe(true)
    expect(quoteAppearsIn(ANSWER, 'take a heap snapshot with --inspect')).toBe(true)
  })

  it('tolerates transcription noise above the 85% threshold', () => {
    expect(quoteAppearsIn(ANSWER, 'usually its a cash with no eviction')).toBe(true)
  })

  it('rejects things the candidate never said', () => {
    expect(quoteAppearsIn(ANSWER, 'run a load test and watch heap size stay flat')).toBe(false)
    expect(quoteAppearsIn(ANSWER, 'compare two snapshots to find retained objects')).toBe(false)
    expect(quoteAppearsIn(ANSWER, null)).toBe(false)
    expect(quoteAppearsIn(ANSWER, '')).toBe(false)
  })

  it('rejects a quote longer than the answer', () => {
    expect(quoteAppearsIn('short answer', 'this is a much much longer quote than the answer itself')).toBe(false)
  })
})

describe('diceSimilarity', () => {
  it('is 1 for identical and 0 for disjoint strings', () => {
    expect(diceSimilarity('night', 'night')).toBe(1)
    expect(diceSimilarity('abcd', 'wxyz')).toBe(0)
    expect(diceSimilarity('night', 'nacht')).toBeCloseTo(0.25, 2)
  })
})
