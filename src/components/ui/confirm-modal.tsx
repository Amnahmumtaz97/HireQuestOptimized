'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export type ConfirmModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: ReactNode
  cancelLabel?: string
  confirmLabel: string
  /** Primary confirm button style */
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void | Promise<void>
  /** Disable all actions (e.g. parent-controlled loading) */
  disabled?: boolean
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel = 'Cancel',
  confirmLabel,
  confirmVariant = 'danger',
  onConfirm,
  disabled = false,
}: ConfirmModalProps) {
  const titleId = useId()
  const descId = useId()
  const confirmBtnRef = useRef<HTMLButtonElement>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    queueMicrotask(() => confirmBtnRef.current?.focus())
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        if (!busy && !disabled) onOpenChange(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, busy, disabled, onOpenChange])

  if (!open) return null

  const loading = busy || disabled

  const runConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px] btn-micro"
        disabled={loading}
        onClick={() => !loading && onOpenChange(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-[var(--hq-row-elevated)] p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.55)]"
      >
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p id={descId} className="mt-2 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => onOpenChange(false)}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-input/30 px-4 text-sm font-semibold text-foreground hover:bg-input/50 disabled:opacity-50 btn-micro"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={loading}
            onClick={() => void runConfirm()}
            className={[
              'inline-flex h-10 min-w-[8rem] items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 btn-micro',
              confirmVariant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 focus-visible:ring-2 focus-visible:ring-red-400'
                : 'bg-gradient-primary hover:opacity-95',
            ].join(' ')}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
