'use client'

import React, { forwardRef, type ReactNode } from 'react'
import { type IconConfig, ICON_SIZES, type IconSize } from '@/lib/icon-mapping'

interface IconCardProps {
  icon: IconConfig
  title: string
  subtitle?: string
  selected?: boolean
  onClick?: () => void
  disabled?: boolean
  size?: IconSize
  showIcon?: boolean
  children?: ReactNode
  className?: string
}

/**
 * Reusable IconCard component for displaying industry/role options
 * with Lucide React icons and modern glassmorphism styling
 */
export const IconCard = forwardRef<HTMLButtonElement, IconCardProps>(
  (
    {
      icon,
      title,
      subtitle,
      selected = false,
      onClick,
      disabled = false,
      size = 'md',
      showIcon = true,
      children,
      className = '',
    },
    ref,
  ) => {
    const IconComponent = icon.icon
    const sizes = ICON_SIZES[size]

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
          'group relative w-full rounded-2xl border p-4 text-left transition-all duration-300',
          'hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
          selected ? 'icon-card-selected' : 'border-border bg-input/30 hover:bg-input/50 hover:border-border/80',
          disabled && 'pointer-events-none opacity-50',
          className,
        ].filter(Boolean).join(' ')}
        aria-pressed={selected}
      >
        {/* Background gradient glow effect */}
        <div className="icon-card-glow" aria-hidden />

        <div className="relative flex items-start gap-4">
          {showIcon && (
            <div
              className={[
                'icon-card-icon-wrap relative flex flex-shrink-0 items-center justify-center rounded-xl border transition-all duration-300',
                selected ? 'ring-0' : '',
              ].join(' ')}
            >
              <IconComponent
                className={`${sizes.icon} ${selected ? 'text-[var(--hq-display-blue)]' : icon.accentColor} transition-colors duration-300`}
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div
              className={[
                'font-semibold transition-colors duration-300',
                selected ? 'text-foreground' : 'text-foreground/80 group-hover:text-foreground',
              ].join(' ')}
            >
              {title}
            </div>

            {subtitle && (
              <div className="mt-1 text-xs text-muted-foreground/70 group-hover:text-muted-foreground transition-colors duration-300">
                {subtitle}
              </div>
            )}

            {children && <div className="mt-2">{children}</div>}
          </div>

          {/* Selection indicator */}
          {selected && (
            <div className="ml-2 flex-shrink-0">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500">
                <svg
                  className="h-3 w-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      </button>
    )
  },
)

IconCard.displayName = 'IconCard'

/**
 * Grid wrapper component for displaying multiple IconCards
 */
export interface IconGridProps {
  children: ReactNode
  columns?: 1 | 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const IconGrid = forwardRef<HTMLDivElement, IconGridProps>(
  ({ children, columns = 3, gap = 'md', className = '' }, ref) => {
    const columnClasses = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }

    const gapClasses = {
      sm: 'gap-2.5',
      md: 'gap-3.5',
      lg: 'gap-4',
    }

    return (
      <div
        ref={ref}
        className={[
          'grid',
          columnClasses[columns],
          gapClasses[gap],
          className,
        ].join(' ')}
      >
        {children}
      </div>
    )
  },
)

IconGrid.displayName = 'IconGrid'
