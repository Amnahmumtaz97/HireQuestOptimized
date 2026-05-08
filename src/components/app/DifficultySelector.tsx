'use client'

import React from 'react'

export type Difficulty = 'Easy' | 'Medium' | 'Hard'

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
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option.key
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={[
              'w-full rounded-2xl border p-4 text-left transition-all',
              selected
                ? 'border-primary bg-input/50 shadow-glow-sm'
                : 'border-border bg-input/30 hover:bg-input/50',
            ].join(' ')}
          >
            <div className="text-sm font-semibold text-foreground">{option.key}</div>
            <div className="mt-1 text-xs text-muted-foreground">{option.subtitle}</div>
          </button>
        )
      })}
    </div>
  )
}

