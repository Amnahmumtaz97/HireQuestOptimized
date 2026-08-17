'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import {
  INTERVIEW_TYPE_LABELS,
  INTERVIEW_TYPE_UI_ORDER,
  type InterviewTypeKey,
} from '@/lib/interview-config/interview-types'

export type InterviewType = InterviewTypeKey | 'both'

// ── SVG Illustrations ─────────────────────────────────────────────────────────

function TechnicalIllustration({ active }: { active: boolean }) {
  const c = active ? '#60a5fa' : 'currentColor'
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      {/* Brain outline */}
      <path
        d="M20 8c-5.5 0-10 4-10 9 0 2 .7 3.8 1.8 5.2C10.7 23.5 10 25 10 26.5c0 2.5 2 4.5 4.5 4.5H20h5.5c2.5 0 4.5-2 4.5-4.5 0-1.5-.7-3-1.8-4.3C29.3 20.8 30 19 30 17c0-5-4.5-9-10-9z"
        stroke={c} strokeWidth="1.6" strokeLinejoin="round"
      />
      {/* Circuit lines */}
      <line x1="20" y1="14" x2="20" y2="19" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="17" x2="24" y2="17" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="20" cy="14" r="1.5" fill={c} />
      <circle cx="16" cy="17" r="1.5" fill={c} />
      <circle cx="24" cy="17" r="1.5" fill={c} />
      <circle cx="20" cy="22" r="1.5" fill={c} />
      <line x1="20" y1="19" x2="20" y2="22" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function CodingIllustration({ active }: { active: boolean }) {
  const c = active ? '#60a5fa' : 'currentColor'
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      {/* Terminal window */}
      <rect x="6" y="9" width="28" height="22" rx="3" stroke={c} strokeWidth="1.6" />
      <line x1="6" y1="15" x2="34" y2="15" stroke={c} strokeWidth="1.2" />
      {/* Traffic light dots */}
      <circle cx="10.5" cy="12" r="1.2" fill={c} opacity="0.6" />
      <circle cx="14" cy="12" r="1.2" fill={c} opacity="0.4" />
      <circle cx="17.5" cy="12" r="1.2" fill={c} opacity="0.25" />
      {/* Code brackets */}
      <path d="M14 22l-3.5 2 3.5 2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 22l3.5 2-3.5 2" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="22" y1="20" x2="18" y2="28" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

function SystemDesignIllustration({ active }: { active: boolean }) {
  const c = active ? '#60a5fa' : 'currentColor'
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      {/* Top node */}
      <rect x="15" y="6" width="10" height="7" rx="2" stroke={c} strokeWidth="1.5" />
      {/* Left node */}
      <rect x="5" y="24" width="10" height="7" rx="2" stroke={c} strokeWidth="1.5" />
      {/* Right node */}
      <rect x="25" y="24" width="10" height="7" rx="2" stroke={c} strokeWidth="1.5" />
      {/* Center dot */}
      <circle cx="20" cy="19" r="2.5" fill={c} opacity="0.85" />
      {/* Connecting lines */}
      <line x1="20" y1="13" x2="20" y2="16.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="10" y1="24" x2="18" y2="20.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="30" y1="24" x2="22" y2="20.5" stroke={c} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function BehavioralIllustration({ active }: { active: boolean }) {
  const c = active ? '#a78bfa' : 'currentColor'
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      {/* Left bubble */}
      <path
        d="M7 10h16a3 3 0 013 3v7a3 3 0 01-3 3H14l-5 3v-3H7a3 3 0 01-3-3v-7a3 3 0 013-3z"
        stroke={c} strokeWidth="1.5" strokeLinejoin="round"
      />
      {/* Right bubble */}
      <path
        d="M18 22h9a3 3 0 013 3v5a3 3 0 01-3 3h-2v2l-4-2h-3a3 3 0 01-3-3v-5a3 3 0 013-3z"
        stroke={c} strokeWidth="1.5" strokeLinejoin="round" opacity="0.65"
      />
      {/* Dots in left bubble */}
      <circle cx="12" cy="16.5" r="1.2" fill={c} />
      <circle cx="16" cy="16.5" r="1.2" fill={c} />
      <circle cx="20" cy="16.5" r="1.2" fill={c} />
    </svg>
  )
}

function HRIllustration({ active }: { active: boolean }) {
  const c = active ? '#a78bfa' : 'currentColor'
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      {/* Center person */}
      <circle cx="20" cy="13" r="4.5" stroke={c} strokeWidth="1.5" />
      <path d="M11 32c0-5 4-9 9-9s9 4 9 9" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      {/* Left person (smaller) */}
      <circle cx="9" cy="15" r="3" stroke={c} strokeWidth="1.3" opacity="0.6" />
      <path d="M3 32c0-3.5 2.7-6 6-6" stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
      {/* Right person (smaller) */}
      <circle cx="31" cy="15" r="3" stroke={c} strokeWidth="1.3" opacity="0.6" />
      <path d="M37 32c0-3.5-2.7-6-6-6" stroke={c} strokeWidth="1.3" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

function MixedIllustration({ active }: { active: boolean }) {
  const c = active ? '#f59e0b' : 'currentColor'
  return (
    <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9" aria-hidden>
      {/* 2×2 quadrant blocks */}
      <rect x="5" y="5" width="13" height="13" rx="3" stroke={c} strokeWidth="1.5" opacity="0.9" />
      <rect x="22" y="5" width="13" height="13" rx="3" stroke="#60a5fa" strokeWidth="1.5" opacity="0.8" />
      <rect x="5" y="22" width="13" height="13" rx="3" stroke="#a78bfa" strokeWidth="1.5" opacity="0.8" />
      <rect x="22" y="22" width="13" height="13" rx="3" stroke="#34d399" strokeWidth="1.5" opacity="0.8" />
      {/* Inner symbols */}
      {/* top-left: brain dot */}
      <circle cx="11.5" cy="11.5" r="2.5" fill={c} opacity="0.7" />
      {/* top-right: </> */}
      <path d="M26.5 10.5l-1.5 1.5 1.5 1.5" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M31.5 10.5l1.5 1.5-1.5 1.5" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      {/* bottom-left: chat dot */}
      <circle cx="11.5" cy="28.5" r="2.5" fill="#a78bfa" opacity="0.7" />
      {/* bottom-right: person */}
      <circle cx="28.5" cy="27" r="2" fill="#34d399" opacity="0.7" />
      <path d="M24.5 34c0-2.2 1.8-4 4-4" stroke="#34d399" strokeWidth="1.3" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}

const ILLUSTRATIONS: Record<InterviewTypeKey, (props: { active: boolean }) => React.ReactElement> = {
  technical:    TechnicalIllustration,
  coding:       CodingIllustration,
  system_design: SystemDesignIllustration,
  behavioral:   BehavioralIllustration,
  hr:           HRIllustration,
  mixed:        MixedIllustration,
}

// ── Style map ─────────────────────────────────────────────────────────────────

type StyleConfig = {
  accent: string
  glow: string
  ring: string
  iconBg: string
  blob: string
}

const STYLE_BY_TYPE: Record<InterviewTypeKey, StyleConfig> = {
  technical:     { accent: 'interview-type-accent--tech', glow: 'interview-type-glow--tech', ring: 'interview-type-ring--tech', iconBg: 'interview-type-icon--tech', blob: 'interview-type-blob--tech' },
  coding:        { accent: 'interview-type-accent--tech', glow: 'interview-type-glow--tech', ring: 'interview-type-ring--tech', iconBg: 'interview-type-icon--tech', blob: 'interview-type-blob--tech' },
  system_design: { accent: 'interview-type-accent--tech', glow: 'interview-type-glow--tech', ring: 'interview-type-ring--tech', iconBg: 'interview-type-icon--tech', blob: 'interview-type-blob--tech' },
  behavioral:    { accent: 'interview-type-accent--beh',  glow: 'interview-type-glow--beh',  ring: 'interview-type-ring--beh',  iconBg: 'interview-type-icon--beh',  blob: 'interview-type-blob--beh'  },
  hr:            { accent: 'interview-type-accent--beh',  glow: 'interview-type-glow--beh',  ring: 'interview-type-ring--beh',  iconBg: 'interview-type-icon--beh',  blob: 'interview-type-blob--beh'  },
  mixed:         { accent: 'interview-type-accent--both', glow: 'interview-type-glow--both', ring: 'interview-type-ring--both', iconBg: 'interview-type-icon--both', blob: 'interview-type-blob--both' },
}

type OptionConfig = {
  key: InterviewTypeKey
  title: string
  accent: string
  glow: string
  ring: string
  iconBg: string
  blob: string
}

const ALL_OPTIONS: OptionConfig[] = INTERVIEW_TYPE_UI_ORDER.map((key) => ({
  key,
  title: INTERVIEW_TYPE_LABELS[key],
  ...STYLE_BY_TYPE[key],
}))

// ── Category groups ───────────────────────────────────────────────────────────

type CategoryGroup = {
  label: string
  description: string
  keys: InterviewTypeKey[]
  /** Tailwind grid class for this group's cards */
  cols: string
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: 'Technical',
    description: 'Problem-solving, code, and architecture',
    keys: ['technical', 'coding', 'system_design'],
    cols: 'grid-cols-1 sm:grid-cols-3',
  },
  {
    label: 'Soft Skills',
    description: 'Communication, leadership, and culture fit',
    keys: ['behavioral', 'hr'],
    cols: 'grid-cols-1 sm:grid-cols-2',
  },
  {
    label: 'Combined',
    description: 'All types blended in one session',
    keys: ['mixed'],
    cols: 'grid-cols-1',
  },
]

// ── Card ─────────────────────────────────────────────────────────────────────

function TypeCard({
  option,
  selected,
  onChange,
}: {
  option: OptionConfig
  selected: boolean
  onChange: (key: InterviewType) => void
}) {
  const Illustration = ILLUSTRATIONS[option.key]
        return (
          <motion.button
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.key)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className={[
        'group relative flex min-h-[96px] flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border px-3 py-4 outline-none transition-colors duration-200',
              'focus-visible:ring-2 focus-visible:ring-primary/40',
              selected
                ? `border-primary/45 bg-card ring-2 ring-inset ${option.ring} ${option.glow}`
                : 'border-border bg-card/70 hover:border-primary/25 hover:bg-card',
            ].join(' ')}
          >
      {/* Glow blob */}
            <div
              className={[
                'pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl transition-opacity',
                option.blob,
                selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50',
              ].join(' ')}
              aria-hidden
            />

      {/* Illustration */}
            <span
              className={[
          'relative inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-transform duration-200',
                option.iconBg,
          selected
            ? `scale-105 ${option.accent}`
            : 'text-muted-foreground group-hover:scale-105 group-hover:text-foreground',
              ].join(' ')}
            >
        <Illustration active={selected} />
            </span>

      {/* Label */}
      <span className="relative w-full whitespace-nowrap text-center text-[12px] font-semibold leading-tight text-foreground">
              {option.title}
            </span>

      {/* Check badge */}
            <span
              className={[
                'absolute right-2.5 top-2.5 grid h-4 w-4 place-items-center rounded-full border transition-all',
                selected
                  ? 'border-primary bg-primary text-primary-foreground opacity-100'
                  : 'border-border bg-surface/80 opacity-0 group-hover:opacity-60',
              ].join(' ')}
              aria-hidden
            >
              {selected ? <Check className="h-2.5 w-2.5" /> : null}
            </span>
          </motion.button>
        )
}

// ── Selector ─────────────────────────────────────────────────────────────────

export function InterviewTypeSelector({
  value,
  onChange,
  availableTypes,
}: {
  value: InterviewType | null
  onChange: (nextValue: InterviewType) => void
  availableTypes?: InterviewType[]
}) {
  const allowedKeys = new Set<InterviewType>(
    availableTypes?.length
      ? availableTypes.flatMap((t) => (t === 'both' ? ['mixed', 'both'] : [t]))
      : INTERVIEW_TYPE_UI_ORDER,
  )

  const visibleGroups = CATEGORY_GROUPS.map((group) => ({
    ...group,
    options: group.keys
      .filter((k) => allowedKeys.has(k))
      .map((k) => ALL_OPTIONS.find((o) => o.key === k)!),
  })).filter((g) => g.options.length > 0)

  return (
    <div className="space-y-5">
      {visibleGroups.map((group) => (
        <div key={group.label}>
          {/* Category header */}
          <div className="mb-2.5 flex items-baseline gap-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              {group.label}
            </span>
            <span className="hidden text-[11px] text-muted-foreground/60 sm:inline">
              — {group.description}
            </span>
          </div>

          {/* Cards */}
          <div className={`grid gap-3 ${group.cols}`}>
            {group.options.map((option) => (
              <TypeCard
                key={option.key}
                option={option}
                selected={
                  value === option.key ||
                  (option.key === 'mixed' && value === 'both')
                }
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
