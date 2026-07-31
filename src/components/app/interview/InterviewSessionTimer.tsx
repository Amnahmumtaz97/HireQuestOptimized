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

  return (
    <div
      className={[
        'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm tabular-nums',
        isExpired
          ? 'border-red-500/40 bg-red-500/10 text-red-700 dark:border-red-500/50 dark:bg-red-600/15 dark:text-red-200'
          : 'border-border bg-card text-foreground shadow-[var(--shadow-card)]',
      ].join(' ')}
      role="timer"
      aria-live="polite"
      aria-label={
        hasStarted
          ? `Time remaining: ${formatMmSs(displaySeconds)}`
          : `Session length ${formatMmSs(totalSeconds)}, timer starts when you begin`
      }
    >
      <AlarmClock
        className={`h-4 w-4 shrink-0 ${isExpired ? 'text-red-600 dark:text-red-300' : 'text-muted-foreground'}`}
      />
      <div className="flex min-w-[5.5rem] flex-col leading-tight">
        <span
          className={`text-base font-semibold tracking-tight ${isExpired ? 'text-red-700 dark:text-red-100' : 'text-foreground'}`}
        >
          {formatMmSs(displaySeconds)}
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">
          {isExpired ? "Time's up" : hasStarted ? 'Remaining' : 'Starts when you begin'}
        </span>
      </div>
    </div>
  )
}
