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
          className,
        ].join(' ')}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
