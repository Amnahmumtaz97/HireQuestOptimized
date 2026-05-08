'use client'

import React, { useMemo } from 'react'
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
}) {
  const normalizedSearch = search.trim().toLowerCase()

  const filteredTechnical = useMemo(() => {
    if (!normalizedSearch) {
      return technicalTopics
    }
    return technicalTopics.filter((topic) => topic.toLowerCase().includes(normalizedSearch))
  }, [normalizedSearch, technicalTopics])

  const filteredBehavioral = useMemo(() => {
    if (!normalizedSearch) {
      return behavioralTopics
    }
    return behavioralTopics.filter((topic) => topic.toLowerCase().includes(normalizedSearch))
  }, [normalizedSearch, behavioralTopics])

  const selectedSet = useMemo(() => new Set(selectedTopics), [selectedTopics])

  const toggleTopic = (topic: string) => {
    if (selectedSet.has(topic)) {
      onChange(selectedTopics.filter((entry) => entry !== topic))
      return
    }
    onChange([...selectedTopics, topic])
  }

  const canShowTechnical = allowedKind === 'both' || allowedKind === 'technical'
  const canShowBehavioral = allowedKind === 'both' || allowedKind === 'behavioral'

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        className="h-11 w-full rounded-2xl border border-border bg-surface px-4 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] outline-none transition-all duration-200 ease-out placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-[color-mix(in_oklab,var(--primary)_25%,transparent)] focus:shadow-glow-sm hover:border-primary/30 hover:bg-surface-strong"
        placeholder="Search topics..."
      />

      <div className="flex flex-wrap items-center gap-2">
        {canShowTechnical && canShowBehavioral ? (
          <>
            <ModeChip label="All Topics" active={mode === 'all'} onClick={() => onModeChange('all')} />
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
            {allowedKind === 'technical' ? 'Technical topics' : 'Behavioral topics'}
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {canShowTechnical && (mode === 'all' || mode === 'technical') ? (
          <TopicGroup
            title="Technical"
            topics={filteredTechnical}
            selectedSet={selectedSet}
            onToggle={toggleTopic}
          />
        ) : null}

        {canShowBehavioral && (mode === 'all' || mode === 'behavioral') ? (
          <TopicGroup
            title="Behavioral"
            topics={filteredBehavioral}
            selectedSet={selectedSet}
            onToggle={toggleTopic}
          />
        ) : null}
      </div>

      {selectedTopics.length ? (
        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Selected topics ({selectedTopics.length})
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTopics.slice(0, 10).map((topic) => (
              <SelectionChip
                key={topic}
                onClick={() => toggleTopic(topic)}
                title="Click to remove"
              >
                <span>{topic}</span>
                <span className="text-muted-foreground/70">×</span>
              </SelectionChip>
            ))}
            {selectedTopics.length > 10 ? (
              <span className="rounded-full border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground">
                +{selectedTopics.length - 10} more
              </span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          Select one or more topics to continue.
        </div>
      )}
    </div>
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
  onToggle,
}: {
  title: string
  topics: string[]
  selectedSet: Set<string>
  onToggle: (topic: string) => void
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3 shadow-[0_1px_0_0_rgba(255,255,255,0.03)_inset]">
      <div className="mb-2 text-xs font-semibold text-foreground/90">{title}</div>
      <div className="flex flex-wrap gap-2">
        {topics.slice(0, 24).map((topic) => {
          const selected = selectedSet.has(topic)
          return (
            <SelectionChip
              key={topic}
              onClick={() => onToggle(topic)}
              active={selected}
            >
              {topic}
            </SelectionChip>
          )
        })}
      </div>
    </div>
  )
}

