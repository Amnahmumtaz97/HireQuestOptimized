'use client'

import { SelectionChip } from '@/components/ui/selection-chip'

export function ChipMultiSelect({
  options,
  selected,
  onChange,
  search = '',
  emptyLabel = 'No options match.',
  minHint = 'Select one or more.',
}: {
  options: ReadonlyArray<string | { key: string; label: string }>
  selected: string[]
  onChange: (next: string[]) => void
  search?: string
  emptyLabel?: string
  minHint?: string
}) {
  const normalized = search.trim().toLowerCase()
  const items = options.map((o) =>
    typeof o === 'string' ? { key: o, label: o } : o,
  )
  const visible = normalized
    ? items.filter(
        (o) =>
          o.label.toLowerCase().includes(normalized) ||
          o.key.toLowerCase().includes(normalized),
      )
    : items

  const selectedSet = new Set(selected)

  const toggle = (key: string) => {
    if (selectedSet.has(key)) onChange(selected.filter((k) => k !== key))
    else onChange([...selected, key])
  }

  const selectAll = () => onChange(items.map((i) => i.key))
  const clearAll = () => onChange([])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {selected.length} of {items.length} selected
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-input/20 px-3 text-xs font-semibold text-muted-foreground hover:bg-input/40 hover:text-foreground"
          >
            Select all
          </button>
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex min-h-10 items-center rounded-xl border border-border bg-input/20 px-3 text-xs font-semibold text-muted-foreground hover:bg-input/40 hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-surface/60 p-3 min-h-[7rem]">
        {visible.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyLabel}</p>
        ) : (
          visible.map((item) => {
            const on = selectedSet.has(item.key)
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => toggle(item.key)}
                className={[
                  'rounded-full border px-3 py-2 text-xs font-medium transition-colors',
                  on
                    ? 'border-primary/45 bg-primary/10 text-foreground'
                    : 'border-border bg-input/15 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                ].join(' ')}
              >
                {item.label}
              </button>
            )
          })
        )}
      </div>
      {selected.length ? (
        <div className="rounded-2xl border border-border bg-surface p-3">
          <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Selected ({selected.length})
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {selected.slice(0, 16).map((key) => {
              const label = items.find((i) => i.key === key)?.label ?? key
              return (
                <SelectionChip key={key} active onClick={() => toggle(key)} title="Remove">
                  <span>{label}</span>
                  <span className="text-muted-foreground/70">×</span>
                </SelectionChip>
              )
            })}
            {selected.length > 16 ? (
              <span className="text-xs text-muted-foreground">+{selected.length - 16} more</span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-3 text-xs text-muted-foreground">
          {minHint}
        </div>
      )}
    </div>
  )
}
