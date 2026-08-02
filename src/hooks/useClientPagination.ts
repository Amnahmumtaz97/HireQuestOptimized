'use client'

import { useEffect, useMemo, useState } from 'react'

export function useClientPagination<T>(
  items: T[],
  pageSize: number,
  /** Change this when filters/sort change so page resets even if length is unchanged. */
  resetKey?: string | number,
) {
  const [page, setPage] = useState(1)
  const size = Math.max(1, pageSize)
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const safePage = Math.min(Math.max(1, page), totalPages)

  useEffect(() => {
    setPage(1)
  }, [items.length, size, resetKey])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * size
    return items.slice(start, start + size)
  }, [items, size, safePage])

  return {
    page: safePage,
    setPage,
    pageItems,
    totalPages,
    total: items.length,
  }
}
