'use client'

import React, { useMemo } from 'react'
import { Check } from 'lucide-react'
import { SelectionChip } from '@/components/ui/selection-chip'

export type TopicMode = 'all' | 'technical' | 'behavioral'

export function TopicSelector({
  technicalTopics,
  behavioralTopics,
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
  selectedTopics: string[]
  onChange: (nextTopics: string[]) => void
  search: string
  onSearchChange: (nextSearch: string) => void
  mode: TopicMode
  onModeChange: (nextMode: TopicMode) => void
  allowedKind: 'technical' | 'behavioral' | 'both'
  selectAll: boolean
  onSelectAllChange: (next: boolean) => void
}) {
  const normalizedSearch = search.trim().toLowerCase()

  const filteredTechnical = useMemo(() => {
    if (!normalizedSearch) return technicalTopics
    return technicalTopics.filter((topic) => topic.toLowerCase().includes(normalizedSearch))
  }, [normalizedSearch, technicalTopics])

  const filteredBehavioral = useMemo(() => {
    if (!normalizedSearch) return behavioralTopics
    return behavioralTopics.filter((topic) => topic.toLowerCase().includes(normalizedSearch))
  }, [normalizedSearch, behavioralTopics])

  const availableTopics = useMemo(() => {
    const list: string[] = []
    if (allowedKind === 'both' || allowedKind === 'technical') list.push(...technicalTopics)
    if (allowedKind === 'both' || allowedKind === 'behavioral') list.push(...behavioralTopics)
    return [...new Set(list)]
  }, [allowedKind, behavioralTopics, technicalTopics])

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

  const canShowTechnical = allowedKind === 'both' || allowedKind === 'technical'
  const canShowBehavioral = allowedKind === 'both' || allowedKind === 'behavioral'

  const displaySelected = selectAll ? availableTopics : selectedTopics

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-all duration-200 ease-out placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-[color-mix(in_oklab,var(--primary)_25%,transparent)] focus:shadow-glow-sm hover:border-primary/30 hover:bg-surface-strong"
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
        {canShowTechnical && canShowBehavioral ? (
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
          <span className="text-xs text-muted-foreground">
            {allowedKind === 'technical' ? 'Recommended technical topics' : 'Recommended behavioral topics'}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {canShowTechnical && (mode === 'all' || mode === 'technical') ? (
          <TopicGroup
            title="Technical"
            topics={filteredTechnical}
            selectedSet={selectedSet}
            selectAll={selectAll}
            onToggle={toggleTopic}
          />
        ) : null}

        {canShowBehavioral && (mode === 'all' || mode === 'behavioral') ? (
          <TopicGroup
            title="Behavioral"
            topics={filteredBehavioral}
            selectedSet={selectedSet}
            selectAll={selectAll}
            onToggle={toggleTopic}
          />
        ) : null}
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

function TopicGroup({
  title,
  topics,
  selectedSet,
  selectAll,
  onToggle,
}: {
  title: string
  topics: string[]
  selectedSet: Set<string>
  selectAll: boolean
  onToggle: (topic: string) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <div className="mb-2 text-xs font-semibold text-foreground/90">{title}</div>
      <div className="flex flex-col gap-1.5">
        {topics.length === 0 ? (
          <p className="text-xs text-muted-foreground">No topics in this category.</p>
        ) : (
          topics.map((topic) => {
            const selected = selectAll || selectedSet.has(topic)
            return (
              <button
                key={topic}
                type="button"
                onClick={() => onToggle(topic)}
                className={[
                  'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2 text-left text-xs transition-colors',
                  selected
                    ? 'border-primary/50 bg-primary/10 text-foreground'
                    : 'border-border bg-input/10 text-muted-foreground hover:border-primary/30 hover:bg-input/20 hover:text-foreground',
                ].join(' ')}
              >
                <span
                  className={[
                    'grid h-4 w-4 shrink-0 place-items-center rounded border',
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-surface',
                  ].join(' ')}
                  aria-hidden
                >
                  {selected ? <Check className="h-2.5 w-2.5" /> : null}
                </span>
                <span className="min-w-0 flex-1">{topic}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
