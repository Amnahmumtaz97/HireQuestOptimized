import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'font-semibold',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:pointer-events-none disabled:opacity-50',
    'pressable ripple',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-primary text-primary-foreground hover:text-primary-foreground shadow-glow-sm hover:shadow-glow border border-transparent',
        secondary:
          'glass border-glass text-foreground hover:bg-input/18 hover:border-white/10',
        outline:
          'border border-glass bg-transparent text-foreground hover:bg-input/14 hover:border-white/12',
        ghost:
          'border border-transparent bg-transparent text-foreground hover:bg-input/14',
        destructive:
          'border border-transparent bg-red-500/15 text-red-200 hover:bg-red-500/20 hover:text-red-100',
      },
      size: {
        sm: 'h-9 rounded-xl px-3 text-sm',
        md: 'h-10 rounded-2xl px-4 text-sm',
        lg: 'h-12 rounded-2xl px-5 text-sm',
        icon: 'h-10 w-10 rounded-2xl p-0',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'md',
    },
  },
)

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
