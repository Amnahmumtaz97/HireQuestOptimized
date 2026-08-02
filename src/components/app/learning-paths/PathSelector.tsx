'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PathCard } from '@/components/app/learning-paths/PathCard'
import { PathSearchBar } from '@/components/app/learning-paths/PathSearchBar'
import { PathSections } from '@/components/app/learning-paths/PathSections'
import type { LearningPath, PathCategory, UserPathProgress } from '@/components/app/learning-paths/types'
import { PATH_CATEGORY_LABELS } from '@/lib/learning-paths/constants'
import { ListPagination } from '@/components/ui/list-pagination'

const PAGE_SIZE = 8

const CATEGORY_FILTERS: Array<{ key: 'all' | PathCategory; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'technology', label: PATH_CATEGORY_LABELS.technology },
  { key: 'role', label: PATH_CATEGORY_LABELS.role },
  { key: 'company', label: PATH_CATEGORY_LABELS.company },
  { key: 'skills', label: PATH_CATEGORY_LABELS.skills },
  { key: 'dsa', label: PATH_CATEGORY_LABELS.dsa },
  { key: 'system_design', label: PATH_CATEGORY_LABELS.system_design },
  { key: 'project', label: PATH_CATEGORY_LABELS.project },
  { key: 'resume', label: PATH_CATEGORY_LABELS.resume },
]

type HomePayload = {
  continueLearning: Array<{ path: LearningPath; progress: UserPathProgress | null }>
  completed: Array<{ path: LearningPath; progress: UserPathProgress | null }>
  recommended: Array<{ path: LearningPath; reason: string }>
  popular: LearningPath[]
  new: LearningPath[]
}

export function PathSelector({
  initialSubcategory,
  initialTag,
  initialCategory,
}: {
  initialSubcategory?: string
  initialTag?: string
  initialCategory?: string
} = {}) {
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [home, setHome] = useState<HomePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [homeLoading, setHomeLoading] = useState(true)
  const [error, setError] = useState('')
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]['key']>(
    (initialCategory as (typeof CATEGORY_FILTERS)[number]['key']) || 'all',
  )
  const [query, setQuery] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [sort, setSort] = useState('title')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    setPage(1)
  }, [category, debouncedQ, sort, initialSubcategory, initialTag])

  useEffect(() => {
    let cancelled = false
    async function loadHome() {
      setHomeLoading(true)
      try {
        const res = await fetch('/api/paths/home')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load home')
        if (!cancelled) setHome(data)
      } catch {
        if (!cancelled) setHome(null)
      } finally {
        if (!cancelled) setHomeLoading(false)
      }
    }
    void loadHome()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(page))
        params.set('limit', String(PAGE_SIZE))
        params.set('sort', sort)
        if (category !== 'all') params.set('category', category)
        if (debouncedQ) params.set('q', debouncedQ)
        if (initialSubcategory) params.set('subcategory', initialSubcategory)
        if (initialTag) params.set('tag', initialTag)
        const res = await fetch(`/api/paths?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load paths')
        if (!cancelled) {
          setPaths(data.paths ?? [])
          const pagination = data.pagination as
            | { total?: number; totalPages?: number; page?: number }
            | undefined
          setTotal(pagination?.total ?? data.paths?.length ?? 0)
          const pages = Math.max(1, pagination?.totalPages ?? 1)
          setTotalPages(pages)
          if (page > pages) setPage(pages)
          setError('')
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load paths')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [category, page, sort, debouncedQ, initialSubcategory, initialTag])

  const safePage = Math.min(Math.max(1, page), totalPages)
  const rangeStart = total === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(total, safePage * PAGE_SIZE)
  const showSections =
    !debouncedQ && category === 'all' && !initialSubcategory && !initialTag && sort === 'title'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setCategory(f.key)}
              className={[
                'hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold',
                category === f.key ? 'hq-panel-btn--active' : '',
              ].join(' ')}
            >
              {f.label}
            </button>
          ))}
        </div>
        <Link
          href="/app/learning-paths/categories"
          className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold"
        >
          Browse categories
        </Link>
      </div>

      <PathSearchBar
        query={query}
        sort={sort}
        onQueryChange={setQuery}
        onSortChange={setSort}
      />

      {showSections ? (
        homeLoading ? null : home ? (
          <PathSections
            continueLearning={home.continueLearning}
            recommended={home.recommended}
            popular={home.popular}
            newest={home.new}
            completed={home.completed}
          />
        ) : null
      ) : null}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">
            {showSections ? 'All Paths' : 'Catalog'}
          </h2>
          <span className="text-xs text-muted-foreground">
            Showing{' '}
            <strong className="text-foreground">
              {rangeStart}–{rangeEnd}
            </strong>{' '}
            of <strong className="text-foreground">{total}</strong>
          </span>
        </div>

        {loading ? null : error ? (
          <p className="text-sm text-red-400">{error}</p>
        ) : paths.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-input/5 px-5 py-12 text-center text-sm text-muted-foreground">
            No learning paths match these filters.
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>

            <ListPagination
              page={safePage}
              totalPages={totalPages}
              onPageChange={setPage}
              className="pt-2"
            />
          </>
        )}
      </div>
    </div>
  )
}
