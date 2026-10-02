/**
 * §9.3 — every hit, error and red flag Gemini reports must be backed by a quote
 * that actually appears in the answer. Unverified observations never become points.
 */

export const QUOTE_MATCH_THRESHOLD = 0.85
const MIN_QUOTE_CHARS = 3

export function normalizeForMatch(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\[pause\s+[\d.]+s\]/g, ' ')
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bigrams(s: string): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2)
    map.set(g, (map.get(g) ?? 0) + 1)
  }
  return map
}

/** Sørensen–Dice similarity over character bigrams, 0–1. */
export function diceSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length < 2 || b.length < 2) return 0
  const ba = bigrams(a)
  const bb = bigrams(b)
  let overlap = 0
  for (const [g, n] of ba) {
    const m = bb.get(g)
    if (m) overlap += Math.min(n, m)
  }
  return (2 * overlap) / (a.length - 1 + (b.length - 1))
}

/**
 * True when `quote` appears in `answer`: exact after normalisation, or fuzzy
 * (≥ 85% bigram similarity against some window of the answer) to absorb
 * transcription noise and small paraphrase drift.
 */
export function quoteAppearsIn(answer: string, quote: string | null | undefined): boolean {
  if (!quote) return false
  const q = normalizeForMatch(quote)
  const a = normalizeForMatch(answer)
  if (q.length < MIN_QUOTE_CHARS || a.length === 0) return false
  if (a.includes(q)) return true
  if (q.length > a.length * 1.2) return false

  // Slide a window the size of the quote across word boundaries of the answer.
  const words = a.split(' ')
  const qWords = q.split(' ').length
  const spans = [qWords, qWords + 1, Math.max(1, qWords - 1)]
  let best = 0
  for (const span of spans) {
    for (let i = 0; i + span <= words.length; i++) {
      const window = words.slice(i, i + span).join(' ')
      const sim = diceSimilarity(window, q)
      if (sim > best) best = sim
      if (best >= QUOTE_MATCH_THRESHOLD) return true
    }
  }
  return best >= QUOTE_MATCH_THRESHOLD
}
