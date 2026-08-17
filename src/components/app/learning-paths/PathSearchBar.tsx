'use client'

import { Search } from 'lucide-react'
import { StyledSelect } from '@/components/ui/styled-select'

const SORT_OPTIONS = [
  { value: 'title', label: 'A–Z' },
  { value: 'new', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'recommended', label: 'Recommended' },
] as const

type PathSearchBarProps = {
  query: string
  sort: string
  onQueryChange: (value: string) => void
  onSortChange: (value: string) => void
}

export function PathSearchBar({
  query,
  sort,
  onQueryChange,
  onSortChange,
}: PathSearchBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search paths, tags, topics…"
          className="h-10 w-full rounded-xl border border-border bg-input/30 pl-9 pr-3 text-sm"
        />
      </label>
      <StyledSelect
        value={sort}
        onChange={onSortChange}
        options={SORT_OPTIONS}
        ariaLabel="Sort learning paths"
        className="h-10 sm:w-44"
      />
    </div>
  )
}
