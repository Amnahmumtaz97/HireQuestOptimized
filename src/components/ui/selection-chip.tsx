'use client'

import * as React from 'react'

type SelectionChipProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean
}

export function SelectionChip({
  active = false,
  className = '',
  children,
  type = 'button',
  ...props
}: SelectionChipProps) {
  return (
    <button
      type={type}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium outline-none transition-all duration-200 ease-out transform-gpu',
        'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[color-mix(in_oklab,var(--primary)_30%,transparent)]',
        active
          ? 'border-primary/70 bg-surface-strong text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_55%,transparent)]'
          : 'border-border bg-surface text-muted-foreground hover:border-primary/40 hover:bg-surface-strong hover:text-foreground',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
}
