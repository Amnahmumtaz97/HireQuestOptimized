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

