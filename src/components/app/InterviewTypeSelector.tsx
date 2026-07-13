'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, Check, MessageCircle, Sparkles } from 'lucide-react'

export type InterviewType = 'technical' | 'behavioral' | 'both' | 'hr'

const OPTIONS = [
  {
    key: 'technical' as const,
    title: 'Technical',
    icon: BrainCircuit,
    accent: 'interview-type-accent--tech',
    glow: 'interview-type-glow--tech',
    ring: 'interview-type-ring--tech',
    iconBg: 'interview-type-icon--tech',
    blob: 'interview-type-blob--tech',
  },
  {
    key: 'behavioral' as const,
    title: 'Behavioral',
    icon: MessageCircle,
    accent: 'interview-type-accent--beh',
    glow: 'interview-type-glow--beh',
    ring: 'interview-type-ring--beh',
    iconBg: 'interview-type-icon--beh',
    blob: 'interview-type-blob--beh',
  },
  {
    key: 'both' as const,
    title: 'Both',
    icon: Sparkles,
    accent: 'interview-type-accent--both',
    glow: 'interview-type-glow--both',
    ring: 'interview-type-ring--both',
    iconBg: 'interview-type-icon--both',
    blob: 'interview-type-blob--both',
  },
]

export function InterviewTypeSelector({
  value,
  onChange,
  availableTypes,
}: {
  value: InterviewType | null
  onChange: (nextValue: InterviewType) => void
  availableTypes?: InterviewType[]
}) {
  const visibleOptions = availableTypes?.length
    ? OPTIONS.filter((option) => availableTypes.includes(option.key))
    : OPTIONS

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {visibleOptions.map((option) => {
        const selected = value === option.key
        const Icon = option.icon

        return (
          <motion.button
            key={option.key}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.key)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            className={[
              'group relative flex min-h-[88px] flex-col items-center justify-center gap-2.5 overflow-hidden rounded-2xl border px-3 py-4 outline-none transition-colors duration-200',
              'focus-visible:ring-2 focus-visible:ring-primary/40',
              selected
                ? `border-primary/45 bg-card ring-2 ring-inset ${option.ring} ${option.glow}`
                : 'border-border bg-card/70 hover:border-primary/25 hover:bg-card',
            ].join(' ')}
          >
            <div
              className={[
                'pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full blur-2xl transition-opacity',
                option.blob,
                selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-50',
              ].join(' ')}
              aria-hidden
            />

            <span
              className={[
                'relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-transform duration-200',
                option.iconBg,
                selected ? `scale-105 ${option.accent}` : 'text-muted-foreground group-hover:scale-105 group-hover:text-foreground',
              ].join(' ')}
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>

            <span
              className={[
                'relative text-center text-sm font-semibold transition-colors',
                selected ? option.accent : 'text-foreground',
              ].join(' ')}
            >
              {option.title}
            </span>

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
      })}
    </div>
  )
}
