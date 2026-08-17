'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Check, X, Tag,
  // Coding
  Boxes, AlignJustify, GitMerge, ArrowUpDown, BrainCircuit, ScanLine,
  // Behavioral
  MessageCircle, Crown, Target, Sprout,
  // System Design
  Server, HardDrive, LayoutGrid, Gauge,
  // HR
  Contact, Handshake, CalendarCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type TopicBundleSelectorType = 'coding' | 'behavioral' | 'system_design' | 'hr'

type Bundle = {
  id: string
  label: string
  description: string
  icon: LucideIcon
  accent: keyof typeof ACCENT
  topics: readonly string[]
}

// ── Accent palette ────────────────────────────────────────────────────────────
const ACCENT = {
  blue: {
    card: 'border-blue-500/50 ring-2 ring-inset ring-blue-500/15',
    partial: 'border-blue-500/25 ring-1 ring-inset ring-blue-500/8',
    icon: 'bg-blue-500/12 border-blue-500/30 text-blue-400',
    blob: 'bg-blue-500',
  },
  green: {
    card: 'border-emerald-500/50 ring-2 ring-inset ring-emerald-500/15',
    partial: 'border-emerald-500/25 ring-1 ring-inset ring-emerald-500/8',
    icon: 'bg-emerald-500/12 border-emerald-500/30 text-emerald-400',
    blob: 'bg-emerald-500',
  },
  amber: {
    card: 'border-amber-500/50 ring-2 ring-inset ring-amber-500/15',
    partial: 'border-amber-500/25 ring-1 ring-inset ring-amber-500/8',
    icon: 'bg-amber-500/12 border-amber-500/30 text-amber-400',
    blob: 'bg-amber-500',
  },
  purple: {
    card: 'border-violet-500/50 ring-2 ring-inset ring-violet-500/15',
    partial: 'border-violet-500/25 ring-1 ring-inset ring-violet-500/8',
    icon: 'bg-violet-500/12 border-violet-500/30 text-violet-400',
    blob: 'bg-violet-500',
  },
  sky: {
    card: 'border-sky-500/50 ring-2 ring-inset ring-sky-500/15',
    partial: 'border-sky-500/25 ring-1 ring-inset ring-sky-500/8',
    icon: 'bg-sky-500/12 border-sky-500/30 text-sky-400',
    blob: 'bg-sky-500',
  },
  rose: {
    card: 'border-rose-500/50 ring-2 ring-inset ring-rose-500/15',
    partial: 'border-rose-500/25 ring-1 ring-inset ring-rose-500/8',
    icon: 'bg-rose-500/12 border-rose-500/30 text-rose-400',
    blob: 'bg-rose-500',
  },
} as const

// ── Bundle definitions per interview type ─────────────────────────────────────
const CODING_BUNDLES: Bundle[] = [
  {
    id: 'foundation',
    label: 'Foundation',
    description: 'Arrays · Strings · Hashing',
    icon: Boxes,          // stacked data containers
    accent: 'blue',
    topics: ['Arrays', 'Strings', 'Hashing'],
  },
  {
    id: 'linear',
    label: 'Linear',
    description: 'Lists · Stacks · Queues',
    icon: AlignJustify,   // sequential lines = linear data structures
    accent: 'sky',
    topics: ['Linked Lists', 'Stacks', 'Queues'],
  },
  {
    id: 'trees',
    label: 'Trees & Graphs',
    description: 'Hierarchical structures',
    icon: GitMerge,       // branching / merging = trees & graphs
    accent: 'green',
    topics: ['Trees', 'Graphs'],
  },
  {
    id: 'search',
    label: 'Search & Sort',
    description: 'Lookup & ordering',
    icon: ArrowUpDown,    // up/down arrows = sort order
    accent: 'amber',
    topics: ['Binary Search', 'Sorting', 'Searching'],
  },
  {
    id: 'algorithms',
    label: 'Algorithms',
    description: 'DP · Greedy · Recursion',
    icon: BrainCircuit,   // logic & algorithmic thinking
    accent: 'purple',
    topics: ['Dynamic Programming', 'Greedy', 'Recursion', 'Backtracking'],
  },
  {
    id: 'techniques',
    label: 'Techniques',
    description: 'Window · Pointers · Bits',
    icon: ScanLine,       // scan line = sliding window / pointer sweep
    accent: 'rose',
    topics: ['Sliding Window', 'Two Pointers', 'Bit Manipulation', 'Heap / Priority Queue'],
  },
]

const BEHAVIORAL_BUNDLES: Bundle[] = [
  {
    id: 'interpersonal',
    label: 'Interpersonal',
    description: 'Teamwork & communication',
    icon: MessageCircle,  // direct conversation icon
    accent: 'sky',
    topics: ['Teamwork', 'Communication', 'Conflict Resolution', 'Collaboration'],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Direction & ownership',
    icon: Crown,          // leadership / authority
    accent: 'amber',
    topics: ['Leadership', 'Decision Making', 'Ownership', 'Initiative'],
  },
  {
    id: 'professional',
    label: 'Professional',
    description: 'Problem solving & agility',
    icon: Target,         // goal / problem-solving focus
    accent: 'green',
    topics: ['Problem Solving', 'Adaptability', 'Time Management', 'Accountability'],
  },
  {
    id: 'growth',
    label: 'Growth',
    description: 'Creativity & mindset',
    icon: Sprout,         // growth / learning mindset
    accent: 'purple',
    topics: ['Creativity', 'Learning Mindset', 'Customer Focus'],
  },
]

const SYSTEM_DESIGN_BUNDLES: Bundle[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    description: 'Scalability & caching',
    icon: Server,         // infrastructure / servers
    accent: 'blue',
    topics: ['Scalability', 'Load Balancing', 'Caching', 'CDN'],
  },
  {
    id: 'data',
    label: 'Data & Storage',
    description: 'Databases & consistency',
    icon: HardDrive,      // physical storage = data persistence
    accent: 'green',
    topics: ['Databases', 'Storage', 'Consistency', 'CAP Theorem'],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    description: 'Microservices & queues',
    icon: LayoutGrid,     // component grid = system architecture
    accent: 'purple',
    topics: ['Microservices', 'Event Driven Architecture', 'Message Queues', 'Distributed Systems'],
  },
  {
    id: 'operations',
    label: 'Operations',
    description: 'APIs & reliability',
    icon: Gauge,          // performance dial = monitoring & reliability
    accent: 'amber',
    topics: ['API Design', 'Availability', 'Monitoring'],
  },
]

const HR_BUNDLES: Bundle[] = [
  {
    id: 'profile',
    label: 'Profile',
    description: 'Intro & background',
    icon: Contact,        // contact card = profile / intro
    accent: 'sky',
    topics: ['introduction', 'background'],
  },
  {
    id: 'role-fit',
    label: 'Role Fit',
    description: 'Motivation & strengths',
    icon: Handshake,      // handshake = mutual fit / motivation
    accent: 'green',
    topics: ['motivation', 'strengths_weaknesses'],
  },
  {
    id: 'logistics',
    label: 'Logistics',
    description: 'Timing & preferences',
    icon: CalendarCheck,  // calendar with check = scheduling / availability
    accent: 'amber',
    topics: ['availability', 'salary', 'work_preferences', 'general_hr'],
  },
]

const BUNDLES_BY_TYPE: Record<TopicBundleSelectorType, Bundle[]> = {
  coding: CODING_BUNDLES,
  behavioral: BEHAVIORAL_BUNDLES,
  system_design: SYSTEM_DESIGN_BUNDLES,
  hr: HR_BUNDLES,
}

const HR_DISPLAY_LABEL: Record<string, string> = {
  introduction: 'Introduction',
  background: 'Background',
  motivation: 'Motivation',
  strengths_weaknesses: 'Strengths & Weaknesses',
  availability: 'Availability',
  salary: 'Salary',
  work_preferences: 'Work Preferences',
  general_hr: 'General HR Questions',
}

function displayLabel(type: TopicBundleSelectorType, key: string): string {
  return type === 'hr' ? (HR_DISPLAY_LABEL[key] ?? key) : key
}

// ── Component ──────────────────────────────────────────────────────────────────
export function TopicBundleSelector({
  type,
  selected,
  onChange,
}: {
  type: TopicBundleSelectorType
  selected: string[]
  onChange: (next: string[]) => void
}) {
  const bundles = BUNDLES_BY_TYPE[type]
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const totalCount = useMemo(
    () => [...new Set(bundles.flatMap((b) => b.topics))].length,
    [bundles],
  )

  const bundleState = (bundle: Bundle): 'all' | 'partial' | 'none' => {
    const inSel = bundle.topics.filter((t) => selectedSet.has(t))
    if (inSel.length === 0) return 'none'
    if (inSel.length === bundle.topics.length) return 'all'
    return 'partial'
  }

  const toggleBundle = (bundle: Bundle) => {
    const state = bundleState(bundle)
    if (state === 'all') {
      onChange(selected.filter((t) => !bundle.topics.includes(t as string)))
    } else {
      const toAdd = bundle.topics.filter((t) => !selectedSet.has(t))
      onChange([...selected, ...toAdd])
    }
  }

  const removeTopic = (key: string) => onChange(selected.filter((t) => t !== key))

  const selectAll = () =>
    onChange([...new Set(bundles.flatMap((b) => b.topics as string[]))])

  const clearAll = () => onChange([])

  const cols =
    bundles.length <= 3
      ? 'grid-cols-3'
      : bundles.length === 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3'

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {selected.length} of {totalCount} selected
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={selectAll}
            className="inline-flex h-7 items-center rounded-md border border-border bg-input/20 px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-input/40 hover:text-foreground"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-7 items-center rounded-md border border-border bg-input/20 px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-input/40 hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Bundle cards */}
      <div className={`grid gap-2 ${cols}`}>
        {bundles.map((bundle) => {
          const state = bundleState(bundle)
          const isActive = state === 'all'
          const isPartial = state === 'partial'
          const Icon = bundle.icon
          const accent = ACCENT[bundle.accent]

          return (
            <motion.button
              key={bundle.id}
              type="button"
              onClick={() => toggleBundle(bundle)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={[
                'group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border px-2.5 py-4 text-center outline-none transition-all duration-200',
                'focus-visible:ring-2 focus-visible:ring-primary/40',
                isActive
                  ? `bg-card ${accent.card}`
                  : isPartial
                    ? `bg-card/80 ${accent.partial}`
                    : 'border-border bg-card/70 hover:border-primary/25 hover:bg-card',
              ].join(' ')}
            >
              {/* Color blob */}
              <div
                className={[
                  'pointer-events-none absolute -right-3 -top-3 h-12 w-12 rounded-full blur-xl transition-opacity',
                  accent.blob,
                  isActive ? 'opacity-15' : 'opacity-0 group-hover:opacity-8',
                ].join(' ')}
                aria-hidden
              />

              {/* Check / partial badge */}
              <span
                className={[
                  'absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full border transition-all',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground opacity-100'
                    : isPartial
                      ? 'border-muted-foreground/40 bg-surface/80 opacity-80'
                      : 'border-border bg-surface/80 opacity-0 group-hover:opacity-60',
                ].join(' ')}
                aria-hidden
              >
                {isActive ? (
                  <Check className="h-2.5 w-2.5" />
                ) : isPartial ? (
                  <span className="h-1.5 w-1.5 rounded-sm bg-muted-foreground/70" />
                ) : null}
              </span>

              {/* Icon */}
              <span
                className={[
                  'relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200',
                  accent.icon,
                  isActive || isPartial ? 'scale-105' : 'group-hover:scale-105',
                ].join(' ')}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>

              {/* Label */}
              <span className="relative text-[12px] font-semibold leading-tight text-foreground">
                {bundle.label}
              </span>

              {/* Description */}
              <span className="relative text-[10px] leading-tight text-muted-foreground">
                {bundle.description}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Selected chips strip */}
      {selected.length > 0 ? (
        <div className="rounded-lg border border-border bg-surface/50 p-3">
          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Selected ({selected.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => removeTopic(key)}
                className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-destructive/35 hover:bg-destructive/8 hover:text-destructive"
                title="Click to remove"
              >
                {displayLabel(type, key)}
                <X className="h-2.5 w-2.5 opacity-55" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-surface/30 px-4 py-3 text-center text-xs text-muted-foreground">
          Pick one or more bundles above — or tap Select all.
        </div>
      )}
    </div>
  )
}

// ── Dynamic Topic Grid ─────────────────────────────────────────────────────────
// Used for catalog-driven interview types (e.g. "technical") where topics come
// from the selected specialization rather than a fixed bank.

const CYCLE_ACCENTS = [
  'blue', 'green', 'amber', 'purple', 'sky', 'rose',
] as const satisfies ReadonlyArray<keyof typeof ACCENT>

interface DynamicTopicGridProps {
  /** All available topics for this catalog selection */
  topics: string[]
  selected: string[]
  onChange: (next: string[]) => void
  /** Shown above the grid, e.g. "Technical Topics" */
  heading?: string
  /** Optional custom display label per topic key */
  labelFn?: (topic: string) => string
}

/**
 * Same visual language as TopicBundleSelector but for arbitrary dynamic topic
 * lists — each topic becomes its own selectable card.
 */
export function DynamicTopicGrid({
  topics,
  selected,
  onChange,
  heading,
  labelFn,
}: DynamicTopicGridProps) {
  const label = (t: string) => (labelFn ? labelFn(t) : t)
  const selectedSet = useMemo(() => new Set(selected), [selected])

  const toggle = (topic: string) => {
    if (selectedSet.has(topic)) {
      onChange(selected.filter((t) => t !== topic))
    } else {
      onChange([...selected, topic])
    }
  }

  const selectAll = () => onChange([...topics])
  const clearAll = () => onChange([])

  // Responsive column count based on number of topics
  const cols =
    topics.length <= 3
      ? 'grid-cols-3'
      : topics.length <= 4
        ? 'grid-cols-2 sm:grid-cols-4'
        : topics.length <= 6
          ? 'grid-cols-2 sm:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-4'

  if (topics.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-surface/30 px-4 py-3 text-center text-xs text-muted-foreground">
        No topics available for the selected specialization.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {selected.length} of {topics.length} selected
          {heading ? ` · ${heading}` : ''}
        </span>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={selectAll}
            className="inline-flex h-7 items-center rounded-md border border-border bg-input/20 px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-input/40 hover:text-foreground"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-7 items-center rounded-md border border-border bg-input/20 px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-input/40 hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Topic cards */}
      <div className={`grid gap-2 ${cols}`}>
        {topics.map((topic, i) => {
          const isActive = selectedSet.has(topic)
          const accentKey = CYCLE_ACCENTS[i % CYCLE_ACCENTS.length]
          const accent = ACCENT[accentKey]

          return (
            <motion.button
              key={topic}
              type="button"
              onClick={() => toggle(topic)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={[
                'group relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border px-2.5 py-4 text-center outline-none transition-all duration-200',
                'focus-visible:ring-2 focus-visible:ring-primary/40',
                isActive
                  ? `bg-card ${accent.card}`
                  : 'border-border bg-card/70 hover:border-primary/25 hover:bg-card',
              ].join(' ')}
            >
              {/* Color blob */}
              <div
                className={[
                  'pointer-events-none absolute -right-3 -top-3 h-12 w-12 rounded-full blur-xl transition-opacity',
                  accent.blob,
                  isActive ? 'opacity-15' : 'opacity-0 group-hover:opacity-8',
                ].join(' ')}
                aria-hidden
              />

              {/* Check badge */}
              <span
                className={[
                  'absolute right-2 top-2 grid h-4 w-4 place-items-center rounded-full border transition-all',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground opacity-100'
                    : 'border-border bg-surface/80 opacity-0 group-hover:opacity-60',
                ].join(' ')}
                aria-hidden
              >
                {isActive ? <Check className="h-2.5 w-2.5" /> : null}
              </span>

              {/* Icon */}
              <span
                className={[
                  'relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-transform duration-200',
                  accent.icon,
                  isActive ? 'scale-105' : 'group-hover:scale-105',
                ].join(' ')}
              >
                <Tag className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>

              {/* Label */}
              <span className="relative text-[12px] font-semibold leading-tight text-foreground">
                {label(topic)}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Selected chips strip */}
      {selected.length > 0 ? (
        <div className="rounded-lg border border-border bg-surface/50 p-3">
          <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Selected ({selected.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggle(t)}
                className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:border-destructive/35 hover:bg-destructive/8 hover:text-destructive"
                title="Click to remove"
              >
                {label(t)}
                <X className="h-2.5 w-2.5 opacity-55" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border/60 bg-surface/30 px-4 py-3 text-center text-xs text-muted-foreground">
          Select one or more topics above — or tap Select all.
        </div>
      )}
    </div>
  )
}
