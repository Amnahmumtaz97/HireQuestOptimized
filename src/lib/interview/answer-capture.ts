import type { DeliveryStats } from '@/lib/speech/transcript'
import { mergeDeliveryStats } from '@/lib/evaluation/delivery-score'

/** Minimal delivery payload when Deepgram is unavailable (browser STT fallback). */
export function deliveryStatsFromPlainText(
  text: string,
  durationSec = 0,
): DeliveryStats {
  const tokens = text.trim() ? text.trim().split(/\s+/) : []
  const wordCount = tokens.length
  const dur = Math.max(0, durationSec)
  const perMinute = (count: number, seconds: number) =>
    seconds > 0 ? Math.round((count / seconds) * 60) : 0
  return {
    durationSec: dur,
    speakingSec: dur,
    wordCount,
    tokenCount: wordCount,
    wordsPerMinute: perMinute(wordCount, dur),
    articulationRate: perMinute(wordCount, dur),
    disfluencies: { total: 0, perMinute: 0, breakdown: [] },
    crutches: [],
    pauses: {
      count: 0,
      totalSec: 0,
      longestSec: 0,
      averageSec: 0,
      byTier: { short: 0, medium: 0, long: 0 },
    },
    silenceRatio: 0,
  }
}

/**
 * Speech-analysis payload for one recording.
 * Kept separate from the user-facing answer text (finalTranscript / `answer` field).
 */
export type SpeechAnalysis = {
  /** Full STT with fillers — evaluation/delivery only, never shown as the answer. */
  verbatim: string
  /** Same with `[pause Xs]` markers — evaluation only. */
  annotated: string
  delivery: DeliveryStats
  /** Deepgram recognition confidence for this clip, 0–1. */
  confidence: number | null
}

/** @deprecated Prefer SpeechAnalysis — kept as an alias for existing call sites. */
export type AnswerClip = SpeechAnalysis

/**
 * What the editor hands the page to save alongside a spoken answer.
 * `transcript` + `delivery` are speechAnalysis; the submitted answer text is separate.
 */
export type AnswerCapture = {
  transcript: { verbatim: string; annotated: string }
  delivery: DeliveryStats
  audioConfidence: number | null
}

/**
 * §16 — several clips for one answer merge into one capture: analysis transcripts
 * are concatenated, stats are merged from the sums, confidence is the worst clip's.
 * Does not touch the displayed/submitted answer string.
 */
export function mergeClips(clips: AnswerClip[]): AnswerCapture | null {
  if (clips.length === 0) return null
  const delivery = mergeDeliveryStats(clips.map((c) => c.delivery))
  if (!delivery) return null
  const confidences = clips.map((c) => c.confidence).filter((c): c is number => typeof c === 'number')
  return {
    transcript: {
      verbatim: clips.map((c) => c.verbatim.trim()).filter(Boolean).join(' '),
      annotated: clips.map((c) => c.annotated.trim()).filter(Boolean).join(' '),
    },
    delivery,
    audioConfidence: confidences.length ? Math.min(...confidences) : null,
  }
}
