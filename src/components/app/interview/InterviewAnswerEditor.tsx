'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Lightbulb, Mic, Square } from 'lucide-react'
import { useSpeechDictation } from '@/hooks/useSpeechDictation'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import type { DeliveryStats } from '@/lib/speech/transcript'

export type AnswerSaveState = 'idle' | 'dirty' | 'saving' | 'saved'

type InterviewAnswerEditorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  saveState?: AnswerSaveState
  /** Ctrl/Cmd+Enter advances; wired by the page. */
  onSubmitShortcut?: () => void
}

type TranscribeResponse = {
  verbatim?: string
  annotated?: string
  delivery?: DeliveryStats
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

export function InterviewAnswerEditor({
  value,
  onChange,
  disabled,
  saveState = 'idle',
  onSubmitShortcut,
}: InterviewAnswerEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const words = useMemo(() => countWords(value), [value])

  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [delivery, setDelivery] = useState<DeliveryStats | null>(null)
  const [showPauses, setShowPauses] = useState(true)
  // Both forms of the last transcript, so the pause toggle can swap between them.
  const lastResultRef = useRef<{ base: string; verbatim: string; annotated: string } | null>(
    null,
  )

  // Read the live value from a ref so the dictation hook never sees a stale draft.
  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

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

      lastResultRef.current = { base: baseValueRef.current, verbatim, annotated }
      setDelivery(data.delivery ?? null)
      onChange(replaceDictatedSpan(baseValueRef.current, showPauses ? annotated : verbatim))
    } catch {
      setTranscribeError('Could not reach the transcription service.')
    } finally {
      setTranscribing(false)
    }
  }, [dictation, onChange, recorder, showPauses])

  const handleToggle = useCallback(() => {
    if (capturing) {
      void stopAndTranscribe()
      return
    }

    baseValueRef.current = valueRef.current
    setTranscribeError(null)
    setDelivery(null)
    lastResultRef.current = null

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

  const handleTogglePauses = useCallback(() => {
    const next = !showPauses
    setShowPauses(next)
    const last = lastResultRef.current
    if (!last) return
    onChange(replaceDictatedSpan(last.base, next ? last.annotated : last.verbatim))
  }, [onChange, showPauses])

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

      {capturing ? (
        <div className="hq-iv-dictation" role="status" aria-live="polite">
          <span className="hq-iv-dictation__wave" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <p className="hq-iv-dictation__text">
            {dictation.interim
              ? dictation.interim
              : dictation.supported
                ? 'Listening — start speaking your answer…'
                : 'Recording — your exact words arrive when you stop.'}
          </p>
        </div>
      ) : null}

      {transcribing ? (
        <div className="hq-iv-dictation" role="status" aria-live="polite">
          <Loader2 className="hq-iv-answer__spin" aria-hidden="true" />
          <p className="hq-iv-dictation__text">
            Transcribing your exact words, fillers and pauses…
          </p>
        </div>
      ) : null}

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
          </ul>
          <button
            type="button"
            onClick={handleTogglePauses}
            className="hq-iv-delivery__toggle btn-micro"
            aria-pressed={showPauses}
          >
            {showPauses ? 'Hide pause markers' : 'Show pause markers'}
          </button>
        </div>
      ) : null}

      <textarea
        ref={ref}
        value={value}
        readOnly={disabled || busy}
        aria-disabled={disabled || busy}
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
        placeholder="Start typing your answer here…"
      />

      <footer className="hq-iv-answer__foot">
        <p className="hq-iv-answer__hint">
          <Lightbulb aria-hidden="true" />
          Be clear and structured — explain with an example where you can.
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
