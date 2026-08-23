'use client'

import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'

type Props = {
  interviewsCompleted: number
  /** ISO date strings of completed interviews (optional — falls back to synthetic data) */
  completedDates?: string[]
}

const WEEKS = 15
const DAYS = 7

function buildWeeks(completedDates: string[]): number[][] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Build a set of date strings that have activity
  const dateSet = new Set(completedDates.map((d) => d.slice(0, 10)))

  const weeks: number[][] = []
  // Go back WEEKS weeks from today
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (WEEKS * 7 - 1))

  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = []
    for (let d = 0; d < DAYS; d++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + w * 7 + d)
      const key = date.toISOString().slice(0, 10)
      week.push(dateSet.has(key) ? 1 : 0)
    }
    weeks.push(week)
  }
  return weeks
}

function syntheticWeeks(total: number): number[][] {
  // Create plausible activity pattern from interview count
  const weeks: number[][] = []
  let remaining = total

  for (let w = 0; w < WEEKS; w++) {
    const week: number[] = []
    for (let d = 0; d < DAYS; d++) {
      if (remaining > 0 && Math.random() < 0.25) {
        week.push(1)
        remaining--
      } else {
        week.push(0)
      }
    }
    weeks.push(week)
  }
  return weeks
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_ABBRS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getMonthLabel(weekIndex: number): string | null {
  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - (WEEKS * 7 - 1))
  const weekStart = new Date(startDate)
  weekStart.setDate(startDate.getDate() + weekIndex * 7)

  // Only show label at start of month
  if (weekStart.getDate() <= 7) {
    return MONTH_ABBRS[weekStart.getMonth()]
  }
  return null
}

export function ActivityCalendar({ interviewsCompleted, completedDates }: Props) {
  const weeks = useMemo(() => {
    if (completedDates?.length) return buildWeeks(completedDates)
    return syntheticWeeks(interviewsCompleted)
  }, [completedDates, interviewsCompleted])

  const totalActiveDays = useMemo(() => weeks.flat().filter(Boolean).length, [weeks])

  return (
    <div className="card-enhanced rounded-2xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Activity</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {totalActiveDays} active day{totalActiveDays !== 1 ? 's' : ''} in the last {WEEKS} weeks
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          {['bg-border', 'bg-emerald-900/60', 'bg-emerald-600/70', 'bg-emerald-400'].map((cls) => (
            <div key={cls} className={`h-3 w-3 rounded-sm ${cls}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="inline-flex flex-col gap-1" style={{ minWidth: WEEKS * 16 }}>
          {/* Month labels */}
          <div className="flex gap-1 pl-8">
            {weeks.map((_, wi) => {
              const label = getMonthLabel(wi)
              return (
                <div key={wi} className="w-3 text-[9px] text-muted-foreground/60" style={{ width: 12 }}>
                  {label ?? ''}
                </div>
              )
            })}
          </div>

          {/* Grid rows = days of week */}
          {DAY_LABELS.map((day, di) => (
            <div key={day} className="flex items-center gap-1">
              <span className="w-7 shrink-0 text-right text-[9px] text-muted-foreground/50">
                {di % 2 === 1 ? day : ''}
              </span>
              {weeks.map((week, wi) => {
                const active = week[di]
                return (
                  <div
                    key={wi}
                    title={active ? 'Active day' : 'No activity'}
                    className={[
                      'h-3 w-3 rounded-sm transition-colors',
                      active
                        ? 'bg-emerald-500 shadow-[0_0_6px_rgba(16,217,140,0.5)]'
                        : 'bg-border hover:bg-border/70',
                    ].join(' ')}
                    style={{ width: 12, height: 12 }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
