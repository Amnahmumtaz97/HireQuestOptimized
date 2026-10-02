import { describe, expect, it } from 'vitest'
import {
  cleanTranscriptForGrading,
  computeTextSignals,
  countWords,
  ownershipRatioScore,
} from '@/lib/evaluation/text-signals'

describe('computeTextSignals', () => {
  it('counts I vs we', () => {
    const s = computeTextSignals("I proposed the change. We discussed it and I built the prototype. My tests passed and we shipped.")
    expect(s.iCount).toBe(3) // I, I, My
    expect(s.weCount).toBe(2)
    expect(s.iRatio).toBeCloseTo(3 / 5, 3)
  })

  it('detects numbers and metrics', () => {
    expect(computeTextSignals('latency dropped by 40%').hasNumbers).toBe(true)
    expect(computeTextSignals('it got faster').hasNumbers).toBe(false)
    expect(computeTextSignals('about 115k rps at peak').hasNumbers).toBe(true)
  })

  it('flags hypothetical phrasing when it dominates', () => {
    const hypo = computeTextSignals("I would first talk to the teammate. I'd then escalate. You should always document it. I would follow up.")
    expect(hypo.hypotheticalDominant).toBe(true)
    const story = computeTextSignals('Last March our API broke. I found the bug in the cache layer. I wrote a fix and we shipped it the same day.')
    expect(story.hypotheticalDominant).toBe(false)
  })

  it('ownership bands match §13', () => {
    expect(ownershipRatioScore(0.75)).toBe(100)
    expect(ownershipRatioScore(0.6)).toBe(100)
    expect(ownershipRatioScore(0.59)).toBe(70)
    expect(ownershipRatioScore(0.4)).toBe(70)
    expect(ownershipRatioScore(0.39)).toBe(40)
    expect(ownershipRatioScore(0.19)).toBe(15)
  })
})

describe('cleanTranscriptForGrading', () => {
  it('strips fillers and pause markers, keeps the words', () => {
    const raw = 'So, um, I checked the [pause 1.4s] heap, uh, snapshot and, hmm, found the leak.'
    expect(cleanTranscriptForGrading(raw)).toBe('So, I checked the heap, snapshot and, found the leak.')
  })

  it('countWords ignores fillers', () => {
    expect(countWords('um uh I built it')).toBe(3)
  })
})
