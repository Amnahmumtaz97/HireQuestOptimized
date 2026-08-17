'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Video } from 'lucide-react'
import type { InterviewSession } from '@/components/app/dashboard/types'
import {
  countSessionsByLocalDate,
  localDateString,
  shiftMonthAnchor,
  weekDaysSundayStart,
} from '@/utils/dashboard/date'

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'] as const

type InterviewReminderCardProps = {
  sessions: InterviewSession[]
  selectedDate: string
  onSelectDate: (iso: string) => void
  isLoading?: boolean
}

export function InterviewReminderCard({
  sessions,
  selectedDate,
  onSelectDate,
  isLoading = false,
}: InterviewReminderCardProps) {
  const [monthOpen, setMonthOpen] = useState(false)
  const monthRef = useRef<HTMLDivElement>(null)
  const todayIso = localDateString(new Date())

  useEffect(() => {
    if (!monthOpen) return
    const onDoc = (e: MouseEvent) => {
      if (monthRef.current && !monthRef.current.contains(e.target as Node)) setMonthOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [monthOpen])

  const week = useMemo(() => weekDaysSundayStart(selectedDate), [selectedDate])
  const counts = useMemo(() => countSessionsByLocalDate(sessions), [sessions])
  const selectedCount = counts.get(selectedDate) ?? 0
  const inProgressToday = sessions.filter((s) => {
    if (s.status !== 'in_progress') return false
    if (!s.createdAt) return selectedDate === todayIso
    return localDateString(new Date(s.createdAt)) === selectedDate
  }).length

  const monthLabel = useMemo(() => {
    const [y, m] = selectedDate.split('-').map(Number)
    return new Date(y, (m || 1) - 1, 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    })
  }, [selectedDate])

  const isToday = selectedDate === todayIso
  const callLabel = isLoading
    ? 'Loading your week…'
    : selectedCount === 0
      ? isToday
        ? 'No interviews today — a good day to practice'
        : 'No interviews on this day'
      : isToday
        ? `You have ${selectedCount} interview${selectedCount === 1 ? '' : 's'} today`
        : `${selectedCount} interview${selectedCount === 1 ? '' : 's'} on this day`

  const subLabel =
    !isLoading && inProgressToday > 0
      ? `${inProgressToday} still in progress`
      : null

  return (
    <section className="hq-meet-card" aria-label="Interview reminders">
      <div className="hq-meet-header">
        <h2 className="hq-meet-title">Reminders</h2>
        <div ref={monthRef} className="relative">
          <button
            type="button"
            className="hq-meet-date-selector"
            aria-haspopup="dialog"
            aria-expanded={monthOpen}
            onClick={() => setMonthOpen((o) => !o)}
          >
            <span>{monthLabel}</span>
            <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
          </button>
          {monthOpen ? (
            <div className="hq-meet-month-pop" role="dialog" aria-label="Change month">
              <button
                type="button"
                className="hq-meet-month-nav"
                aria-label="Previous month"
                onClick={() => onSelectDate(shiftMonthAnchor(selectedDate, -1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="hq-meet-month-label">{monthLabel}</span>
              <button
                type="button"
                className="hq-meet-month-nav"
                aria-label="Next month"
                onClick={() => onSelectDate(shiftMonthAnchor(selectedDate, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="hq-meet-calls">
        <span className="hq-meet-calls-icon" aria-hidden>
          <Video className="h-4 w-4" />
        </span>
        <div>
          <span>{callLabel}</span>
          {subLabel ? <span className="hq-meet-calls-sub">{subLabel}</span> : null}
        </div>
      </div>

      <div className="hq-meet-nav-wrap">
        <div className="hq-meet-days" role="listbox" aria-label="Week">
          {week.map((day, i) => {
            const active = day.iso === selectedDate
            return (
              <button
                key={day.iso}
                type="button"
                role="option"
                aria-selected={active}
                className={['hq-meet-day', active ? 'hq-meet-day--active' : ''].join(' ')}
                onClick={() => onSelectDate(day.iso)}
              >
                <span className="hq-meet-day-num">{day.date.getDate()}</span>
                <span className="hq-meet-day-name">{DAY_NAMES[i]}</span>
              </button>
            )
          })}
        </div>
        <div className="hq-meet-dots" aria-hidden>
          <span className="hq-meet-dots-line" />
          {week.map((day) => {
            const has = (counts.get(day.iso) ?? 0) > 0
            const active = day.iso === selectedDate
            return (
              <span
                key={day.iso}
                className={[
                  'hq-meet-dot',
                  active ? 'hq-meet-dot--active' : '',
                  has && !active ? 'hq-meet-dot--busy' : '',
                ].join(' ')}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
