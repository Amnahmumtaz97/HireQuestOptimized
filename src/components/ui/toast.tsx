'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

export type ToastVariant = 'success' | 'error' | 'info'

type ToastItem = { id: number; message: string; variant: ToastVariant }

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant, durationMs?: number) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string, durationMs?: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

const AUTO_DISMISS_MS = 4800
const INFO_DISMISS_MS = 8000
const MAX_VISIBLE = 3

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info', durationMs?: number) => {
      const id = Date.now() + Math.random()
      setItems((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, message, variant }])
      const ms = durationMs ?? (variant === 'info' ? INFO_DISMISS_MS : AUTO_DISMISS_MS)
      window.setTimeout(() => dismiss(id), ms)
      return id
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      success: (message: string) => showToast(message, 'success'),
      error: (message: string) => showToast(message, 'error'),
      info: (message: string, durationMs?: number) => showToast(message, 'info', durationMs),
    }),
    [showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="fixed bottom-28 right-4 z-[250] flex max-w-[min(24rem,calc(100vw-2rem))] flex-col gap-2 pointer-events-none sm:bottom-32"
        aria-live="polite"
      >
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={[
              'pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-modal animate-fade-in',
              t.variant === 'success'
                ? 'border-emerald-400/50 bg-emerald-950 text-emerald-100'
                : t.variant === 'error'
                  ? 'border-rose-400/50 bg-rose-950 text-rose-100'
                  : 'border-amber-400/55 bg-amber-950 text-amber-50',
            ].join(' ')}
          >
            {t.variant === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" aria-hidden />
            ) : t.variant === 'error' ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" aria-hidden />
            ) : (
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
            )}
            <span className="min-w-0 flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-md p-0.5 text-current/50 transition hover:bg-white/10 hover:text-current"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
