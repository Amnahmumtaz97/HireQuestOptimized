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

export type SpeechDictationState = {
  /** False on Firefox/Safari, where the API is absent. */
  supported: boolean
  listening: boolean
  /** Text recognised but not yet finalised; render it as a preview. */
  interim: string
  error: string | null
  start: () => void
  stop: () => void
  toggle: () => void
}

type UseSpeechDictationOptions = {
  /** Called with each finalised chunk, ready to append to the answer. */
  onTranscript: (text: string) => void
  lang?: string
  disabled?: boolean
}

export function useSpeechDictation({
  onTranscript,
  lang = 'en-US',
  disabled,
}: UseSpeechDictationOptions): SpeechDictationState {
  const [supported, setSupported] = useState(false)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  // Kept in a ref so restarting never rebuilds the recogniser mid-session.
  const onTranscriptRef = useRef(onTranscript)
  const wantsListeningRef = useRef(false)

  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  useEffect(() => {
    setSupported(getRecognitionCtor() != null)
  }, [])

  const stop = useCallback(() => {
    wantsListeningRef.current = false
    recognitionRef.current?.stop()
    setListening(false)
    setInterim('')
  }, [])

  const start = useCallback(() => {
    if (disabled) return
    const Ctor = getRecognitionCtor()
    if (!Ctor) {
      setError('Voice input is not available in this browser.')
      return
    }

    setError(null)
    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalChunk = ''
      let pending = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const text = result[0]?.transcript ?? ''
        if (result.isFinal) finalChunk += text
        else pending += text
      }
      setInterim(pending)
      if (finalChunk.trim()) onTranscriptRef.current(finalChunk)
    }

    recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return
      setError(
        event.error === 'not-allowed'
          ? 'Microphone access was blocked. Allow it in your browser settings.'
          : 'Voice input stopped unexpectedly.',
      )
      wantsListeningRef.current = false
      setListening(false)
      setInterim('')
    }

    // Chrome ends the stream on every pause; restart while the user still wants it.
    recognition.onend = () => {
      setInterim('')
      if (wantsListeningRef.current) {
        try {
          recognition.start()
        } catch {
          wantsListeningRef.current = false
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
      setError('Could not start voice input.')
    }
  }, [disabled, lang])

  const toggle = useCallback(() => {
    if (listening) stop()
    else start()
  }, [listening, start, stop])

  useEffect(() => {
    if (disabled && listening) stop()
  }, [disabled, listening, stop])

  useEffect(() => {
    return () => {
      wantsListeningRef.current = false
      recognitionRef.current?.abort()
    }
  }, [])

  return { supported, listening, interim, error, start, stop, toggle }
}
