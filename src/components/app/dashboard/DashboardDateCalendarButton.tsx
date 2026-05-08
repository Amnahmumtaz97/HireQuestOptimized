'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { localDateString } from '@/utils/dashboard/date'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] as const

type Props = {
  id: string
  label: string
  value: string
  onChange: (iso: string) => void
  minDate?: string
  maxDate?: string
}

function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

function startOfDayMs(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

export function DashboardDateCalendarButton({ id, label, value, onChange, minDate, maxDate }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [cursorMonth, setCursorMonth] = useState(() => (value ? parseLocal(value) : new Date()))

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  useEffect(() => {
    if (value) setCursorMonth(parseLocal(value))
  }, [value])

  const display = useMemo(() => {
    if (!value) return 'Select date'
    try {
      return parseLocal(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return value
    }
  }, [value])

  const minMs = minDate ? startOfDayMs(parseLocal(minDate)) : undefined
  const maxMs = maxDate ? startOfDayMs(parseLocal(maxDate)) : undefined

  const y = cursorMonth.getFullYear()
  const mon = cursorMonth.getMonth()
  const firstDow = new Date(y, mon, 1).getDay()
  const offsetMon = (firstDow + 6) % 7
  const daysInMonth = new Date(y, mon + 1, 0).getDate()

  const cells: (number | null)[] = [...Array(offsetMon).fill(null)]
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)
  const tail = (7 - (cells.length % 7)) % 7
  for (let i = 0; i < tail; i += 1) cells.push(null)

  const pick = (day: number) => {
    const d = new Date(y, mon, day)
    const t = startOfDayMs(d)
    if (minMs !== undefined && t < minMs) return
    if (maxMs !== undefined && t > maxMs) return
    onChange(localDateString(d))
    setOpen(false)
  }

  const dayDisabled = (day: number) => {
    const t = startOfDayMs(new Date(y, mon, day))
    if (minMs !== undefined && t < minMs) return true
    if (maxMs !== undefined && t > maxMs) return true
    return false
  }

  const prevMonth = () => setCursorMonth(new Date(y, mon - 1, 1))
  const nextMonth = () => setCursorMonth(new Date(y, mon + 1, 1))

  const todayIso = localDateString(new Date())

  return (
    <div ref={wrapRef} className="relative">
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>
      <button
        type="button"
        id={id}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-labelledby={`${id}-label`}
        onClick={() => setOpen((o) => !o)}
        className="hq-panel-btn hq-panel-btn--active btn-micro flex h-9 min-w-[10rem] items-center justify-center gap-2 rounded-lg px-3 text-xs font-medium text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--primary)_45%,transparent)]"
      >
        <Calendar className="h-3.5 w-3.5 flex-shrink-0 opacity-90" aria-hidden />
        <span>{display}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label}
          className="absolute right-0 z-[200] mt-1 w-[min(17.5rem,calc(100vw-2rem))] rounded-xl border border-[var(--hq-border)] bg-[var(--card)] p-3 shadow-[var(--shadow-card)]"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={prevMonth}
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--hq-border)] bg-[var(--hq-row-elevated)] text-foreground transition-colors hover:bg-[var(--hq-stat-surface)]"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="min-w-0 truncate text-center text-sm font-semibold text-foreground">
              {cursorMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-[var(--hq-border)] bg-[var(--hq-row-elevated)] text-foreground transition-colors hover:bg-[var(--hq-stat-surface)]"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          <div className="mt-0.5 grid grid-cols-7 gap-0.5">
            {cells.map((day, i) => {
              if (day === null) {
                return <span key={`e-${i}`} className="aspect-square min-h-[2rem]" />
              }
              const iso = localDateString(new Date(y, mon, day))
              const selected = iso === value
              const isToday = iso === todayIso
              const disabled = dayDisabled(day)
              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(day)}
                  className={[
                    'flex aspect-square min-h-[2rem] items-center justify-center rounded-lg text-xs font-medium transition-colors',
                    disabled
                      ? 'cursor-not-allowed text-muted-foreground/35'
                      : 'text-foreground hover:bg-[var(--hq-row-elevated)]',
                    selected ? 'bg-[var(--primary)] text-primary-foreground shadow-[var(--shadow-glow-sm)] hover:bg-[var(--primary)]' : '',
                    !selected && isToday ? 'ring-1 ring-[color-mix(in_oklab,var(--primary)_50%,transparent)]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
