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
    'transition-[background,box-shadow,transform,border-color] duration-150',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground border border-transparent shadow-sm hover:bg-primary-hover hover:-translate-y-px hover:shadow-card',
        secondary:
          'border border-border bg-card text-foreground hover:bg-secondary hover:-translate-y-px hover:shadow-card',
        outline:
          'border border-border bg-card text-foreground hover:bg-secondary hover:-translate-y-px hover:shadow-card',
        ghost:
          'border border-transparent bg-transparent text-foreground hover:bg-secondary hover:border-border',
        destructive:
          'border border-destructive/30 bg-destructive-muted text-destructive hover:bg-destructive/20',
      },
      size: {
        sm: 'h-9 rounded-[10px] px-3 text-sm',
        md: 'h-10 rounded-[10px] px-4 text-sm',
        lg: 'h-12 rounded-[10px] px-5 text-sm',
        icon: 'h-10 w-10 rounded-[10px] p-0',
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
