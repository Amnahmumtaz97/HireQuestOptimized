'use client'

import React, { useMemo } from 'react'
import { Search } from 'lucide-react'
import { IconCard, IconGrid } from '@/components/ui/icon-card'
import { SelectionChip } from '@/components/ui/selection-chip'
import { getRoleIcon } from '@/lib/icon-mapping'
import type { ScopedSpecialization } from '@/lib/interview-catalog/resolve'

export function RoleCategorySelector({
  options,
  selectedRefs,
  onChange,
  selectAll,
  onSelectAllChange,
  showDepartmentLabels = false,
  search = '',
  onSearchChange,
}: {
  options: ScopedSpecialization[]
  selectedRefs: string[]
  onChange: (nextRefs: string[]) => void
  selectAll: boolean
  onSelectAllChange: (next: boolean) => void
  showDepartmentLabels?: boolean
  search?: string
  onSearchChange?: (next: string) => void
}) {
  const selectedSet = useMemo(() => new Set(selectedRefs), [selectedRefs])
  const totalCount = options.length
  const selectedCount = selectAll ? totalCount : selectedRefs.length

  const selectedChips = useMemo(() => {
    if (selectAll) {
      return options.map((option) => ({
        ref: option.ref,
        label:
          showDepartmentLabels || options.length > 1
            ? `${option.departmentLabel} / ${option.label}`
            : option.label,
      }))
    }
    return options
      .filter((option) => selectedSet.has(option.ref))
      .map((option) => ({
        ref: option.ref,
        label:
          showDepartmentLabels || options.length > 1
            ? `${option.departmentLabel} / ${option.label}`
            : option.label,
      }))
  }, [options, selectAll, selectedSet, showDepartmentLabels])

  const toggleRef = (ref: string) => {
    if (selectAll) {
      onSelectAllChange(false)
      onChange(options.map((option) => option.ref).filter((entry) => entry !== ref))
      return
    }
    if (selectedSet.has(ref)) {
      onChange(selectedRefs.filter((entry) => entry !== ref))
      return
    }
    onChange([...selectedRefs, ref])
  }

  const handleSelectAll = () => {
    onSelectAllChange(true)
    onChange(options.map((option) => option.ref))
  }

  const handleClearAll = () => {
    onSelectAllChange(false)
    onChange([])
  }

  const groupedOptions = useMemo(() => {
    if (!showDepartmentLabels) return [{ label: null as string | null, options }]
    const groups = new Map<string, ScopedSpecialization[]>()
    for (const option of options) {
      const list = groups.get(option.departmentLabel) ?? []
      list.push(option)
      groups.set(option.departmentLabel, list)
    }
    return [...groups.entries()].map(([label, groupOptions]) => ({ label, options: groupOptions }))
  }, [options, showDepartmentLabels])

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
            placeholder="Search specializations..."
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {selectedCount} of {totalCount} specialization{totalCount === 1 ? '' : 's'} selected
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
              key={chip.ref}
              active
              onClick={() => toggleRef(chip.ref)}
              aria-label={`Remove ${chip.label}`}
            >
              {chip.label}
              <span className="text-muted-foreground" aria-hidden>×</span>
            </SelectionChip>
          ))}
        </div>
      ) : null}

      {groupedOptions.map((group) => (
        <div key={group.label ?? 'all'} className="space-y-3">
          {group.label ? (
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </div>
          ) : null}
          <IconGrid columns={3} gap="md">
            {group.options.map((spec) => {
              const selected = selectAll || selectedSet.has(spec.ref)
              return (
                <IconCard
                  key={spec.ref}
                  icon={getRoleIcon(spec.key)}
                  title={spec.label}
                  subtitle={`${spec.technicalTopics?.length ?? 0} technical · ${spec.behavioralTopics?.length ?? 0} behavioral`}
                  selected={selected}
                  onClick={() => toggleRef(spec.ref)}
                  size="md"
                />
              )
            })}
          </IconGrid>
        </div>
      ))}

      {options.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          No specializations match your search. Select a department first.
        </div>
      ) : null}

      {selectedCount === 0 && options.length > 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          Select one or more specializations, or use Select all.
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
