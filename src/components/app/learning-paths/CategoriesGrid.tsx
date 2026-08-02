'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Library, Search } from 'lucide-react'
import { ListPagination } from '@/components/ui/list-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import { PATH_CATEGORY_LABELS, type PathCategory } from '@/lib/learning-paths/constants'
import { PATH_SUBCATEGORY_DESCRIPTIONS } from '@/lib/learning-paths/path-category-meta'
import { pathSubcategoryIcon } from '@/lib/learning-paths/path-category-icons'

const PAGE_SIZE = 12

type CategoryGroup = {
  key: string
  label: string
  category: string
  tag: string | null
  count: number
}

function categoryHref(g: CategoryGroup) {
  return g.tag
    ? `/app/learning-paths/categories/${encodeURIComponent(g.key)}?tag=${encodeURIComponent(g.tag)}&category=${encodeURIComponent(g.category)}`
    : `/app/learning-paths/categories/${encodeURIComponent(g.key)}?category=${encodeURIComponent(g.category)}`
}

export function CategoriesGrid({
  featuredFirst = true,
  showCatalogLink = true,
}: {
  featuredFirst?: boolean
  showCatalogLink?: boolean
} = {}) {
  const [groups, setGroups] = useState<CategoryGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

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

  const ordered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = groups.filter((g) => g.count > 0 || g.key === 'pakistan')
    if (q) {
      list = list.filter(
        (g) =>
          g.label.toLowerCase().includes(q) ||
          g.key.includes(q) ||
          (PATH_SUBCATEGORY_DESCRIPTIONS[g.key as keyof typeof PATH_SUBCATEGORY_DESCRIPTIONS] || '')
            .toLowerCase()
            .includes(q),
      )
    }
    if (featuredFirst) {
      list = [...list].sort((a, b) => {
        if (a.key === 'pakistan') return -1
        if (b.key === 'pakistan') return 1
        return a.label.localeCompare(b.label)
      })
    }
    return list
  }, [featuredFirst, groups, query])

  const featured = featuredFirst ? ordered.find((g) => g.key === 'pakistan') : undefined
  const rest = featured ? ordered.filter((g) => g.key !== 'pakistan') : ordered
  const { page, setPage, pageItems, totalPages } = useClientPagination(rest, PAGE_SIZE)

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-2xl border border-border bg-input/30" />
        ))}
      </div>
    )
  }

  if (error) return <p className="text-sm text-destructive">{error}</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <label className="relative w-full min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
            placeholder="Search categories…"
            className="h-11 w-full rounded-xl border border-border bg-card pl-10 pr-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
          />
        </label>
        {showCatalogLink ? (
          <Link
            href="/app/learning-paths/catalog"
            className="hq-btn-outline inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm sm:w-auto"
          >
            <Library className="h-4 w-4" />
            All paths catalog
          </Link>
        ) : null}
      </div>

      {featured ? (
        <Link
          href={categoryHref(featured)}
          className="group relative block overflow-hidden rounded-2xl border border-primary/35 bg-gradient-to-br from-primary/15 via-card to-card p-6 transition hover:border-primary/55"
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/15 blur-2xl"
            aria-hidden
          />
          <div className="relative flex flex-wrap items-start gap-4">
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              {(() => {
                const Icon = pathSubcategoryIcon(featured.key)
                return <Icon className="h-7 w-7" />
              })()}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground sm:text-xl">
                  {featured.label}
                </h2>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                  Featured
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {PATH_SUBCATEGORY_DESCRIPTIONS.pakistan}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full border border-border bg-background/70 px-2.5 py-1">
                  {featured.count} path{featured.count === 1 ? '' : 's'}
                </span>
                <span className="rounded-full border border-border bg-background/70 px-2.5 py-1 capitalize">
                  {PATH_CATEGORY_LABELS[featured.category as PathCategory] || featured.category}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:underline">
                  Open hub
                  <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      ) : null}

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Browse by topic</h2>
          <span className="text-xs text-muted-foreground">
            {rest.length} categor{rest.length === 1 ? 'y' : 'ies'}
          </span>
        </div>
        {pageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border px-5 py-12 text-center text-sm text-muted-foreground">
            No categories match your search.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((g) => {
              const Icon = pathSubcategoryIcon(g.key)
              const description =
                PATH_SUBCATEGORY_DESCRIPTIONS[
                  g.key as keyof typeof PATH_SUBCATEGORY_DESCRIPTIONS
                ] || 'Interview-driven learning path collection.'
              return (
                <Link
                  key={g.key}
                  href={categoryHref(g)}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/45 hover:shadow-[var(--shadow-card)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/15">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-foreground">{g.label}</div>
                      <div className="mt-1 text-[11px] capitalize text-muted-foreground">
                        {PATH_CATEGORY_LABELS[g.category as PathCategory] || g.category}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {description}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
                    <span>
                      {g.count} path{g.count === 1 ? '' : 's'}
                    </span>
                    <span className="inline-flex items-center gap-1 font-medium text-primary opacity-80 transition group-hover:opacity-100">
                      Explore
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        <ListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          className="pt-4"
        />
      </div>
    </div>
  )
}
