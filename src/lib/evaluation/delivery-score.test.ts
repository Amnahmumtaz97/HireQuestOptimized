import { describe, expect, it } from 'vitest'
import type { DeliveryStats } from '@/lib/speech/transcript'
import {
  deliveryScoreRaw,
  evaluateDelivery,
  fillersScore,
  mergeDeliveryStats,
  paceScore,
  pausesScore,
  silenceScore,
} from '@/lib/evaluation/delivery-score'

function stats(overrides: Partial<DeliveryStats> = {}): DeliveryStats {
  return {
    durationSec: 90,
    speakingSec: 60,
    wordCount: 200,
    tokenCount: 210,
    wordsPerMinute: 145,
    articulationRate: 200,
    disfluencies: { total: 8, perMinute: 5.3, breakdown: [{ word: 'um', count: 8 }] },
    crutches: [],
    pauses: { count: 4, totalSec: 30, longestSec: 5.2, averageSec: 7.5, byTier: { short: 1, medium: 2, long: 1 } },
    silenceRatio: 0.34,
    ...overrides,
  }
}

describe('delivery bands', () => {
  it('lower bound inclusive, upper bound exclusive (§16)', () => {
    expect(fillersScore(1.99)).toBe(100)
    expect(fillersScore(2)).toBe(75)
    expect(fillersScore(3.99)).toBe(75)
    expect(fillersScore(4)).toBe(50)
    expect(pausesScore(1.99)).toBe(100)
    expect(pausesScore(2)).toBe(80)
    expect(silenceScore(0.149)).toBe(100)
    expect(silenceScore(0.15)).toBe(85)
    expect(paceScore(119)).toBe(75)
    expect(paceScore(120)).toBe(100)
    expect(paceScore(160)).toBe(100)
    expect(paceScore(161)).toBe(75)
  })

  it('reproduces the worked example: 145 wpm, 5.3 fillers/min, 5.2s pause, 0.34 silence → 67', () => {
    expect(deliveryScoreRaw(stats())).toBeCloseTo(66.75, 2)
    const result = evaluateDelivery({ inputMode: 'spoken', delivery: stats(), audioConfidence: 0.93 })
    expect(result.scorable).toBe(true)
    if (result.scorable) expect(result.score).toBe(67)
  })
})

describe('evaluateDelivery preconditions', () => {
  it('is null for typed answers without a flag', () => {
    const r = evaluateDelivery({ inputMode: 'typed', delivery: null })
    expect(r.scorable).toBe(false)
    if (r.scorable === false) expect(r.flag).toBeNull()
  })

  it('refuses low audio confidence', () => {
    const r = evaluateDelivery({ inputMode: 'spoken', delivery: stats(), audioConfidence: 0.5 })
    expect(r.scorable).toBe(false)
    if (r.scorable === false) expect(r.flag).toBe('low_audio_confidence')
  })

  it('refuses short clips', () => {
    const r = evaluateDelivery({ inputMode: 'spoken', delivery: stats({ durationSec: 12 }), audioConfidence: 0.9 })
    expect(r.scorable).toBe(false)
    if (r.scorable === false) expect(r.flag).toBe('delivery_too_short')
  })

  it('tips quote the real numbers', () => {
    const r = evaluateDelivery({ inputMode: 'spoken', delivery: stats(), audioConfidence: 0.9 })
    if (!r.scorable) throw new Error('expected scorable')
    expect(r.tips.join(' ')).toContain('5.2s')
    expect(r.tips.join(' ')).toContain('8 filler words')
  })
})

describe('mergeDeliveryStats', () => {
  it('sums totals, recomputes rates and takes the longest pause', () => {
    const a = stats({ durationSec: 60, wordCount: 150, tokenCount: 152, disfluencies: { total: 2, perMinute: 2, breakdown: [] }, pauses: { count: 1, totalSec: 3, longestSec: 3, averageSec: 3, byTier: { short: 0, medium: 1, long: 0 } }, silenceRatio: 0.05 })
    const b = stats({ durationSec: 30, wordCount: 30, tokenCount: 34, disfluencies: { total: 4, perMinute: 8, breakdown: [] }, pauses: { count: 2, totalSec: 12, longestSec: 8, averageSec: 6, byTier: { short: 0, medium: 0, long: 2 } }, silenceRatio: 0.4 })
    const merged = mergeDeliveryStats([a, b])
    expect(merged).not.toBeNull()
    expect(merged?.durationSec).toBe(90)
    expect(merged?.wordCount).toBe(180)
    expect(merged?.wordsPerMinute).toBe(120)
    expect(merged?.disfluencies.total).toBe(6)
    expect(merged?.disfluencies.perMinute).toBe(4)
    expect(merged?.pauses.longestSec).toBe(8)
    expect(merged?.silenceRatio).toBeCloseTo(15 / 90, 3)
  })

  it('returns the single clip untouched', () => {
    const only = stats()
    expect(mergeDeliveryStats([only])).toBe(only)
    expect(mergeDeliveryStats([])).toBeNull()
  })
})
