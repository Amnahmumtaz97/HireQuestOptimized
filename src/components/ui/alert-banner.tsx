import React from 'react'
import { CheckCircle2, Info, AlertTriangle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AlertVariant = 'success' | 'info' | 'warning' | 'error'

const CONFIG: Record<
  AlertVariant,
  {
    border: string
    bg: string
    hoverBg: string
    text: string
    icon: React.ElementType
    iconColor: string
  }
> = {
  success: {
    border: 'border-l-4 border-green-500 dark:border-green-600',
    bg: 'bg-green-50 dark:bg-green-950/60',
    hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/70',
    text: 'text-green-800 dark:text-green-100',
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
  },
  info: {
    border: 'border-l-4 border-blue-500 dark:border-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/60',
    hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/70',
    text: 'text-blue-800 dark:text-blue-100',
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  warning: {
    border: 'border-l-4 border-yellow-500 dark:border-yellow-600',
    bg: 'bg-yellow-50 dark:bg-yellow-950/60',
    hoverBg: 'hover:bg-yellow-100 dark:hover:bg-yellow-900/70',
    text: 'text-yellow-800 dark:text-yellow-100',
    icon: AlertTriangle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  error: {
    border: 'border-l-4 border-red-500 dark:border-red-600',
    bg: 'bg-red-50 dark:bg-red-950/60',
    hoverBg: 'hover:bg-red-100 dark:hover:bg-red-900/70',
    text: 'text-red-800 dark:text-red-100',
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
  },
}

interface AlertBannerProps {
  variant: AlertVariant
  children: React.ReactNode
  className?: string
}

export function AlertBanner({ variant, children, className }: AlertBannerProps) {
  const c = CONFIG[variant]
  const Icon = c.icon

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 rounded-lg p-3 transition duration-200 ease-in-out hover:scale-[1.01]',
        c.border,
        c.bg,
        c.hoverBg,
        c.text,
        className,
      )}
    >
      <Icon className={cn('mt-px h-4 w-4 shrink-0', c.iconColor)} aria-hidden />
      <p className="text-xs font-semibold leading-snug">{children}</p>
    </div>
  )
}
