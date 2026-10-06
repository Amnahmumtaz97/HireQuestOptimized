'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Lightbulb, Mic, Square } from 'lucide-react'
import { useSpeechDictation } from '@/hooks/useSpeechDictation'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import type { DeliveryStats } from '@/lib/speech/transcript'
import {
  deliveryStatsFromPlainText,
  mergeClips,
  type AnswerCapture,
  type AnswerClip,
} from '@/lib/interview/answer-capture'

export type AnswerSaveState = 'idle' | 'dirty' | 'saving' | 'saved'

type InterviewAnswerEditorProps = {
  value: string
  onChange: (value: string) => void
  /**
   * Speech-analysis capture (delivery / annotated verbatim for evaluation).
   * Never used to continuously rewrite the answer after finalization.
   */
  onCapture?: (capture: AnswerCapture | null) => void
  disabled?: boolean
  saveState?: AnswerSaveState
  /** Ctrl/Cmd+Enter advances; wired by the page. */
  onSubmitShortcut?: () => void
  /**
   * Soft Skills (Behavioral / HR): STT only — no textarea / typed mode.
   */
  voiceOnly?: boolean
}

type TranscribeResponse = {
  verbatim?: string
  annotated?: string
  delivery?: DeliveryStats
  meta?: { confidence?: number }
  message?: string
}

/** How the current spoken answer was finalized. */
type TranscriptSource = 'none' | 'deepgram' | 'browser-fallback'

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

function joinSpeech(previous: string, chunk: string) {
  const addition = chunk.trim()
  if (!addition) return previous
  if (!previous.trim()) {
    return addition.charAt(0).toUpperCase() + addition.slice(1)
  }
  return `${previous.replace(/\s+$/, '')} ${addition}`
}

/** Replace only the span dictated after mic-start; keep any prior typed/spoken base. */
function replaceDictatedSpan(base: string, exact: string) {
  const trimmedBase = base.replace(/\s+$/, '')
  if (!trimmedBase) return exact
  if (!exact.trim()) return trimmedBase
  return `${trimmedBase} ${exact}`
}

function formatClock(totalSec: number) {
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

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
  voiceOnly = false,
}: InterviewAnswerEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const words = useMemo(() => countWords(value), [value])

  const [transcribing, setTranscribing] = useState(false)
  const [transcribeError, setTranscribeError] = useState<string | null>(null)
  const [clips, setClips] = useState<AnswerClip[]>([])
  const clipsRef = useRef<AnswerClip[]>([])
  /** After a spoken answer is finalized (Deepgram or browser fallback), lock typing. */
  const [spokenLocked, setSpokenLocked] = useState(false)
  const [transcriptSource, setTranscriptSource] = useState<TranscriptSource>('none')

  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const onCaptureRef = useRef(onCapture)
  onCaptureRef.current = onCapture

  /** Parent setState must not run inside a setClips updater — React replays those during render. */
  const appendClip = useCallback((clip: AnswerClip) => {
    const next = [...clipsRef.current, clip]
    clipsRef.current = next
    setClips(next)
    onCaptureRef.current?.(mergeClips(next))
  }, [])

  /** Answer text before the current Speak session started. */
  const baseValueRef = useRef('')
  /**
   * Blocks Web Speech → answer updates.
   * Set true on Stop; cleared only when a new Speak session starts.
   */
  const dictationClosedRef = useRef(false)
  /**
   * After Deepgram (or fallback) finalization, speech paths must not mutate the answer
   * until the user starts a new Speak session.
   */
  const answerFinalizedRef = useRef(false)
  /** Bumped on each Stop/Start so stale Deepgram promises cannot write. */
  const transcribeGenRef = useRef(0)

  const handleLiveTranscript = useCallback((live: string) => {
    // Stop race: ignore late Web Speech after Stop, during Deepgram, or after finalize.
    if (dictationClosedRef.current || answerFinalizedRef.current) return
    onChangeRef.current(joinSpeech(baseValueRef.current, live))
  }, [])

  const dictation = useSpeechDictation({
    disabled,
    onLiveTranscript: handleLiveTranscript,
  })
  const recorder = useAudioRecorder()

  const canCapture = dictation.supported || recorder.supported
  const capturing = recorder.recording || dictation.listening

  const liveDisplayed = capturing
    ? joinSpeech(baseValueRef.current, dictation.liveTranscript)
    : value

  useEffect(() => {
    if (!disabled) return
    ref.current?.blur()
  }, [disabled])

  useEffect(() => {
    if (spokenLocked || value.trim() || clips.length === 0 || capturing || transcribing) return
    clipsRef.current = []
    setClips([])
    // Soft Skills cannot fall back to typed mode when the draft is cleared.
    if (!voiceOnly) onCaptureRef.current?.(null)
  }, [value, clips.length, capturing, transcribing, spokenLocked, voiceOnly])

  const attachFallbackCapture = useCallback(
    (frozenText: string, durationSec: number) => {
      const text = frozenText.trim()
      if (!text) return
      const clip: AnswerClip = {
        verbatim: text,
        annotated: text,
        delivery: deliveryStatsFromPlainText(text, durationSec),
        confidence: null,
      }
      appendClip(clip)
    },
    [appendClip],
  )

  const stopAndTranscribe = useCallback(() => {
    // ── 1) Freeze Web Speech immediately (before any async work) ───────────
    dictationClosedRef.current = true
    const browserSnapshot = dictation.stop()
    const browserPreview = replaceDictatedSpan(baseValueRef.current, browserSnapshot)
    onChangeRef.current(browserPreview)
    valueRef.current = browserPreview

    // Keep the preview locked while Deepgram runs; typing stays blocked.
    setSpokenLocked(true)
    setTranscriptSource('none')
    setTranscribeError(null)

    const gen = ++transcribeGenRef.current
    const elapsedSec = recorder.elapsedSec

    void (async () => {
      const audio = await recorder.stop()
      if (gen !== transcribeGenRef.current) return

      if (!audio) {
        // No blob — finalize with browser preview only.
        answerFinalizedRef.current = true
        setTranscriptSource('browser-fallback')
        setTranscribeError(
          browserSnapshot.trim()
            ? null
            : 'Nothing was recorded. Check your microphone and try again.',
        )
        if (voiceOnly) attachFallbackCapture(browserPreview, elapsedSec)
        return
      }

      setTranscribing(true)
      try {
        const form = new FormData()
        const extension = audio.mimeType.includes('mp4') ? 'mp4' : 'webm'
        form.append('audio', audio.blob, `answer.${extension}`)

        const response = await fetch('/api/speech/transcribe', {
          method: 'POST',
          body: form,
        })
        const data = (await response.json()) as TranscribeResponse

        if (gen !== transcribeGenRef.current) return

        if (!response.ok) {
          // Deepgram failed — keep browser preview; do not reopen Web Speech.
          answerFinalizedRef.current = true
          setTranscriptSource('browser-fallback')
          setTranscribeError(
            data.message ??
              'Final transcription failed. Your live transcript was kept as the answer.',
          )
          if (voiceOnly) attachFallbackCapture(browserPreview, audio.durationSec)
          return
        }

        const verbatim = (data.verbatim ?? '').trim()
        const annotated = (data.annotated ?? verbatim).trim()

        // Frozen live transcript stays as the answer — Deepgram never overwrites it.
        answerFinalizedRef.current = true
        setSpokenLocked(true)

        if (!verbatim) {
          setTranscriptSource('browser-fallback')
          setTranscribeError(
            'No speech was detected in the recording. Your live transcript was kept.',
          )
          if (voiceOnly) attachFallbackCapture(browserPreview, audio.durationSec)
          return
        }

        setTranscriptSource('deepgram')

        // Speech analysis only (evaluation) — do not mutate the frozen answer.
        if (data.delivery) {
          const clip: AnswerClip = {
            verbatim,
            annotated: annotated || verbatim,
            delivery: data.delivery,
            confidence: typeof data.meta?.confidence === 'number' ? data.meta.confidence : null,
          }
          appendClip(clip)
        } else if (voiceOnly) {
          attachFallbackCapture(browserPreview, audio.durationSec)
        }
      } catch {
        if (gen !== transcribeGenRef.current) return
        answerFinalizedRef.current = true
        setTranscriptSource('browser-fallback')
        setTranscribeError(
          'Could not reach the transcription service. Your live transcript was kept as the answer.',
        )
        if (voiceOnly) attachFallbackCapture(browserPreview, elapsedSec)
      } finally {
        if (gen === transcribeGenRef.current) setTranscribing(false)
      }
    })()
  }, [appendClip, attachFallbackCapture, dictation, recorder, voiceOnly])

  const handleToggle = useCallback(() => {
    if (capturing || transcribing) {
      if (capturing) stopAndTranscribe()
      return
    }

    // New Speak session — invalidate any in-flight Deepgram from a prior Stop.
    transcribeGenRef.current += 1
    dictationClosedRef.current = false
    answerFinalizedRef.current = false
    baseValueRef.current = valueRef.current
    setSpokenLocked(false)
    setTranscriptSource('none')
    setTranscribeError(null)
    setTranscribing(false)

    if (!recorder.supported) {
      dictation.start()
      return
    }

    void recorder.start().then((started) => {
      if (started) dictation.start()
    })
  }, [capturing, dictation, recorder, stopAndTranscribe, transcribing])

  const label = saveLabel(saveState)
  const inputLocked = Boolean(disabled || capturing || transcribing || spokenLocked)
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
              title={capturing ? 'Stop and finalize transcript' : 'Answer out loud'}
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
      {transcribeError ? <p className="hq-iv-dictation__error">{transcribeError}</p> : null}

      <div className="hq-iv-answer__body">
        {canCapture && capturing ? (
          <div className="hq-iv-voice hq-iv-voice--live" role="status" aria-live="polite">
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
                aria-pressed
                aria-label="Stop recording"
                className="hq-iv-voice__mic"
                title="Stop and finalize transcript"
              >
                <Square aria-hidden="true" />
              </button>
              <VoiceWave side="right" />
            </div>
            <p className="hq-iv-voice__title">
              Listening{recorder.recording ? ` · ${formatClock(recorder.elapsedSec)}` : ''}
            </p>
            <p className="hq-iv-voice__live-transcript" aria-label="Live transcript">
              {liveDisplayed.trim()
                ? liveDisplayed
                : dictation.supported
                  ? 'Start speaking…'
                  : 'Live preview needs Chrome. Recording — Stop when done.'}
              {dictation.interim ? (
                <span className="hq-iv-voice__interim-caret" aria-hidden="true" />
              ) : null}
            </p>
          </div>
        ) : spokenLocked || transcribing ? (
          <div className="hq-iv-frozen" aria-live="polite">
            {transcribing ? (
              <p className="hq-iv-frozen__status">
                <Loader2 className="hq-iv-answer__spin" aria-hidden="true" />
                Analyzing speech… your answer stays frozen.
              </p>
            ) : transcriptSource === 'deepgram' ? (
              <p className="hq-iv-frozen__status">Answer frozen · speech analysis ready</p>
            ) : transcriptSource === 'browser-fallback' ? (
              <p className="hq-iv-frozen__status">Answer frozen from live transcript</p>
            ) : null}
            <p className="hq-iv-frozen__label">Your answer</p>
            <p className="hq-iv-frozen__text">{value}</p>
          </div>
        ) : voiceOnly ? (
          <div className="hq-iv-voice" role="status">
            {!canCapture ? (
              <p className="hq-iv-dictation__error">
                Soft Skills interviews require a microphone and speech recognition. Use Chrome (or
                Edge) and allow mic access.
              </p>
            ) : null}
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
                disabled={disabled || busy || !canCapture}
                aria-pressed={false}
                aria-label="Speak your answer"
                className="hq-iv-voice__mic"
                title="Speak your answer"
              >
                <Mic aria-hidden="true" />
              </button>
              <VoiceWave side="right" />
            </div>
            <p className="hq-iv-voice__title">Tap the mic and speak your answer</p>
            <p className="hq-iv-voice__text">
              Soft Skills is voice-only. Stop freezes your live transcript — it will not be rewritten.
            </p>
            {value.trim() ? (
              <p className="hq-iv-frozen__text" style={{ marginTop: '0.75rem' }}>
                {value}
              </p>
            ) : null}
          </div>
        ) : (
          <>
            {canCapture && !value.trim() ? (
              <div className="hq-iv-voice" role="status">
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
                    disabled={disabled || busy}
                    aria-pressed={false}
                    aria-label="Speak your answer"
                    className="hq-iv-voice__mic"
                    title="Speak your answer"
                  >
                    <Mic aria-hidden="true" />
                  </button>
                  <VoiceWave side="right" />
                </div>
                <p className="hq-iv-voice__title">Tap the mic and speak your answer</p>
                <p className="hq-iv-voice__text">
                  Or type below. Stop freezes live dictation; Deepgram analyzes without rewriting it.
                </p>
              </div>
            ) : null}
            <textarea
              ref={ref}
              value={value}
              readOnly={inputLocked}
              aria-disabled={inputLocked}
              aria-label="Your answer"
              autoComplete="off"
              autoCorrect="off"
              spellCheck
              data-lpignore="true"
              data-form-type="other"
              onChange={(e) => {
                if (inputLocked) return
                onChange(e.target.value)
              }}
              onKeyDown={(e) => {
                if (inputLocked) {
                  e.preventDefault()
                  return
                }
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault()
                  onSubmitShortcut?.()
                }
              }}
              className="hq-iv-answer__input"
              placeholder={canCapture ? 'Type here, or use Speak…' : 'Type your answer here…'}
            />
          </>
        )}
      </div>

      <footer className="hq-iv-answer__foot">
        <p className="hq-iv-answer__hint">
          <Lightbulb aria-hidden="true" />
          {spokenLocked
            ? voiceOnly
              ? 'Answer locked from your spoken transcript. Tap Speak again to add more, or continue.'
              : 'Answer locked. Tap Speak again to add more, or continue to the next question.'
            : voiceOnly
              ? 'Answer out loud — Soft Skills uses speech-to-text only.'
              : 'Speak clearly and in order — give an example where you can.'}
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
