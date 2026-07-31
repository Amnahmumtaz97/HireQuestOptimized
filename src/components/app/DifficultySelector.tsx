'use client'

import React from 'react'

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Adaptive'

export function DifficultySelector({
  value,
  onChange,
}: {
  value: Difficulty
  onChange: (nextValue: Difficulty) => void
}) {
  const options: Array<{ key: Difficulty; subtitle: string }> = [
    { key: 'Easy', subtitle: 'Fundamentals & basics' },
    { key: 'Medium', subtitle: 'Application & analysis' },
    { key: 'Hard', subtitle: 'Advanced & tricky' },
    { key: 'Adaptive', subtitle: 'AI adjusts difficulty per question' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {options.map((option) => {
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
            ? 'text-emerald-600 dark:text-emerald-400'
            : option.key === 'Medium'
              ? 'text-amber-600 dark:text-amber-400'
              : option.key === 'Hard'
                ? 'text-red-600 dark:text-red-400'
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
            <div className={[
              'truncate text-sm font-semibold sm:text-base',
              selected ? titleClasses : 'text-foreground',
            ].join(' ')}>
              {option.key === 'Adaptive' ? 'Adaptive AI' : option.key}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{option.subtitle}</div>
          </button>
        )
      })}
    </div>
  )
}
