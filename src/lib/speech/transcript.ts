
export type TranscriptWord = {
  /** Raw lowercase token as recognised. */
  word: string
  /** Smart-formatted token (capitals + punctuation) for display. */
  punctuated: string
  start: number
  end: number
  confidence: number
}

export type PauseTier = 'short' | 'medium' | 'long'

export type Pause = {
  /** Index of the word this pause follows. */
  afterIndex: number
  start: number
  end: number
  durationSec: number
  tier: PauseTier
}

export type PauseOptions = {
  /** Gaps below this are ordinary speech rhythm, not hesitation. */
  minPauseSec?: number
  mediumPauseSec?: number
  longPauseSec?: number
}

const DEFAULT_PAUSE_OPTIONS: Required<PauseOptions> = {
  minPauseSec: 0.75,
  mediumPauseSec: 1.5,
  longPauseSec: 3,
}

/**
 * True disfluencies — the tokens Deepgram emits when `filler_words=true`.
 * Kept separate from crutch phrases because these are unambiguous.
 */
const DISFLUENCIES = new Set([
  'um',
  'umm',
  'uh',
  'uhh',
  'er',
  'erm',
  'ah',
  'ahh',
  'eh',
  'hmm',
  'hm',
  'mhm',
  'mm',
  'huh',
])

/**
 * Verbal crutches. Reported as "possible" because each has legitimate uses —
 * "like" is a filler in "it was like really hard" but not in "I like Go".
 */
const CRUTCH_PHRASES: string[][] = [
  ['you', 'know'],
  ['i', 'mean'],
  ['sort', 'of'],
  ['kind', 'of'],
  ['like'],
  ['basically'],
  ['literally'],
  ['actually'],
]

export function normalizeToken(token: string): string {
  return token.toLowerCase().replace(/[^a-z']/g, '')
}

export function isDisfluency(token: string): boolean {
  return DISFLUENCIES.has(normalizeToken(token))
}

function round(value: number, places = 1): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function tierFor(gap: number, cfg: Required<PauseOptions>): PauseTier {
  if (gap >= cfg.longPauseSec) return 'long'
  if (gap >= cfg.mediumPauseSec) return 'medium'
  return 'short'
}

/** Gaps between the end of one word and the start of the next. */
export function computePauses(
  words: TranscriptWord[],
  options: PauseOptions = {},
): Pause[] {
  const cfg = { ...DEFAULT_PAUSE_OPTIONS, ...options }
  const pauses: Pause[] = []

  for (let i = 0; i < words.length - 1; i++) {
    const current = words[i]
    const next = words[i + 1]
    const gap = next.start - current.end
    // Overlapping timings happen on crosstalk; they are not pauses.
    if (!Number.isFinite(gap) || gap < cfg.minPauseSec) continue

    pauses.push({
      afterIndex: i,
      start: round(current.end, 2),
      end: round(next.start, 2),
      durationSec: round(gap),
      tier: tierFor(gap, cfg),
    })
  }

  return pauses
}

/** Verbatim text exactly as spoken, fillers included, no markers. */
export function buildVerbatimTranscript(words: TranscriptWord[]): string {
  return words
    .map((w) => w.punctuated || w.word)
    .join(' ')
    .trim()
}

/** Verbatim text with `[pause 1.4s]` markers inserted at every real hesitation. */
export function buildAnnotatedTranscript(
  words: TranscriptWord[],
  options: PauseOptions = {},
): string {
  if (words.length === 0) return ''

  const pauseByIndex = new Map(
    computePauses(words, options).map((p) => [p.afterIndex, p]),
  )

  const parts: string[] = []
  words.forEach((word, index) => {
    parts.push(word.punctuated || word.word)
    const pause = pauseByIndex.get(index)
    if (pause) parts.push(`[pause ${pause.durationSec.toFixed(1)}s]`)
  })

  return parts.join(' ').trim()
}

function countCrutchPhrases(
  tokens: string[],
): Array<{ phrase: string; count: number }> {
  const counts = new Map<string, number>()

  for (const phrase of CRUTCH_PHRASES) {
    let count = 0
    for (let i = 0; i + phrase.length <= tokens.length; i++) {
      if (phrase.every((part, offset) => tokens[i + offset] === part)) count++
    }
    if (count > 0) counts.set(phrase.join(' '), count)
  }

  return [...counts.entries()]
    .map(([phrase, count]) => ({ phrase, count }))
    .sort((a, b) => b.count - a.count)
}

export type DeliveryStats = {
  /** Length of the recording. Falls back to the spoken span when unknown. */
  durationSec: number
  /** Duration minus counted pause time. */
  speakingSec: number
  /** Real words, disfluencies excluded. */
  wordCount: number
  /** Every token including disfluencies. */
  tokenCount: number
  /** Words per minute over the whole recording. */
  wordsPerMinute: number
  /** Words per minute over speaking time only — how fast they talk when talking. */
  articulationRate: number
  disfluencies: {
    total: number
    perMinute: number
    breakdown: Array<{ word: string; count: number }>
  }
  crutches: Array<{ phrase: string; count: number }>
  pauses: {
    count: number
    totalSec: number
    longestSec: number
    averageSec: number
    byTier: Record<PauseTier, number>
  }
  /** Share of the recording spent in counted pauses, 0–1. */
  silenceRatio: number
}

export function summarizeDelivery(
  words: TranscriptWord[],
  options: PauseOptions & { audioDurationSec?: number } = {},
): DeliveryStats {
  const pauses = computePauses(words, options)
  const tokens = words.map((w) => normalizeToken(w.word)).filter(Boolean)

  const disfluencyCounts = new Map<string, number>()
  for (const token of tokens) {
    if (DISFLUENCIES.has(token)) {
      disfluencyCounts.set(token, (disfluencyCounts.get(token) ?? 0) + 1)
    }
  }
  const disfluencyTotal = [...disfluencyCounts.values()].reduce((a, b) => a + b, 0)

  const span =
    words.length > 0 ? words[words.length - 1].end - words[0].start : 0
  const durationSec = Math.max(options.audioDurationSec ?? span, span, 0)

  const totalPauseSec = pauses.reduce((sum, p) => sum + p.durationSec, 0)
  const speakingSec = Math.max(durationSec - totalPauseSec, 0)
  const wordCount = tokens.length - disfluencyTotal

  const perMinute = (count: number, seconds: number) =>
    seconds > 0 ? round((count / seconds) * 60) : 0

  const longestSec = pauses.reduce((max, p) => Math.max(max, p.durationSec), 0)

  return {
    durationSec: round(durationSec),
    speakingSec: round(speakingSec),
    wordCount,
    tokenCount: tokens.length,
    wordsPerMinute: perMinute(wordCount, durationSec),
    articulationRate: perMinute(wordCount, speakingSec),
    disfluencies: {
      total: disfluencyTotal,
      perMinute: perMinute(disfluencyTotal, durationSec),
      breakdown: [...disfluencyCounts.entries()]
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count),
    },
    crutches: countCrutchPhrases(tokens),
    pauses: {
      count: pauses.length,
      totalSec: round(totalPauseSec),
      longestSec: round(longestSec),
      averageSec: pauses.length > 0 ? round(totalPauseSec / pauses.length) : 0,
      byTier: {
        short: pauses.filter((p) => p.tier === 'short').length,
        medium: pauses.filter((p) => p.tier === 'medium').length,
        long: pauses.filter((p) => p.tier === 'long').length,
      },
    },
    silenceRatio: durationSec > 0 ? round(totalPauseSec / durationSec, 3) : 0,
  }
}
