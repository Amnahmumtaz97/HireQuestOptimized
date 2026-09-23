import { describe, expect, it } from 'vitest'
import {
  buildAnnotatedTranscript,
  buildVerbatimTranscript,
  computePauses,
  isDisfluency,
  summarizeDelivery,
  type TranscriptWord,
} from '@/lib/speech/transcript'

/** Builds a word list from [text, start, end] triples. */
function words(...spec: Array<[string, number, number]>): TranscriptWord[] {
  return spec.map(([text, start, end]) => ({
    word: text.toLowerCase().replace(/[^a-z']/g, ''),
    punctuated: text,
    start,
    end,
    confidence: 0.99,
  }))
}

describe('computePauses', () => {
  it('finds gaps at or above the threshold and ignores normal rhythm', () => {
    const result = computePauses(
      words(['I', 0, 0.2], ['built', 0.3, 0.7], ['it', 2.2, 2.4]),
    )

    expect(result).toHaveLength(1)
    expect(result[0].afterIndex).toBe(1)
    expect(result[0].durationSec).toBe(1.5)
    expect(result[0].tier).toBe('medium')
  })

  it('tiers pauses by length', () => {
    const result = computePauses(
      words(['a', 0, 0.2], ['b', 1.2, 1.4], ['c', 3.4, 3.6], ['d', 8.6, 8.8]),
    )

    expect(result.map((p) => p.tier)).toEqual(['short', 'medium', 'long'])
  })

  it('treats overlapping timings as no pause', () => {
    expect(computePauses(words(['a', 0, 1.5], ['b', 1.0, 2.0]))).toEqual([])
  })

  it('returns nothing for zero or one word', () => {
    expect(computePauses([])).toEqual([])
    expect(computePauses(words(['hello', 0, 0.5]))).toEqual([])
  })

  it('honours a custom minimum', () => {
    const spec = words(['a', 0, 0.2], ['b', 0.5, 0.7])
    expect(computePauses(spec)).toEqual([])
    expect(computePauses(spec, { minPauseSec: 0.2 })).toHaveLength(1)
  })
})

describe('transcript building', () => {
  const sample = words(
    ['So,', 0, 0.3],
    ['um,', 0.4, 0.8],
    ['I', 2.5, 2.7],
    ['shipped', 2.8, 3.2],
    ['it.', 3.3, 3.6],
  )

  it('keeps fillers in the verbatim transcript', () => {
    expect(buildVerbatimTranscript(sample)).toBe('So, um, I shipped it.')
  })

  it('inserts a pause marker at the hesitation', () => {
    expect(buildAnnotatedTranscript(sample)).toBe(
      'So, um, [pause 1.7s] I shipped it.',
    )
  })

  it('returns an empty string with no words', () => {
    expect(buildAnnotatedTranscript([])).toBe('')
    expect(buildVerbatimTranscript([])).toBe('')
  })
})

describe('isDisfluency', () => {
  it('matches fillers regardless of punctuation and case', () => {
    expect(isDisfluency('Um,')).toBe(true)
    expect(isDisfluency('uh')).toBe(true)
    expect(isDisfluency('Mhm.')).toBe(true)
  })

  it('does not match ordinary words', () => {
    expect(isDisfluency('umbrella')).toBe(false)
    expect(isDisfluency('architecture')).toBe(false)
  })
})

describe('summarizeDelivery', () => {
  const sample = words(
    ['So,', 0, 0.3],
    ['um,', 0.4, 0.8],
    ['I', 2.5, 2.7],
    ['basically', 2.8, 3.3],
    ['uh', 3.4, 3.6],
    ['shipped', 3.7, 4.1],
    ['it.', 4.2, 4.5],
  )

  it('excludes disfluencies from the word count but keeps them in tokens', () => {
    const stats = summarizeDelivery(sample, { audioDurationSec: 5 })
    expect(stats.tokenCount).toBe(7)
    expect(stats.wordCount).toBe(5)
    expect(stats.disfluencies.total).toBe(2)
    expect(stats.disfluencies.breakdown).toEqual([
      { word: 'um', count: 1 },
      { word: 'uh', count: 1 },
    ])
  })

  it('measures pause time and silence ratio against the recording length', () => {
    const stats = summarizeDelivery(sample, { audioDurationSec: 5 })
    expect(stats.pauses.count).toBe(1)
    expect(stats.pauses.longestSec).toBe(1.7)
    expect(stats.speakingSec).toBe(3.3)
    expect(stats.silenceRatio).toBe(0.34)
  })

  it('rates articulation faster than raw speech rate when there are pauses', () => {
    const stats = summarizeDelivery(sample, { audioDurationSec: 5 })
    expect(stats.wordsPerMinute).toBe(60)
    expect(stats.articulationRate).toBeGreaterThan(stats.wordsPerMinute)
  })

  it('flags crutch phrases', () => {
    const stats = summarizeDelivery(sample, { audioDurationSec: 5 })
    expect(stats.crutches).toEqual([{ phrase: 'basically', count: 1 }])
  })

  it('counts multi-word crutches', () => {
    const stats = summarizeDelivery(
      words(['you', 0, 0.2], ['know', 0.3, 0.5], ['you', 0.6, 0.8], ['know', 0.9, 1.1]),
    )
    expect(stats.crutches).toEqual([{ phrase: 'you know', count: 2 }])
  })

  it('falls back to the spoken span when no duration is supplied', () => {
    const stats = summarizeDelivery(sample)
    expect(stats.durationSec).toBe(4.5)
  })

  it('does not divide by zero on empty input', () => {
    const stats = summarizeDelivery([])
    expect(stats.wordsPerMinute).toBe(0)
    expect(stats.articulationRate).toBe(0)
    expect(stats.silenceRatio).toBe(0)
    expect(stats.durationSec).toBe(0)
  })
})
