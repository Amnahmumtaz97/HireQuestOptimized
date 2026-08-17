import type { InterviewSession } from '@/components/app/dashboard/types'

/** Local calendar date `YYYY-MM-DD` (avoids UTC slice drift). */
export function localDateString(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** First day of month through today (local), for default dashboard range. */
export function defaultMonthToDateRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth(), 1)
  return { start: localDateString(start), end: localDateString(end) }
}

export function toMs(dateIso?: string): number {
  if (!dateIso) return 0
  const t = new Date(dateIso).getTime()
  return Number.isFinite(t) ? t : 0
}

export function sortSessionsNewestFirst(items: InterviewSession[]): InterviewSession[] {
  return [...items].sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt))
}

export function buildDateRangeMs(startDate: string, endDate: string): { startMs: number; endMs: number } {
  const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY
  const endMs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY
  return { startMs, endMs }
}

export function filterSessionsByDateRange(
  sessions: InterviewSession[],
  startDate: string,
  endDate: string,
): InterviewSession[] {
  const { startMs, endMs } = buildDateRangeMs(startDate, endDate)
  return sessions.filter((s) => {
    if (!s.createdAt) return true
    const t = toMs(s.createdAt)
    return t >= startMs && t <= endMs
  })
}

export function todayRange(): { start: string; end: string } {
  const now = new Date()
  const iso = localDateString(now)
  return { start: iso, end: iso }
}

export function thisWeekRange(): { start: string; end: string } {
  const now = new Date()
  const day = now.getDay()
  const mondayOffset = (day + 6) % 7
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset)
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6)
  return { start: localDateString(start), end: localDateString(end) }
}

export function thisMonthRange(): { start: string; end: string } {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  return { start: localDateString(start), end: localDateString(now) }
}

export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function sessionLocalDate(session: InterviewSession): string | null {
  if (!session.createdAt) return null
  const t = new Date(session.createdAt)
  if (!Number.isFinite(t.getTime())) return null
  return localDateString(t)
}

/** Sunday–Saturday week that contains `iso` (local). */
export function weekDaysSundayStart(iso: string): Array<{ iso: string; date: Date }> {
  const d = parseLocalDate(iso)
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay())
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { iso: localDateString(day), date: day }
  })
}

/** Jump by `delta` months. Lands on today if that month is the current month, else the 1st. */
export function shiftMonthAnchor(iso: string, delta: number): string {
  const d = parseLocalDate(iso)
  const today = new Date()
  const next = new Date(d.getFullYear(), d.getMonth() + delta, 1)
  if (next.getFullYear() === today.getFullYear() && next.getMonth() === today.getMonth()) {
    return localDateString(today)
  }
  return localDateString(next)
}

export function countSessionsByLocalDate(sessions: InterviewSession[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const s of sessions) {
    const key = sessionLocalDate(s)
    if (!key) continue
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return map
}

