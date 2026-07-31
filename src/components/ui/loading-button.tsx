'use client'

import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { BounceLoader } from '@/components/ui/bounce-loader'

export type LoadingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean
  loadingLabel?: string
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className = '', loading = false, loadingLabel, disabled, children, type = 'button', ...props }, ref) => {
    const isBusy = Boolean(loading || disabled)
    return (
      <button
        ref={ref}
        type={type}
        disabled={isBusy}
        aria-busy={loading || undefined}
        className={[
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-opacity disabled:pointer-events-none disabled:opacity-50',
          className,
        ].join(' ')}
        {...props}
      >
        {loading ? <BounceLoader size="sm" label={loadingLabel || 'Loading'} /> : null}
        {loading && loadingLabel ? loadingLabel : children}
      </button>
    )
  },
)

LoadingButton.displayName = 'LoadingButton'
