'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Minimal shape of the Web Speech API. It is not in TypeScript's DOM lib, and
 * Chromium still only ships it behind the `webkit` prefix.
 */
type SpeechRecognitionAlternative = { transcript: string }
type SpeechRecognitionResult = {
  isFinal: boolean
  length: number
  [index: number]: SpeechRecognitionAlternative
}
type SpeechRecognitionEventLike = {
  resultIndex: number
  results: { length: number; [index: number]: SpeechRecognitionResult }
}
type SpeechRecognitionErrorEventLike = { error: string }

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

function joinSpeech(previous: string, chunk: string) {
  const addition = chunk.trim()
  if (!addition) return previous
  if (!previous) return addition
  return `${previous.replace(/\s+$/, '')} ${addition}`
}

export type SpeechDictationState = {
  /** False on Firefox/Safari, where the API is absent. */
  supported: boolean
  listening: boolean
  /**
   * Live preview for the current session: committed finals + current interim.
   * This is what the user sees while speaking; Stop freezes a snapshot of it.
   */
  liveTranscript: string
  /** Not-yet-final fragment (also included at the end of `liveTranscript`). */
  interim: string
  error: string | null
  start: () => void
  /**
   * Hard-stop: invalidates the session synchronously and returns the exact
   * live transcript visible at that moment (finals + interim). Late callbacks
   * for the old session id are ignored.
   */
  stop: () => string
  toggle: () => void
}

type UseSpeechDictationOptions = {
  lang?: string
  disabled?: boolean
  /** Fired on every live-transcript change while the session is active. */
  onLiveTranscript?: (live: string) => void
}

export function useSpeechDictation({
  lang = 'en-US',
  disabled,
  onLiveTranscript,
}: UseSpeechDictationOptions = {}): SpeechDictationState {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  const onLiveRef = useRef(onLiveTranscript)
  const wantsListeningRef = useRef(false)
  /** Monotonic session id — Stop bumps it so late Chrome callbacks are ignored. */
  const sessionIdRef = useRef(0)
  const finalsRef = useRef('')
  const interimRef = useRef('')
  const liveRef = useRef('')

  useEffect(() => {
    onLiveRef.current = onLiveTranscript
  }, [onLiveTranscript])

  useEffect(() => {
    setSupported(getRecognitionCtor() != null)
  }, [])

  /** False after Stop until the next Start — belt-and-suspenders with session id. */
  const acceptingRef = useRef(false)

  const publishLive = useCallback((finals: string, pending: string, sessionId: number) => {
    // Drop anything that arrives after Stop / session invalidation.
    if (!acceptingRef.current || sessionIdRef.current !== sessionId) return
    const live = joinSpeech(finals, pending)
    finalsRef.current = finals
    interimRef.current = pending
    liveRef.current = live
    setInterim(pending)
    setLiveTranscript(live)
    onLiveRef.current?.(live)
  }, [])

  const invalidateSession = useCallback(() => {
    wantsListeningRef.current = false
    acceptingRef.current = false
    // Bump first so any in-flight callback sees a mismatched session id.
    sessionIdRef.current += 1
    const recognition = recognitionRef.current
    if (recognition) {
      recognition.onresult = null
      recognition.onerror = null
      recognition.onend = null
      try {
        recognition.abort()
      } catch {
        try {
          recognition.stop()
        } catch {
          /* already stopped */
        }
      }
    }
    recognitionRef.current = null
    setListening(false)
    setInterim('')
    interimRef.current = ''
  }, [])

  const stop = useCallback(() => {
    // Snapshot BEFORE invalidation — browser preview frozen at this instant.
    const frozen = liveRef.current
    acceptingRef.current = false
    invalidateSession()
    // Keep liveTranscript equal to the frozen snapshot for the UI; do not clear it.
    setLiveTranscript(frozen)
    liveRef.current = frozen
    return frozen
  }, [invalidateSession])

  const start = useCallback(() => {
    if (disabled) return
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setError('Voice input is not available in this browser.')
      return
    }

    invalidateSession()
    const sessionId = sessionIdRef.current + 1
    sessionIdRef.current = sessionId
    acceptingRef.current = true

    finalsRef.current = ''
    interimRef.current = ''
    liveRef.current = ''
    setLiveTranscript('')
    setInterim('')
    setError(null)

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      if (!acceptingRef.current || sessionIdRef.current !== sessionId) return

      let finals = finalsRef.current
      let pending = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) finals = joinSpeech(finals, text)
        else pending += text
      }
      publishLive(finals, pending.trim(), sessionId)
    }

    recognition.onerror = (event) => {
      if (!acceptingRef.current || sessionIdRef.current !== sessionId) return
      if (event.error === 'no-speech' || event.error === 'aborted') return
      setError(
        event.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser settings.'
          : 'Voice input stopped unexpectedly.',
      )
      wantsListeningRef.current = false
      acceptingRef.current = false
      setListening(false)
      setInterim('')
      interimRef.current = ''
    }

    // Chrome ends the stream on every pause; restart while this session is active.
    recognition.onend = () => {
      if (!acceptingRef.current || sessionIdRef.current !== sessionId) return
      setInterim('')
      interimRef.current = ''
      // Keep finals; clear only the pending interim fragment.
      publishLive(finalsRef.current, '', sessionId)
      if (wantsListeningRef.current && acceptingRef.current) {
        try {
          recognition.start()
        } catch {
          wantsListeningRef.current = false
          acceptingRef.current = false
          setListening(false)
        }
        return
      }
      setListening(false)
    }

    recognitionRef.current = recognition
    wantsListeningRef.current = true
    try {
      recognition.start()
      setListening(true)
    } catch {
      wantsListeningRef.current = false
      acceptingRef.current = false
      setError('Could not start voice input.')
    }
  }, [disabled, invalidateSession, lang, publishLive])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  useEffect(() => {
    if (disabled && listening) stop()
  }, [disabled, listening, stop])

  useEffect(() => {
    return () => {
      invalidateSession()
    }
  }, [invalidateSession])

  return { supported, listening, liveTranscript, interim, error, start, stop, toggle }
}
