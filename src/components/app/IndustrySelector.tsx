'use client'

import React, { useMemo } from 'react'
import { Search } from 'lucide-react'
import { IconCard, IconGrid } from '@/components/ui/icon-card'
import { SelectionChip } from '@/components/ui/selection-chip'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { getIndustryIcon } from '@/lib/icon-mapping'
import type { DepartmentConfig } from '@/lib/interview-catalog/types'

export function IndustrySelector({
  options,
  selectedKeys,
  onChange,
  selectAll,
  onSelectAllChange,
  isLoading = false,
  search = '',
  onSearchChange,
}: {
  options: DepartmentConfig[]
  selectedKeys: string[]
  onChange: (nextKeys: string[]) => void
  selectAll: boolean
  onSelectAllChange: (next: boolean) => void
  isLoading?: boolean
  search?: string
  onSearchChange?: (next: string) => void
}) {
  const selectedSet = useMemo(() => new Set(selectedKeys), [selectedKeys])
  const totalCount = options.length
  const selectedCount = selectAll ? totalCount : selectedKeys.length

  const selectedChips = useMemo(() => {
    if (selectAll) {
      return options.map((option) => ({ key: option.key, label: option.label }))
    }
    return options
      .filter((option) => selectedSet.has(option.key))
      .map((option) => ({ key: option.key, label: option.label }))
  }, [options, selectAll, selectedSet])

  const toggleKey = (key: string) => {
    if (selectAll) {
      onSelectAllChange(false)
      onChange(options.map((option) => option.key).filter((entry) => entry !== key))
      return
    }
    if (selectedSet.has(key)) {
      onChange(selectedKeys.filter((entry) => entry !== key))
      return
    }
    onChange([...selectedKeys, key])
  }

  const handleSelectAll = () => {
    onSelectAllChange(true)
    onChange(options.map((option) => option.key))
  }

  const handleClearAll = () => {
    onSelectAllChange(false)
    onChange([])
  }

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
          {selectedCount} of {totalCount} department{totalCount === 1 ? '' : 's'} selected
        </span>
        <div className="flex flex-wrap gap-2">
          <ActionButton label="Select all" active={selectAll} onClick={handleSelectAll} />
          <ActionButton label="Clear all" onClick={handleClearAll} />
        </div>
      </div>

      {selectedChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedChips.map((chip) => (
            <SelectionChip
              key={chip.key}
              active
              onClick={() => toggleKey(chip.key)}
              aria-label={`Remove ${chip.label}`}
            >
              {chip.label}
              <span className="text-muted-foreground" aria-hidden>×</span>
            </SelectionChip>
          ))}
        </div>
      ) : null}

      <IconGrid columns={3} gap="md">
        {options.map((department) => {
          const selected = selectAll || selectedSet.has(department.key)
          return (
            <IconCard
              key={department.key}
              icon={getIndustryIcon(department.key)}
              title={department.label}
              subtitle={`${department.specializations?.length ?? 0} specializations`}
              selected={selected}
              onClick={() => toggleKey(department.key)}
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

      {selectedCount === 0 && options.length > 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          Select one or more departments, or use Select all.
        </div>
      ) : null}
    </div>
  )
}

function ActionButton({
  label,
  onClick,
  active = false,
}: {
  label: string
  onClick: () => void
  active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'inline-flex h-8 items-center rounded-xl border px-3 text-xs font-semibold transition-colors',
        active
          ? 'border-primary/50 bg-primary/10 text-foreground'
          : 'border-border bg-input/20 text-muted-foreground hover:bg-input/40 hover:text-foreground',
      ].join(' ')}
    >
      {label}
    </button>
  )
}
