'use client'

import React, { useMemo } from 'react'
import { SelectionChip } from '@/components/ui/selection-chip'

export type TopicMode = 'all' | 'technical' | 'behavioral' | 'hr'

export function TopicSelector({
  technicalTopics,
  behavioralTopics,
  hrTopics,
  selectedTopics,
  onChange,
  search,
  onSearchChange,
  mode,
  onModeChange,
  allowedKind,
  selectAll,
  onSelectAllChange,
}: {
  technicalTopics: string[]
  behavioralTopics: string[]
  hrTopics: string[]
  selectedTopics: string[]
  onChange: (nextTopics: string[]) => void
  search: string
  onSearchChange: (nextSearch: string) => void
  mode: TopicMode
  onModeChange: (nextMode: TopicMode) => void
  allowedKind: 'technical' | 'behavioral' | 'both' | 'hr'
  selectAll: boolean
  onSelectAllChange: (next: boolean) => void
}) {
  const normalizedSearch = search.trim().toLowerCase()

  const availableTopics = useMemo(() => {
    const list: string[] = []
    if (allowedKind === 'both' || allowedKind === 'technical') list.push(...technicalTopics)
    if (allowedKind === 'both' || allowedKind === 'behavioral') list.push(...behavioralTopics)
    if (allowedKind === 'hr') list.push(...hrTopics)
    return [...new Set(list)]
  }, [allowedKind, behavioralTopics, hrTopics, technicalTopics])

  const topicKind = useMemo(() => {
    const map = new Map<string, 'technical' | 'behavioral' | 'hr'>()
    for (const t of technicalTopics) map.set(t, 'technical')
    for (const t of behavioralTopics) {
      if (!map.has(t)) map.set(t, 'behavioral')
    }
    for (const t of hrTopics) {
      if (!map.has(t)) map.set(t, 'hr')
    }
    return map
  }, [behavioralTopics, hrTopics, technicalTopics])

  const visibleTopics = useMemo(() => {
    let pool = availableTopics
    if (allowedKind === 'both') {
      if (mode === 'technical') pool = technicalTopics
      else if (mode === 'behavioral') pool = behavioralTopics
    }
    if (!normalizedSearch) return pool
    return pool.filter((topic) => topic.toLowerCase().includes(normalizedSearch))
  }, [
    allowedKind,
    availableTopics,
    behavioralTopics,
    mode,
    normalizedSearch,
    technicalTopics,
  ])

  const selectedSet = useMemo(() => new Set(selectedTopics), [selectedTopics])
  const totalCount = availableTopics.length
  const selectedCount = selectAll ? totalCount : selectedTopics.length

  const toggleTopic = (topic: string) => {
    if (selectAll) {
      onSelectAllChange(false)
      onChange(availableTopics.filter((entry) => entry !== topic))
      return
    }
    if (selectedSet.has(topic)) {
      onChange(selectedTopics.filter((entry) => entry !== topic))
      return
    }
    onChange([...selectedTopics, topic])
  }

  const handleSelectAll = () => {
    onSelectAllChange(true)
    onChange(availableTopics)
  }

  const handleClearAll = () => {
    onSelectAllChange(false)
    onChange([])
  }

  const canShowModeFilters = allowedKind === 'both'
  const displaySelected = selectAll ? availableTopics : selectedTopics

  const modeLabel =
    allowedKind === 'technical'
      ? 'Recommended technical topics'
      : allowedKind === 'behavioral'
        ? 'Recommended behavioral topics'
        : allowedKind === 'hr'
          ? 'Recommended screening HR topics'
          : 'Recommended topics'

  const tintClass = (kind: 'technical' | 'behavioral' | 'hr' | undefined) => {
    if (kind === 'behavioral') return 'border-sky-500/35 data-[active=true]:bg-sky-500/10'
    if (kind === 'hr') return 'border-amber-500/35 data-[active=true]:bg-amber-500/10'
    return 'border-cyan-500/35 data-[active=true]:bg-cyan-500/10'
  }

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground shadow-inset-highlight outline-none transition-all duration-200 ease-out placeholder:text-muted-foreground focus:border-primary focus:shadow-card focus:ring-2 focus:ring-ring/30 hover:border-primary/30 hover:bg-surface-strong"
        placeholder="Search topics..."
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {selectedCount} of {totalCount} topic{totalCount === 1 ? '' : 's'} selected
        </span>
        <div className="flex flex-wrap gap-2">
          <ActionButton label="Select all topics" active={selectAll} onClick={handleSelectAll} />
          <ActionButton label="Clear all" onClick={handleClearAll} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {canShowModeFilters ? (
          <>
            <ModeChip label="All topics" active={mode === 'all'} onClick={() => onModeChange('all')} />
            <ModeChip
              label="Technical"
              active={mode === 'technical'}
              onClick={() => onModeChange('technical')}
            />
            <ModeChip
              label="Behavioral"
              active={mode === 'behavioral'}
              onClick={() => onModeChange('behavioral')}
            />
          </>
        ) : (
          <span className="text-xs text-muted-foreground">{modeLabel}</span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-3 min-h-[7rem]">
        {visibleTopics.length === 0 ? (
          <p className="text-xs text-muted-foreground">No topics match your search.</p>
        ) : (
          visibleTopics.map((topic) => {
            const selected = selectAll || selectedSet.has(topic)
            const kind = topicKind.get(topic)
            return (
              <button
                key={topic}
                type="button"
                data-active={selected}
                onClick={() => toggleTopic(topic)}
                className={[
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                  selected
                    ? `text-foreground ${tintClass(kind)} bg-primary/10 border-primary/45`
                    : 'border-border bg-input/15 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                ].join(' ')}
              >
                {topic}
              </button>
            )
          })
        )}
      </div>

      {displaySelected.length ? (
        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Selected topics ({displaySelected.length})
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {displaySelected.slice(0, 12).map((topic) => (
              <SelectionChip
                key={topic}
                onClick={() => toggleTopic(topic)}
                active
                title="Click to remove"
              >
                <span>{topic}</span>
                <span className="text-muted-foreground/70">×</span>
              </SelectionChip>
            ))}
            {displaySelected.length > 12 ? (
              <span className="rounded-full border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground">
                +{displaySelected.length - 12} more
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          Select one or more topics, or use Select all topics.
        </div>
      )}
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

function ModeChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <SelectionChip active={active} onClick={onClick}>
      {label}
    </SelectionChip>
  )
}
