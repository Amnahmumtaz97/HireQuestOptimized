import { useEffect, useMemo, useState } from 'react'
import type { InterviewSession } from '@/components/app/dashboard/types'
import { filterSessionsByDateRange, sortSessionsNewestFirst } from '@/utils/dashboard/date'
import { buildPageNumbers, clampPage, paginate } from '@/utils/dashboard/pagination'

export type SessionsFetchState = {
  sessions: InterviewSession[]
  isLoading: boolean
}

export function useSessions(): SessionsFetchState {
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    async function load(): Promise<void> {
      try {
        const res = await fetch('/api/interviews')
        if (!res.ok) return
        const data = await res.json()
        if (!isMounted) return
        setSessions((data.sessions ?? []) as InterviewSession[])
      } catch {
        // ignore
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [])

  return { sessions, isLoading }
}

export function useSessionsByStatus(
  sessions: InterviewSession[],
  filter: 'all' | 'created' | 'in_progress' | 'completed',
): InterviewSession[] {
  return useMemo(() => (filter === 'all' ? sessions : sessions.filter((s) => s.status === filter)), [filter, sessions])
}

export function useSessionsSortedNewestFirst(sessions: InterviewSession[]): InterviewSession[] {
  return useMemo(() => sortSessionsNewestFirst(sessions), [sessions])
}

export function useSessionsByDateRange(
  sessions: InterviewSession[],
  startDate: string,
  endDate: string,
): InterviewSession[] {
  return useMemo(() => filterSessionsByDateRange(sessions, startDate, endDate), [endDate, sessions, startDate])
}

export type PaginationState<T> = {
  totalPages: number
  safePage: number
  pageItems: T[]
  pageNumbers: number[]
}

export function usePagination<T>(items: T[], page: number, pageSize: number): PaginationState<T> {
  return useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
    const safePage = clampPage(page, totalPages)
    const pageItems = paginate(items, safePage, pageSize)
    const pageNumbers = buildPageNumbers(safePage, totalPages, 2)
    return { totalPages, safePage, pageItems, pageNumbers }
  }, [items, page, pageSize])
}

