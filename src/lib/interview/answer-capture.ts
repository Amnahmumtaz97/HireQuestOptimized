import type { DeliveryStats } from '@/lib/speech/transcript'
import { mergeDeliveryStats } from '@/lib/evaluation/delivery-score'

/** What one recording produced. */
export type AnswerClip = {
  verbatim: string
  annotated: string
  delivery: DeliveryStats
  /** Deepgram recognition confidence for this clip, 0–1. */
  confidence: number | null
}

/** What the editor hands the page to save alongside a spoken answer (Phase 2). */
export type AnswerCapture = {
  transcript: { verbatim: string; annotated: string }
  delivery: DeliveryStats
  audioConfidence: number | null
}

/**
 * §16 — several clips for one answer merge into one capture: transcripts are
 * concatenated, stats are merged from the sums, confidence is the worst clip's.
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
