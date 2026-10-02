import { isDisfluency } from '@/lib/speech/transcript'

/** §5 Tier 2 — cheap, deterministic facts computed from the answer text. */
export type TextSignals = {
  wordCount: number
  iCount: number
  weCount: number
  /** iCount / (iCount + weCount); 1 when neither appears. */
  iRatio: number
  hasNumbers: boolean
  /** Share of sentences led by "I would / I'd / you should / one should". */
  hypotheticalRatio: number
  hypotheticalDominant: boolean
}

const I_WORDS = new Set(['i', "i'm", "i've", "i'd", "i'll", 'my', 'me', 'mine', 'myself'])
const WE_WORDS = new Set(['we', "we're", "we've", "we'd", "we'll", 'our', 'us', 'ours', 'ourselves'])

const NUMBER_PATTERN = /\d|\bpercent\b|%|\bx\s*faster\b|\bms\b|\brps\b|\bqps\b|\btps\b|\bmillion\b|\bbillion\b|\bthousand\b/i
const HYPOTHETICAL_LEAD = /^(i would|i'd|i might|i could|you should|you would|one should|one would|we would|we'd|ideally|in theory|hypothetically)\b/i

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/\[pause\s+[\d.]+s\]/g, ' ')
    .split(/[^a-z0-9']+/)
    .filter(Boolean)
}

/** Real words only — fillers ("um", "uh") do not count toward length gates. */
export function countWords(text: string): number {
  return tokenize(text).filter((t) => !isDisfluency(t)).length
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function computeTextSignals(text: string): TextSignals {
  const tokens = tokenize(text)
  let iCount = 0
  let weCount = 0
  for (const t of tokens) {
    if (I_WORDS.has(t)) iCount++
    else if (WE_WORDS.has(t)) weCount++
  }
  const pronounTotal = iCount + weCount
  const iRatio = pronounTotal === 0 ? 1 : iCount / pronounTotal

  const sentences = splitSentences(text)
  const hypothetical = sentences.filter((s) => HYPOTHETICAL_LEAD.test(s)).length
  const hypotheticalRatio = sentences.length === 0 ? 0 : hypothetical / sentences.length

  return {
    wordCount: tokens.filter((t) => !isDisfluency(t)).length,
    iCount,
    weCount,
    iRatio,
    hasNumbers: NUMBER_PATTERN.test(text),
    hypotheticalRatio,
    // Half or more of the sentences are conditional → the candidate is describing a plan, not a story.
    hypotheticalDominant: sentences.length >= 2 && hypotheticalRatio >= 0.5,
  }
}

/** §13 — the ownership ratio bands. */
export function ownershipRatioScore(iRatio: number): number {
  if (iRatio >= 0.6) return 100
  if (iRatio >= 0.4) return 70
  if (iRatio >= 0.2) return 40
  return 15
}

/**
 * §6 — content is graded on clean text: disfluencies and pause markers removed,
 * everything else exactly as said.
 */
export function cleanTranscriptForGrading(text: string): string {
  return text
    .replace(/\[pause\s+[\d.]+s\]/g, ' ')
    .split(/(\s+)/)
    .filter((part) => !/\S/.test(part) || !isDisfluency(part.replace(/[^a-z']/gi, '')))
    .join('')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}
