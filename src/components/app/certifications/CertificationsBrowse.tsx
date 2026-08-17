'use client'

import { useEffect, useState, useCallback } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Search,
  X,
  ChevronDown,
  DollarSign,
  BarChart2,
  Layers,
  Building2,
  MoreHorizontal,
} from 'lucide-react'
import {
  CERT_CATEGORIES,
  CERT_COST_LABELS,
  CERT_COST_TYPES,
  CERT_LEVEL_LABELS,
  CERT_LEVELS,
  CERT_CATEGORY_LABELS,
} from '@/lib/certifications/constants'
import { AlertBanner } from '@/components/ui/alert-banner'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CertificationCard } from './CertificationCard'
import { useCertBookmarks } from './useCertBookmarks'
import type { Certification, CertFilterState } from './types'
import { DEFAULT_CERT_FILTERS } from './types'
import type { CertCategory } from '@/lib/certifications/constants'

const PAGE_SIZE = 8

function activeFilterCount(f: CertFilterState): number {
  return [f.category, f.cost, f.level, f.provider, f.exam].filter(Boolean).length + (f.linkedin ? 1 : 0)
}

function CertCardSkeleton() {
  return (
    <div className="hq-cert-card pointer-events-none">
      <div className="hq-cert-hero">
        <div className="hq-cert-top">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 animate-pulse rounded-xl bg-black/10" />
            <div className="h-3 w-24 animate-pulse rounded-full bg-black/10" />
          </div>
          <div className="h-5 w-12 animate-pulse rounded-full bg-black/10" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-5 w-4/5 animate-pulse rounded-lg bg-black/10" />
          <div className="h-5 w-2/5 animate-pulse rounded-lg bg-black/10" />
        </div>
        <div className="mt-4 flex gap-2">
          <div className="h-5 w-20 animate-pulse rounded-full bg-black/10" />
          <div className="h-5 w-28 animate-pulse rounded-full bg-black/10" />
        </div>
      </div>
      <div className="hq-cert-foot">
        <div className="h-3 w-28 animate-pulse rounded-full bg-input/30" />
        <div className="h-8 w-8 animate-pulse rounded-lg bg-input/30" />
      </div>
    </div>
  )
}

function FilterMenu({
  label,
  icon: Icon,
  active,
  contentClassName,
  children,
}: {
  label: string
  icon: LucideIcon
  active?: boolean
  contentClassName?: string
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className={['hq-cert-dd', active ? 'is-active' : ''].join(' ')}>
          <Icon className="h-3.5 w-3.5" aria-hidden />
          <span>{label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className={['min-w-[11.5rem]', contentClassName].filter(Boolean).join(' ')}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function CertificationsBrowse() {
  const [filters, setFilters] = useState<CertFilterState>(DEFAULT_CERT_FILTERS)
  const [debouncedQ, setDebouncedQ] = useState('')
  const [certs, setCerts] = useState<Certification[]>([])
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [providers, setProviders] = useState<Array<{ slug: string; name: string; count: number }>>([])
  const [topics, setTopics] = useState<Array<{ key: CertCategory; count: number }>>([])
  const { isSaved, toggle } = useCertBookmarks()

  useEffect(() => {
    fetch('/api/certifications/meta/categories')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.providers)) setProviders(d.providers)
        if (Array.isArray(d.categories)) setTopics(d.categories)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q.trim()), 300)
    return () => clearTimeout(t)
  }, [filters.q])

  const set = useCallback(<K extends keyof CertFilterState>(key: K, value: CertFilterState[K]) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === 'page' || key === 'q' ? {} : { page: 1 }),
    }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_CERT_FILTERS)
    setDebouncedQ('')
  }, [])

  useEffect(() => {
    setFilters((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }))
  }, [debouncedQ])

  useEffect(() => {
    let cancelled = false
    async function load() {
      const appending = filters.page > 1
      if (appending) setLoadingMore(true)
      else setLoading(true)
      try {
        const params = new URLSearchParams()
        params.set('page', String(filters.page))
        params.set('limit', String(PAGE_SIZE))
        params.set('sort', filters.sort)
        if (debouncedQ) params.set('q', debouncedQ)
        if (filters.category) params.set('category', filters.category)
        if (filters.cost) params.set('cost', filters.cost)
        if (filters.level) params.set('level', filters.level)
        if (filters.provider) params.set('provider', filters.provider)
        if (filters.linkedin) params.set('linkedin', 'true')
        if (filters.exam) params.set('exam', filters.exam)

        const res = await fetch(`/api/certifications?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load')
        if (!cancelled) {
          const next = (data.certifications ?? []) as Certification[]
          setCerts((prev) => (appending ? [...prev, ...next] : next))
          const pagination = data.pagination as { total?: number; totalPages?: number } | undefined
          setTotal(pagination?.total ?? 0)
          setTotalPages(Math.max(1, pagination?.totalPages ?? 1))
          setError('')
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load certifications')
      } finally {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [filters.page, filters.sort, filters.category, filters.cost, filters.level, filters.provider, filters.linkedin, filters.exam, debouncedQ])

  const numActive = activeFilterCount(filters)
  const hasActiveChips = numActive > 0
  const canLoadMore = !loading && !loadingMore && filters.page < totalPages
  const sortLabel =
    filters.sort === 'newest' ? 'Newest' : filters.sort === 'shortest' ? 'Shortest' : 'Featured'
  const costMenuLabel = filters.cost
    ? (CERT_COST_LABELS[filters.cost as keyof typeof CERT_COST_LABELS] ?? 'Cost')
    : 'Cost'
  const levelMenuLabel = filters.level
    ? (CERT_LEVEL_LABELS[filters.level as keyof typeof CERT_LEVEL_LABELS] ?? 'Level')
    : 'Level'
  const topicMenuLabel = filters.category
    ? (CERT_CATEGORY_LABELS[filters.category as CertCategory] ?? 'Topic')
    : 'Topic'
  const orgMenuLabel = filters.provider
    ? (providers.find((p) => p.slug === filters.provider)?.name ?? filters.provider)
    : 'Organization'
  const topicOptions = topics.length > 0
    ? topics
    : CERT_CATEGORIES.map((key) => ({ key, count: 0 }))

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={filters.q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Search certifications, providers, skills or keywords…"
            className="hq-cert-search"
            aria-label="Search certifications"
          />
        </label>

        <div className="flex shrink-0 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="hq-cert-dd" aria-label="Sort certifications">
                <span>{sortLabel}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => set('sort', 'featured')}>Featured</DropdownMenuItem>
              <DropdownMenuItem onClick={() => set('sort', 'newest')}>Newest</DropdownMenuItem>
              <DropdownMenuItem onClick={() => set('sort', 'shortest')}>Shortest</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterMenu label={costMenuLabel} icon={DollarSign} active={Boolean(filters.cost)}>
          <DropdownMenuItem onClick={() => set('cost', '')}>All</DropdownMenuItem>
          {CERT_COST_TYPES.map((key) => (
            <DropdownMenuItem key={key} onClick={() => set('cost', filters.cost === key ? '' : key)}>
              {CERT_COST_LABELS[key]}
            </DropdownMenuItem>
          ))}
        </FilterMenu>
        <FilterMenu label={levelMenuLabel} icon={BarChart2} active={Boolean(filters.level)}>
          <DropdownMenuItem onClick={() => set('level', '')}>All</DropdownMenuItem>
          {CERT_LEVELS.map((key) => (
            <DropdownMenuItem key={key} onClick={() => set('level', filters.level === key ? '' : key)}>
              {CERT_LEVEL_LABELS[key]}
            </DropdownMenuItem>
          ))}
        </FilterMenu>
        <FilterMenu
          label={topicMenuLabel}
          icon={Layers}
          active={Boolean(filters.category)}
          contentClassName="max-h-72 overflow-y-auto"
        >
          <DropdownMenuItem onClick={() => set('category', '')}>All topics</DropdownMenuItem>
          {topicOptions.map((item) => (
            <DropdownMenuItem
              key={item.key}
              onClick={() => set('category', filters.category === item.key ? '' : item.key)}
            >
              {CERT_CATEGORY_LABELS[item.key]}
              {item.count > 0 ? (
                <span className="ml-auto pl-3 text-[10px] text-muted-foreground">{item.count}</span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </FilterMenu>
        <FilterMenu
          label={orgMenuLabel}
          icon={Building2}
          active={Boolean(filters.provider)}
          contentClassName="max-h-72 overflow-y-auto min-w-[14rem]"
        >
          <DropdownMenuItem onClick={() => set('provider', '')}>All organizations</DropdownMenuItem>
          {providers.map((item) => (
            <DropdownMenuItem
              key={item.slug}
              onClick={() => set('provider', filters.provider === item.slug ? '' : item.slug)}
            >
              {item.name}
              {item.count > 0 ? (
                <span className="ml-auto pl-3 text-[10px] text-muted-foreground">{item.count}</span>
              ) : null}
            </DropdownMenuItem>
          ))}
        </FilterMenu>
        <FilterMenu
          label="More"
          icon={MoreHorizontal}
          active={Boolean(filters.exam) || filters.linkedin}
        >
          <DropdownMenuLabel>Exam</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => set('exam', '')}>
            {!filters.exam ? '✓ ' : ''}Any
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => set('exam', filters.exam === 'true' ? '' : 'true')}>
            {filters.exam === 'true' ? '✓ ' : ''}Required
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => set('exam', filters.exam === 'false' ? '' : 'false')}>
            {filters.exam === 'false' ? '✓ ' : ''}No exam
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.linkedin}
            onCheckedChange={(checked) => set('linkedin', Boolean(checked))}
          >
            LinkedIn-friendly
          </DropdownMenuCheckboxItem>
        </FilterMenu>
      </div>

      {hasActiveChips ? (
        <div className="flex flex-wrap items-center gap-2">
          {filters.cost ? (
            <button type="button" onClick={() => set('cost', '')} className="hq-cert-chip">
              {CERT_COST_LABELS[filters.cost as keyof typeof CERT_COST_LABELS] ?? filters.cost}
              <X className="h-3 w-3" />
            </button>
          ) : null}
          {filters.level ? (
            <button type="button" onClick={() => set('level', '')} className="hq-cert-chip">
              {CERT_LEVEL_LABELS[filters.level as keyof typeof CERT_LEVEL_LABELS] ?? filters.level}
              <X className="h-3 w-3" />
            </button>
          ) : null}
          {filters.category ? (
            <button type="button" onClick={() => set('category', '')} className="hq-cert-chip">
              {CERT_CATEGORY_LABELS[filters.category as CertCategory] ?? filters.category}
              <X className="h-3 w-3" />
            </button>
          ) : null}
          {filters.provider ? (
            <button type="button" onClick={() => set('provider', '')} className="hq-cert-chip">
              {providers.find((p) => p.slug === filters.provider)?.name ?? filters.provider}
              <X className="h-3 w-3" />
            </button>
          ) : null}
          {filters.exam ? (
            <button type="button" onClick={() => set('exam', '')} className="hq-cert-chip">
              {filters.exam === 'true' ? 'Exam required' : 'No exam'}
              <X className="h-3 w-3" />
            </button>
          ) : null}
          {filters.linkedin ? (
            <button type="button" onClick={() => set('linkedin', false)} className="hq-cert-chip">
              LinkedIn
              <X className="h-3 w-3" />
            </button>
          ) : null}
          <button type="button" onClick={clearFilters} className="text-xs font-semibold text-primary hover:underline">
            Clear all
          </button>
        </div>
      ) : null}

      <p className="text-sm text-muted-foreground">
        {loading ? 'Loading credentials…' : (
          <>
            <span className="font-semibold text-foreground">{total}</span>
            {' '}certification{total === 1 ? '' : 's'} found
          </>
        )}
      </p>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <CertCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <AlertBanner variant="error">{error}</AlertBanner>
      ) : certs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-input/5 px-5 py-14 text-center">
          <p className="text-sm text-muted-foreground">No credentials match these filters.</p>
          <button type="button" onClick={clearFilters} className="mt-3 text-xs font-semibold text-primary hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {certs.map((cert) => (
              <CertificationCard
                key={cert.id}
                cert={cert}
                saved={isSaved(cert.id)}
                onToggleSave={toggle}
              />
            ))}
            {loadingMore
              ? Array.from({ length: 4 }).map((_, i) => (
                  <CertCardSkeleton key={`more-${i}`} />
                ))
              : null}
          </div>
          {canLoadMore ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => set('page', filters.page + 1)}
                className="hq-cert-more"
              >
                View more certifications
                <ChevronDown className="h-4 w-4" aria-hidden />
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
