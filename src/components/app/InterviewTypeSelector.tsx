'use client'

import React from 'react'

export type InterviewType = 'technical' | 'behavioral' | 'both'

export function InterviewTypeSelector({
  value,
  onChange,
}: {
  value: InterviewType | null
  onChange: (nextValue: InterviewType) => void
}) {
  const options: Array<{
    key: InterviewType
    title: string
    description: string
    badge?: string
  }> = [
    { key: 'technical', title: 'Technical', description: 'Core skills & problem solving' },
    { key: 'behavioral', title: 'Behavioral', description: 'Communication & scenarios' },
    { key: 'both', title: 'Both', description: 'Technical + behavioral', badge: 'Mixed Interview' },
  ]

  return (
    <div className="space-y-3">
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
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-foreground">{option.title}</div>
                {option.badge && selected ? (
                  <span className="inline-flex items-center rounded-full border border-primary/50 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                    {option.badge}
                  </span>
                ) : null}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{option.description}</div>
            </button>
          )
        })}
      </div>

      {value === 'both' ? (
        <div className="rounded-2xl border border-primary/40 bg-input/30 p-3 text-xs text-foreground">
          <span className="font-semibold">Mixed Interview</span> — you’ll get a blend of technical and
          behavioral questions.
        </div>
      ) : null}
    </div>
  )
}

