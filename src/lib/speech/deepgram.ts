import type { TranscriptWord } from '@/lib/speech/transcript'

const DEEPGRAM_URL = 'https://api.deepgram.com/v1/listen'
const DEFAULT_MODEL = 'nova-3'
const REQUEST_TIMEOUT_MS = 120_000

export class SpeechConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpeechConfigError'
  }
}

export class SpeechRequestError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'SpeechRequestError'
    this.status = status
  }
}

export type DeepgramTranscription = {
  transcript: string
  words: TranscriptWord[]
  durationSec: number
  confidence: number
  model: string
}

type DeepgramWord = {
  word?: string
  punctuated_word?: string
  start?: number
  end?: number
  confidence?: number
}

type DeepgramResponse = {
  metadata?: { duration?: number; models?: string[] }
  results?: {
    channels?: Array<{
      alternatives?: Array<{
        transcript?: string
        confidence?: number
        words?: DeepgramWord[]
      }>
    }>
  }
}

export function isSpeechConfigured(): boolean {
  return Boolean(process.env.DEEPGRAM_API_KEY?.trim())
}

function toTranscriptWords(words: DeepgramWord[]): TranscriptWord[] {
  return words
    .filter((w) => typeof w.start === 'number' && typeof w.end === 'number')
    .map((w) => ({
      word: w.word ?? '',
      punctuated: w.punctuated_word ?? w.word ?? '',
      start: w.start as number,
      end: w.end as number,
      confidence: typeof w.confidence === 'number' ? w.confidence : 0,
    }))
}

export async function transcribeAudio(params: {
  audio: Buffer
  mimeType: string
  language?: string
}): Promise<DeepgramTranscription> {
  const key = process.env.DEEPGRAM_API_KEY?.trim()
  if (!key) {
    throw new SpeechConfigError(
      'Speech-to-text is not configured. Set DEEPGRAM_API_KEY in your environment.',
    )
  }

  const model = process.env.DEEPGRAM_MODEL?.trim() || DEFAULT_MODEL
  const query = new URLSearchParams({
    model,
    language: params.language ?? process.env.DEEPGRAM_LANGUAGE?.trim() ?? 'en',
    // Capitals, punctuation and number formatting.
    smart_format: 'true',
    punctuate: 'true',
    // The point of the whole feature: keep every "um" and "uh" instead of
    // silently cleaning them up the way most engines do by default.
    filler_words: 'true',
    // Sentence-level segmentation, useful if we later want per-sentence timing.
    utterances: 'true',
    paragraphs: 'true',
  })

  let response: Response
  try {
    response = await fetch(`${DEEPGRAM_URL}?${query.toString()}`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${key}`,
        'Content-Type': params.mimeType,
      },
      body: new Uint8Array(params.audio),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (e) {
    const timedOut = e instanceof Error && e.name === 'TimeoutError'
    throw new SpeechRequestError(
      timedOut
        ? 'Transcription timed out. Try a shorter answer.'
        : 'Could not reach the transcription service.',
      timedOut ? 504 : 502,
    )
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    if (response.status === 401 || response.status === 403) {
      throw new SpeechConfigError('DEEPGRAM_API_KEY was rejected. Check the key.')
    }
    throw new SpeechRequestError(
      response.status === 429
        ? 'Transcription service is rate limited. Try again shortly.'
        : `Transcription failed (${response.status}). ${detail.slice(0, 200)}`.trim(),
      response.status === 429 ? 429 : 502,
    )
  }

  const data = (await response.json()) as DeepgramResponse
  const alternative = data.results?.channels?.[0]?.alternatives?.[0]

  if (!alternative) {
    throw new SpeechRequestError('Transcription returned no result.', 502)
  }

  return {
    transcript: (alternative.transcript ?? '').trim(),
    words: toTranscriptWords(alternative.words ?? []),
    durationSec: data.metadata?.duration ?? 0,
    confidence: alternative.confidence ?? 0,
    // metadata.models carries an internal UUID, so report the name we asked for.
    model,
  }
}
