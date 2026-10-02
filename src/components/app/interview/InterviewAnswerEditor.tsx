'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Lightbulb, Mic, Square } from 'lucide-react'
import { useSpeechDictation } from '@/hooks/useSpeechDictation'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import type { DeliveryStats } from '@/lib/speech/transcript'
import { mergeClips, type AnswerCapture, type AnswerClip } from '@/lib/interview/answer-capture'

export type AnswerSaveState = 'idle' | 'dirty' | 'saving' | 'saved'

type InterviewAnswerEditorProps = {
  value: string
  onChange: (value: string) => void
  /**
   * Fires with the merged spoken capture after every recording, and with `null`
   * when the candidate wipes the answer and starts over by typing.
   */
  onCapture?: (capture: AnswerCapture | null) => void
  disabled?: boolean
  saveState?: AnswerSaveState
  /** Ctrl/Cmd+Enter advances; wired by the page. */
  onSubmitShortcut?: () => void
}

type TranscribeResponse = {
  verbatim?: string
  annotated?: string
  delivery?: DeliveryStats
  meta?: { confidence?: number }
  message?: string
}

function countWords(text: string) {
  const t = text.trim()
  if (!t) return 0
  return t.split(/\s+/).length
}

function saveLabel(state: AnswerSaveState) {
  if (state === 'saving') return 'Saving…'
  if (state === 'saved') return 'Autosaved'
  if (state === 'dirty') return 'Unsaved changes'
  return ''
}

/** Joins dictated speech onto the draft with sane spacing. */
function appendSpeech(previous: string, chunk: string) {
  const addition = chunk.trim()
  if (!addition) return previous
  if (!previous) return addition.charAt(0).toUpperCase() + addition.slice(1)
  return `${previous.replace(/\s+$/, '')} ${addition}`
}

/** Splices the exact transcript in place of whatever the live preview appended. */
function replaceDictatedSpan(base: string, exact: string) {
  const trimmedBase = base.replace(/\s+$/, '')
  if (!trimmedBase) return exact
  return `${trimmedBase} ${exact}`
}

function formatClock(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * Two stacked waveform traces running out from the mic. A flat line with a few
 * spikes at rest; while recording the stroke "draws" itself continuously and
 * a second, softer trace runs offset behind it. Colours come from the theme.
 */
function VoiceWave({ side }: { side: 'left' | 'right' }) {
  const gradientId = `hq-iv-voice-grad-${side}`
  return (
    <svg
      className={`hq-iv-voice__wave hq-iv-voice__wave--${side}`}
      viewBox="0 0 260 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" className="hq-iv-voice__stop hq-iv-voice__stop--far" />
          <stop offset="100%" className="hq-iv-voice__stop hq-iv-voice__stop--near" />
        </linearGradient>
      </defs>
      <path
        className="hq-iv-voice__trace hq-iv-voice__trace--echo"
        stroke={`url(#${gradientId})`}
        d="M0 40 H34 L44 40 L50 26 L58 54 L66 34 L74 46 L82 40 H108 L116 40 L122 14 L130 66 L138 30 L146 50 L154 40 H190 L198 40 L204 22 L212 58 L220 36 L228 44 L236 40 H260"
      />
      <path
        className="hq-iv-voice__trace"
        stroke={`url(#${gradientId})`}
        d="M0 40 H30 L40 40 L46 20 L54 60 L62 32 L70 48 L78 40 H104 L112 40 L118 8 L126 72 L134 28 L142 52 L150 40 H186 L194 40 L200 16 L208 64 L216 34 L224 46 L232 40 H260"
      />
    </svg>
  )
}

export function InterviewAnswerEditor({
  value,
  onChange,
  onCapture,
  disabled,
  saveState = 'idle',
  onSubmitShortcut,
}: InterviewAnswerEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const words = useMemo(() => countWords(value), [value])

  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  // Every clip recorded for this answer. The textarea only ever holds the verbatim
  // words; pause markers live in the annotated transcript shown below it.
  const [clips, setClips] = useState<AnswerClip[]>([])
  const [showAnnotated, setShowAnnotated] = useState(false)

  const capture = useMemo(() => mergeClips(clips), [clips])
  const delivery = capture?.delivery ?? null

  // Read the live value from a ref so the dictation hook never sees a stale draft.
  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const onCaptureRef = useRef(onCapture)
  onCaptureRef.current = onCapture

  // The draft as it stood when recording began — the exact transcript replaces
  // everything dictated after this point.
  const baseValueRef = useRef('')

  const handleTranscript = useCallback(
    (chunk: string) => {
      onChange(appendSpeech(valueRef.current, chunk))
    },
    [onChange],
  )

  const dictation = useSpeechDictation({ onTranscript: handleTranscript, disabled })
  const recorder = useAudioRecorder()

  // Live preview needs Web Speech; exact transcription only needs MediaRecorder.
  const canCapture = dictation.supported || recorder.supported
  const capturing = recorder.recording || dictation.listening

  useEffect(() => {
    if (!disabled) return
    ref.current?.blur()
  }, [disabled])

  // A wiped answer is a fresh start: forget the recordings so a retyped answer is saved as typed.
  useEffect(() => {
    if (value.trim() || clips.length === 0 || capturing || transcribing) return
    setClips([])
    onCaptureRef.current?.(null)
  }, [value, clips.length, capturing, transcribing])

  const stopAndTranscribe = useCallback(async () => {
    dictation.stop()
    const audio = await recorder.stop()

    if (!audio) {
      // No recorder (or nothing captured) — the live dictation text is all we have.
      return
    }

    setTranscribing(true)
    setTranscribeError(null)
    try {
      const form = new FormData()
      const extension = audio.mimeType.includes('mp4') ? 'mp4' : 'webm'
      form.append('audio', audio.blob, `answer.${extension}`)

      const response = await fetch('/api/speech/transcribe', {
        method: 'POST',
        body: form,
      })
      const data = (await response.json()) as TranscribeResponse

      if (!response.ok) {
        // The live-dictated draft stays put; we only surface why the exact pass failed.
        setTranscribeError(data.message ?? 'Could not transcribe the recording.')
        return
      }

      const verbatim = data.verbatim ?? ''
      const annotated = data.annotated ?? verbatim
      if (!verbatim.trim()) return

      onChange(replaceDictatedSpan(baseValueRef.current, verbatim))

      if (data.delivery) {
        const clip: AnswerClip = {
          verbatim,
          annotated,
          delivery: data.delivery,
          confidence: typeof data.meta?.confidence === 'number' ? data.meta.confidence : null,
        }
        setClips((prev) => {
          const next = [...prev, clip]
          onCaptureRef.current?.(mergeClips(next))
          return next
        })
      }
    } catch {
      setTranscribeError('Could not reach the transcription service.')
    } finally {
      setTranscribing(false)
    }
  }, [dictation, onChange, recorder])

  const handleToggle = useCallback(() => {
    if (capturing) {
      void stopAndTranscribe()
      return
    }

    baseValueRef.current = valueRef.current
    setTranscribeError(null)

    if (!recorder.supported) {
      dictation.start()
      return
    }

    // Fire the recorder first: it is the source of the exact transcript, and the
    // live preview is only a nicety on top of it. If the mic is denied there is
    // nothing for dictation to hear either, so it stays off.
    void recorder.start().then((started) => {
      if (started) dictation.start()
    })
  }, [capturing, dictation, recorder, stopAndTranscribe])

  const label = saveLabel(saveState)
  const busy = capturing || transcribing

  return (
    <section className="hq-iv-answer" aria-label="Your answer">
      <div className="hq-iv-answer__head">
        <h3 className="hq-iv-answer__title">Your answer</h3>

        <div className="hq-iv-answer__tools">
          <span className="hq-iv-answer__count">
            {words} {words === 1 ? 'word' : 'words'}
          </span>

          {canCapture ? (
            <button
              type="button"
              onClick={handleToggle}
              disabled={disabled || transcribing}
              aria-pressed={capturing}
              className={`hq-iv-mic btn-micro${capturing ? ' hq-iv-mic--on' : ''}`}
              title={capturing ? 'Stop and transcribe' : 'Answer out loud'}
            >
              {transcribing ? (
                <>
                  <Loader2 className="hq-iv-answer__spin" aria-hidden="true" />
                  <span>Transcribing…</span>
                </>
              ) : capturing ? (
                <>
                  <Square aria-hidden="true" />
                  <span>Stop{recorder.recording ? ` ${formatClock(recorder.elapsedSec)}` : ''}</span>
                </>
              ) : (
                <>
                  <Mic aria-hidden="true" />
                  <span className="hq-iv-mic__label">Speak</span>
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {dictation.error ? <p className="hq-iv-dictation__error">{dictation.error}</p> : null}
      {recorder.error ? <p className="hq-iv-dictation__error">{recorder.error}</p> : null}
      {transcribeError ? (
        <p className="hq-iv-dictation__error">{transcribeError}</p>
      ) : null}

      {delivery ? (
        <div className="hq-iv-delivery">
          <ul className="hq-iv-delivery__stats">
            <li>
              <strong>{delivery.wordsPerMinute}</strong> wpm
            </li>
            <li>
              <strong>{delivery.disfluencies.total}</strong> filler
              {delivery.disfluencies.total === 1 ? '' : 's'}
            </li>
            <li>
              <strong>{delivery.pauses.count}</strong> pause
              {delivery.pauses.count === 1 ? '' : 's'}
            </li>
            <li>
              longest <strong>{delivery.pauses.longestSec}s</strong>
            </li>
            <li>
              silence <strong>{Math.round(delivery.silenceRatio * 100)}%</strong>
            </li>
            {clips.length > 1 ? (
              <li>
                <strong>{clips.length}</strong> clips
              </li>
            ) : null}
          </ul>
          <button
            type="button"
            onClick={() => setShowAnnotated((v) => !v)}
            className="hq-iv-delivery__toggle btn-micro"
            aria-pressed={showAnnotated}
          >
            {showAnnotated ? 'Hide pause markers' : 'Show pause markers'}
          </button>
        </div>
      ) : null}

      {delivery && showAnnotated && capture ? (
        <p className="hq-iv-annotated" aria-label="Transcript with pause markers">
          {capture.transcript.annotated}
        </p>
      ) : null}

      <div className="hq-iv-answer__body">
        <textarea
          ref={ref}
          value={value}
          readOnly={disabled || busy}
          aria-disabled={disabled || busy}
          aria-label="Your answer"
          autoComplete="off"
          autoCorrect="off"
          spellCheck
          data-lpignore="true"
          data-form-type="other"
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              e.preventDefault()
              onSubmitShortcut?.()
            }
          }}
          className="hq-iv-answer__input"
          placeholder={canCapture ? undefined : 'Type your answer here…'}
        />

        {/* The mic lives inside the box: the empty state invites speech, and
            recording / transcribing states animate in place of the text. */}
        {canCapture && (capturing || transcribing || !value.trim()) ? (
          <div
            className={`hq-iv-voice${capturing ? ' hq-iv-voice--live' : ''}${transcribing ? ' hq-iv-voice--busy' : ''}`}
            role="status"
            aria-live="polite"
          >
            <div className="hq-iv-voice__stage">
              <VoiceWave side="left" />
              <span className="hq-iv-voice__halo" aria-hidden="true">
                <span className="hq-iv-voice__glow" />
                <span className="hq-iv-voice__orbit" />
                <span className="hq-iv-voice__orbit hq-iv-voice__orbit--outer" />
              </span>
              <button
                type="button"
                onClick={handleToggle}
                disabled={disabled || transcribing}
                aria-pressed={capturing}
                aria-label={capturing ? 'Stop recording' : 'Speak your answer'}
                className="hq-iv-voice__mic"
                title={capturing ? 'Stop and transcribe' : 'Speak your answer'}
              >
                {transcribing ? (
                  <Loader2 className="hq-iv-voice__spin" aria-hidden="true" />
                ) : capturing ? (
                  <Square aria-hidden="true" />
                ) : (
                  <Mic aria-hidden="true" />
                )}
              </button>
              <VoiceWave side="right" />
            </div>
            <p className="hq-iv-voice__title">
              {transcribing
                ? 'Transcribing your exact words…'
                : capturing
                  ? `Listening${recorder.recording ? ` · ${formatClock(recorder.elapsedSec)}` : ''}`
                  : 'Tap the mic and speak your answer'}
            </p>
            <p className="hq-iv-voice__text">
              {capturing
                ? dictation.interim || (dictation.supported ? 'Start speaking — tap the square when you are done.' : 'Recording — your words appear when you stop.')
                : transcribing
                  ? 'Capturing fillers, pauses and pace too.'
                  : 'Your words, pauses and pace are captured for feedback.'}
            </p>
          </div>
        ) : null}
      </div>

      <footer className="hq-iv-answer__foot">
        <p className="hq-iv-answer__hint">
          <Lightbulb aria-hidden="true" />
          Speak clearly and in order — give an example where you can.
        </p>
        <div className="hq-iv-answer__status">
          {label ? (
            <span
              className={`hq-iv-answer__save hq-iv-answer__save--${saveState}`}
              role="status"
              aria-live="polite"
            >
              {saveState === 'saving' ? (
                <Loader2 className="hq-iv-answer__spin" aria-hidden="true" />
              ) : saveState === 'saved' ? (
                <Check aria-hidden="true" />
              ) : null}
              {label}
            </span>
          ) : null}
          <kbd className="hq-iv-answer__kbd">Ctrl + Enter</kbd>
        </div>
      </footer>
    </section>
  )
}
