'use client'

import React from 'react'
import { Search } from 'lucide-react'
import { IconCard, IconGrid } from '@/components/ui/icon-card'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { getIndustryIcon } from '@/lib/icon-mapping'
import type { DepartmentConfig } from '@/lib/interview-catalog/types'

export function IndustrySelector({
  options,
  selectedKey,
  onChange,
  isLoading = false,
  search = '',
  onSearchChange,
}: {
  options: DepartmentConfig[]
  selectedKey: string | null
  onChange: (nextKey: string | null) => void
  isLoading?: boolean
  search?: string
  onSearchChange?: (next: string) => void
}) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-input/20 p-8">
        <BounceLoader label="Loading departments" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {onSearchChange ? (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-border bg-input/30 py-2.5 pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Search departments..."
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {selectedKey ? '1 department selected' : 'Select one department'}
        </span>
        {selectedKey ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex h-8 items-center rounded-xl border border-border bg-input/20 px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-input/40 hover:text-foreground"
          >
            Clear
          </button>
        ) : null}
      </div>

      <IconGrid columns={3} gap="md">
        {options.map((department) => {
          const selected = selectedKey === department.key
          return (
            <IconCard
              key={department.key}
              icon={getIndustryIcon(department.key)}
              title={department.label}
              subtitle={`${department.specializations?.length ?? 0} specializations`}
              selected={selected}
              onClick={() => onChange(selected ? null : department.key)}
              size="md"
            />
          )
        })}
      </IconGrid>

      {options.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          No departments match your search.
        </div>
      ) : null}

      {!selectedKey && options.length > 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          Select one department to continue.
        </div>
      ) : null}
    </div>
  )
}
