'use client'

import { useMemo } from 'react'

export function pageWindow(current: number, totalPages: number, radius = 1): number[] {
  const start = Math.max(1, current - radius)
  const end = Math.min(totalPages, current + radius)
  const pages: number[] = []
  for (let p = start; p <= end; p += 1) pages.push(p)
  return pages
}

type ListPaginationProps = {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  /** Show controls even when only one page (default: hide). */
  alwaysShow?: boolean
  /** Compact prev/next only (admin sidebars). */
  compact?: boolean
  className?: string
}

export function ListPagination({
  page,
  totalPages,
  onPageChange,
  alwaysShow = false,
  compact = false,
  className = '',
}: ListPaginationProps) {
  const safeTotal = Math.max(1, totalPages)
  const safePage = Math.min(Math.max(1, page), safeTotal)
  const pageNumbers = useMemo(() => pageWindow(safePage, safeTotal), [safePage, safeTotal])

  if (!alwaysShow && safeTotal <= 1) return null

  if (compact) {
    return (
      <div className={['flex items-center justify-between gap-2', className].filter(Boolean).join(' ')}>
        <button
          type="button"
          disabled={safePage <= 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          className="hq-panel-btn min-h-10 px-3 py-2 text-xs font-semibold disabled:opacity-45"
        >
          Prev
        </button>
        <span className="text-xs text-muted-foreground">
          {safePage}/{safeTotal}
        </span>
        <button
          type="button"
          disabled={safePage >= safeTotal}
          onClick={() => onPageChange(Math.min(safeTotal, safePage + 1))}
          className="hq-panel-btn min-h-10 px-3 py-2 text-xs font-semibold disabled:opacity-45"
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <div
      className={['flex flex-wrap items-center justify-between gap-3', className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="text-xs text-muted-foreground">
        Page <strong className="text-foreground">{safePage}</strong> of{' '}
        <strong className="text-foreground">{safeTotal}</strong>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
          disabled={safePage <= 1}
          className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold disabled:opacity-45"
        >
          Prev
        </button>
        {pageNumbers[0] && pageNumbers[0] > 1 ? (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold"
            >
              1
            </button>
            {pageNumbers[0] > 2 ? (
              <span className="px-1 text-xs text-muted-foreground">…</span>
            ) : null}
          </>
        ) : null}
        {pageNumbers.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={[
              'hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold',
              p === safePage ? 'hq-panel-btn--active' : '',
            ].join(' ')}
          >
            {p}
          </button>
        ))}
        {pageNumbers[pageNumbers.length - 1] &&
        pageNumbers[pageNumbers.length - 1] < safeTotal ? (
          <>
            {pageNumbers[pageNumbers.length - 1] < safeTotal - 1 ? (
              <span className="px-1 text-xs text-muted-foreground">…</span>
            ) : null}
            <button
              type="button"
              onClick={() => onPageChange(safeTotal)}
              className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold"
            >
              {safeTotal}
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(safeTotal, safePage + 1))}
          disabled={safePage >= safeTotal}
          className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold disabled:opacity-45"
        >
          Next
        </button>
      </div>
    </div>
  )
}
