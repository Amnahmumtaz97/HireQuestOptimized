'use client'

import React from 'react'
import {
  DIFFICULTY_UI_OPTIONS,
  type SessionDifficulty,
} from '@/lib/interview-config/difficulty'

export type Difficulty = SessionDifficulty

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty | null
  onChange: (nextValue: Difficulty) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {DIFFICULTY_UI_OPTIONS.map((option) => {
        const selected = value === option.key
        const selectedClasses =
          option.key === 'Easy'
            ? 'border-emerald-500/50 bg-emerald-500/10 shadow-[0_8px_20px_-14px_rgba(16,185,129,0.45)]'
            : option.key === 'Medium'
              ? 'border-amber-500/50 bg-amber-500/10 shadow-[0_8px_20px_-14px_rgba(245,158,11,0.4)]'
              : option.key === 'Hard'
                ? 'border-red-500/50 bg-red-500/10 shadow-[0_8px_20px_-14px_rgba(239,68,68,0.4)]'
                : 'border-primary/50 bg-primary/10 shadow-[0_8px_20px_-14px_rgba(37,99,235,0.35)]'

        const titleClasses =
          option.key === 'Easy'
            ? 'text-success'
            : option.key === 'Medium'
              ? 'text-warning'
              : option.key === 'Hard'
                ? 'text-destructive'
                : 'text-primary'
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={[
              'w-full min-w-0 rounded-2xl border p-3 text-left transition-all sm:p-4',
              selected
                ? selectedClasses
                : 'border-border bg-input/30 hover:bg-input/50',
            ].join(' ')}
          >
            <div
              className={[
                'truncate text-sm font-semibold sm:text-base',
                selected ? titleClasses : 'text-foreground',
              ].join(' ')}
            >
              {option.label}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{option.subtitle}</div>
          </button>
        )
      })}
    </div>
  )
}
