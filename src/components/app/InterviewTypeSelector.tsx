'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, Check, MessageCircle, Sparkles } from 'lucide-react'

export type InterviewType = 'technical' | 'behavioral' | 'both'

const OPTIONS = [
  {
    key: 'technical' as const,
    title: 'Technical',
    icon: BrainCircuit,
    accent: 'text-cyan-300',
    glow: 'shadow-[0_10px_28px_-12px_rgba(6,182,212,0.5)]',
    ring: 'ring-cyan-400/40',
    iconBg: 'bg-cyan-500/15 border-cyan-400/30',
    blob: 'bg-cyan-500/20',
  },
  {
    key: 'behavioral' as const,
    title: 'Behavioral',
    icon: MessageCircle,
    accent: 'text-violet-300',
    glow: 'shadow-[0_10px_28px_-12px_rgba(139,92,246,0.5)]',
    ring: 'ring-violet-400/40',
    iconBg: 'bg-violet-500/15 border-violet-400/30',
    blob: 'bg-violet-500/20',
  },
  {
    key: 'both' as const,
    title: 'Both',
    icon: Sparkles,
    accent: 'text-amber-200',
    glow: 'shadow-[0_10px_28px_-12px_rgba(251,191,36,0.4)]',
    ring: 'ring-amber-300/35',
    iconBg: 'bg-amber-500/15 border-amber-300/30',
    blob: 'bg-amber-400/20',
  },
]

export function InterviewTypeSelector({
  value,
  onChange,
}: {
  value: InterviewType | null
  onChange: (nextValue: InterviewType) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map((option) => {
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
                ? `border-primary/45 bg-input/50 ring-2 ring-inset ${option.ring} ${option.glow}`
                : 'border-border bg-input/20 hover:border-primary/25 hover:bg-input/35',
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
                'relative text-sm font-semibold transition-colors',
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
