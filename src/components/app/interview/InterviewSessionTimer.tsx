'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AlarmClock } from 'lucide-react'

function formatMmSs(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${r.toString().padStart(2, '0')}`
}

type InterviewSessionTimerProps = {
  durationMinutes: number | null | undefined
  interviewStartedAt: string | null | undefined
  status: 'created' | 'in_progress' | 'completed'
  onTimeExpired?: () => void
}

export function InterviewSessionTimer({
  durationMinutes,
  interviewStartedAt,
  status,
  onTimeExpired,
}: InterviewSessionTimerProps) {
  const [tick, setTick] = useState(0)
  const expiredRef = useRef(false)

  const totalSeconds = useMemo(() => {
    const d = durationMinutes
    if (typeof d !== 'number' || d < 1) return null
    return d * 60
  }, [durationMinutes])

  const remainingSeconds = useMemo(() => {
    if (totalSeconds == null) return null
    if (!interviewStartedAt) return totalSeconds
    const start = Date.parse(interviewStartedAt)
    if (Number.isNaN(start)) return totalSeconds
    const elapsed = (Date.now() - start) / 1000
    return totalSeconds - elapsed
  }, [totalSeconds, interviewStartedAt, tick])

  useEffect(() => {
    expiredRef.current = false
  }, [interviewStartedAt, totalSeconds])

  useEffect(() => {
    if (totalSeconds == null || status === 'completed') return
    const id = window.setInterval(() => setTick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [totalSeconds, status])

  useEffect(() => {
    if (remainingSeconds == null || interviewStartedAt == null) return
    if (remainingSeconds > 0 || expiredRef.current) return
    expiredRef.current = true
    onTimeExpired?.()
  }, [remainingSeconds, interviewStartedAt, onTimeExpired])

  if (totalSeconds == null || status === 'completed') {
    return null
  }

  const displaySeconds =
    interviewStartedAt && remainingSeconds != null ? Math.max(0, remainingSeconds) : totalSeconds
  const isExpired = Boolean(interviewStartedAt && remainingSeconds != null && remainingSeconds <= 0)
  const hasStarted = Boolean(interviewStartedAt)

  /** Escalates as the clock runs down so the pressure is visible before it's too late. */
  const tone = isExpired
    ? 'expired'
    : !hasStarted
      ? 'idle'
      : displaySeconds <= 60
        ? 'critical'
        : displaySeconds <= 300
          ? 'warning'
          : 'normal'

  return (
    <div
      className={`hq-iv-timer hq-iv-timer--${tone}`}
      role="timer"
      aria-live={tone === 'critical' ? 'assertive' : 'polite'}
      aria-label={
        hasStarted
          ? `Time remaining: ${formatMmSs(displaySeconds)}`
          : `Session length ${formatMmSs(totalSeconds)}, timer starts when you begin`
      }
    >
      <AlarmClock className="hq-iv-timer__ico" aria-hidden="true" />
      <div className="hq-iv-timer__body">
        <span className="hq-iv-timer__value">{formatMmSs(displaySeconds)}</span>
        <span className="hq-iv-timer__label">
          {isExpired ? "Time's up" : hasStarted ? 'Time left' : 'Not started'}
        </span>
      </div>
    </div>
  )
}
