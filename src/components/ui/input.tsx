import * as React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={[
          'w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground shadow-inset-highlight',
          'placeholder:text-muted-foreground outline-none transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:shadow-card',
          'hover:border-primary/30 hover:bg-surface-strong',
          'disabled:cursor-not-allowed disabled:opacity-60',
          'autofill:bg-surface autofill:text-foreground',
          // Error state — triggered by aria-invalid="true"
          '[&[aria-invalid=true]]:border-red-500/60 [&[aria-invalid=true]]:bg-red-500/5',
          '[&[aria-invalid=true]]:ring-2 [&[aria-invalid=true]]:ring-red-500/15',
          '[&[aria-invalid=true]]:focus-visible:border-red-500/80 [&[aria-invalid=true]]:focus-visible:ring-red-500/25',
          '[&[aria-invalid=true]]:hover:border-red-500/70',
          className,
        ].join(' ')}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
