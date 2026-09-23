import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkRateLimit } from '@/lib/rate-limit'
import {
  SpeechConfigError,
  SpeechRequestError,
  transcribeAudio,
} from '@/lib/speech/deepgram'
import {
  buildAnnotatedTranscript,
  buildVerbatimTranscript,
  computePauses,
  summarizeDelivery,
} from '@/lib/speech/transcript'

export const runtime = 'nodejs'
// Transcription of a long answer can outrun the default budget.
export const maxDuration = 60

const MAX_BYTES = 25 * 1024 * 1024

/** MediaRecorder emits webm/ogg/mp4 depending on the browser. */
const ALLOWED_PREFIXES = ['audio/', 'video/webm', 'application/octet-stream']

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const rate = checkRateLimit(`speech-transcribe:${session.user.id}`, {
      limit: 90,
      windowMs: 60 * 60 * 1000,
    })
    if (rate.ok === false) {
      return NextResponse.json(
        { message: `Too many transcriptions. Try again in ${rate.retryAfterSec}s.` },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
      )
    }

    const form = await request.formData()
    const file = form.get('audio')
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: 'Missing audio file (field name: audio)' },
        { status: 400 },
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { message: 'The recording was empty. Check your microphone and try again.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { message: 'Recording is too long. Keep answers under about 20 minutes.' },
        { status: 400 },
      )
    }

    const mimeType = (file.type || 'application/octet-stream').split(';')[0].trim()
    if (!ALLOWED_PREFIXES.some((prefix) => mimeType.startsWith(prefix))) {
      return NextResponse.json(
        { message: `Unsupported audio format: ${mimeType}` },
        { status: 400 },
      )
    }

    const languageField = form.get('language')
    const language =
      typeof languageField === 'string' && /^[a-z]{2}(-[A-Z]{2})?$/.test(languageField)
        ? languageField
        : undefined

    const audio = Buffer.from(await file.arrayBuffer())
    const result = await transcribeAudio({ audio, mimeType, language })

    if (result.words.length === 0) {
      return NextResponse.json(
        {
          message:
            'No speech was detected in the recording. Check your microphone level.',
        },
        { status: 422 },
      )
    }

    const delivery = summarizeDelivery(result.words, {
      audioDurationSec: result.durationSec,
    })

    return NextResponse.json({
      // Exactly what was said, fillers included, no markers.
      verbatim: buildVerbatimTranscript(result.words),
      // Same text with [pause 1.4s] markers at every hesitation.
      annotated: buildAnnotatedTranscript(result.words),
      words: result.words,
      pauses: computePauses(result.words),
      delivery,
      meta: {
        model: result.model,
        confidence: result.confidence,
        durationSec: result.durationSec,
      },
    })
  } catch (e) {
    if (e instanceof SpeechConfigError) {
      console.error('[speech] not configured', e.message)
      // 501 lets the client fall back to the live browser transcript.
      return NextResponse.json({ message: e.message }, { status: 501 })
    }
    if (e instanceof SpeechRequestError) {
      console.error('[speech] provider error', e.message)
      return NextResponse.json({ message: e.message }, { status: e.status })
    }
    console.error('[speech] unexpected', e)
    return NextResponse.json({ message: 'Transcription failed' }, { status: 500 })
  }
}
