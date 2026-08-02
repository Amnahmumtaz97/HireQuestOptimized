'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ListPagination } from '@/components/ui/list-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'

const PAGE_SIZE = 9

type CategoryGroup = {
  key: string
  label: string
  category: string
  tag: string | null
  count: number
}

export function CategoriesGrid() {
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { page, setPage, pageItems, totalPages } = useClientPagination(groups, PAGE_SIZE)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/paths/meta/categories')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load')
        if (!cancelled) setGroups(data.categories ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return null
  }

  if (error) return <p className="text-sm text-red-400">{error}</p>

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pageItems.map((g) => {
          const href = g.tag
            ? `/app/learning-paths/categories/${encodeURIComponent(g.key)}?tag=${encodeURIComponent(g.tag)}&category=${encodeURIComponent(g.category)}`
            : `/app/learning-paths/categories/${encodeURIComponent(g.key)}?category=${encodeURIComponent(g.category)}`
          return (
            <Link
              key={g.key}
              href={href}
              className="dashboard-card block p-5 transition hover:border-primary/40"
            >
              <div className="text-sm font-semibold text-foreground">{g.label}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {g.count} path{g.count === 1 ? '' : 's'}
              </div>
            </Link>
          )
        })}
      </div>
      <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
