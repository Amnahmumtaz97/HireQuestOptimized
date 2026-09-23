'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Captures the raw microphone audio alongside the live Web Speech preview, so
 * the answer can be re-transcribed exactly (fillers and pauses included) once
 * the user stops. Works in every browser that supports MediaRecorder, including
 * Firefox and Safari where Web Speech is unavailable.
 */

export type RecordedAudio = {
  blob: Blob
  mimeType: string
  durationSec: number
}

export type AudioRecorderState = {
  supported: boolean
  recording: boolean
  elapsedSec: number
  error: string | null
  start: () => Promise<boolean>
  /** Resolves with the recording, or null if nothing usable was captured. */
  stop: () => Promise<RecordedAudio | null>
  cancel: () => void
}

/** Preference order — the first one the browser can actually produce wins. */
const MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
]

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return MIME_CANDIDATES.find((type) => MediaRecorder.isTypeSupported(type))
}

export function useAudioRecorder(): AudioRecorderState {
  const [supported, setSupported] = useState(false)
  const [recording, setRecording] = useState(false)
  const [elapsedSec, setElapsedSec] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startedAtRef = useRef(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        typeof MediaRecorder !== 'undefined' &&
        Boolean(navigator.mediaDevices?.getUserMedia),
    )
  }, [])

  const teardown = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current)
      tickRef.current = null
    }
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    recorderRef.current = null
    setRecording(false)
  }, [])

  const start = useCallback(async () => {
    if (recorderRef.current) return true
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Recording is not supported in this browser.')
      return false
    }

    setError(null)
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
    } catch (e) {
      const denied = e instanceof DOMException && e.name === 'NotAllowedError'
      setError(
        denied
          ? 'Microphone access was blocked. Allow it in your browser settings.'
          : 'Could not access the microphone.',
      )
      return false
    }

    const mimeType = pickMimeType()
    let recorder: MediaRecorder
    try {
      recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
    } catch {
      stream.getTracks().forEach((track) => track.stop())
      setError('Could not start the recorder in this browser.')
      return false
    }

    chunksRef.current = []
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data)
    }

    streamRef.current = stream
    recorderRef.current = recorder
    startedAtRef.current = Date.now()
    setElapsedSec(0)

    // A timeslice means a mid-answer crash still leaves usable chunks behind.
    recorder.start(1000)
    setRecording(true)

    tickRef.current = setInterval(() => {
      setElapsedSec(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 1000)

    return true
  }, [])

  const stop = useCallback(async () => {
    const recorder = recorderRef.current
    if (!recorder) return null

    const durationSec = (Date.now() - startedAtRef.current) / 1000
    const mimeType = recorder.mimeType || 'audio/webm'

    const blob = await new Promise<Blob>((resolve) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: mimeType }))
      }
      if (recorder.state === 'inactive') {
        resolve(new Blob(chunksRef.current, { type: mimeType }))
        return
      }
      recorder.stop()
    })

    teardown()
    chunksRef.current = []

    if (blob.size === 0) return null
    return { blob, mimeType, durationSec }
  }, [teardown])

  const cancel = useCallback(() => {
    const recorder = recorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null
      recorder.stop()
    }
    chunksRef.current = []
    teardown()
  }, [teardown])

  useEffect(() => {
    return () => {
      const recorder = recorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = null
        recorder.stop()
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (tickRef.current) clearInterval(tickRef.current)
    }
  }, [])

  return { supported, recording, elapsedSec, error, start, stop, cancel }
}
