'use client'

import { useId } from 'react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

interface ThemeSwitchProps {
  className?: string
  /** Show a small "Light / Dark" label next to the switch */
  showLabel?: boolean
}

/**
 * Animated pill switch that toggles between light (sun) and dark (moon) mode.
 * Unchecked = light, checked = dark.
 */
export function ThemeSwitch({ className, showLabel = false }: ThemeSwitchProps) {
  const { theme, toggleTheme } = useTheme()
  const id = useId()
  const isDark = theme === 'dark'

  return (
    <label
      htmlFor={id}
      className={cn('ui-switch select-none', className)}
      aria-label="Toggle theme"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      suppressHydrationWarning
    >
      <input
        id={id}
        type="checkbox"
        checked={isDark}
        onChange={toggleTheme}
        aria-label="Toggle theme"
        suppressHydrationWarning
      />
      <div className="slider">
        <div className="circle" />
      </div>
      {showLabel ? (
        <span className="ml-3 text-xs font-semibold text-muted-foreground">
          {isDark ? 'Dark' : 'Light'}
        </span>
      ) : null}
    </label>
  )
}
