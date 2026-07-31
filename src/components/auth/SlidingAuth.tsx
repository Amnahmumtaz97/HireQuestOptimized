'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandingPanel } from './BrandingPanel'
import { AuthForms } from './AuthForms'
import type { EnabledOAuthProviders } from '@/lib/oauth-config'

type Mode = 'signin' | 'signup'

interface SlidingAuthProps {
  oauth?: EnabledOAuthProviders
}

const EASE = [0.65, 0, 0.35, 1] as const

function AuthFormSkeleton() {
  return (
    <div className="relative flex h-full min-h-[480px] flex-col justify-center px-6 py-10 sm:px-10">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-56 animate-pulse rounded bg-muted/70" />
        <div className="mt-6 space-y-3">
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted/80" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted/80" />
          <div className="h-11 w-full animate-pulse rounded-[10px] bg-muted" />
        </div>
      </div>
    </div>
  )
}

export function SlidingAuth({ oauth }: SlidingAuthProps) {
  const [mode, setMode] = useState<Mode>('signin')
  const [ready, setReady] = useState(false)
  const toggle = () => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))

  // Mount forms only on the client so password-manager extensions
  // (fdprocessedid, etc.) can't cause SSR/client hydration mismatches.
  useEffect(() => {
    setReady(true)
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <div className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(17,24,39,0.28)]">

          {/* Mobile: form only */}
          <div className="relative flex flex-col overflow-y-auto lg:hidden">
            {!ready ? (
              <AuthFormSkeleton />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={`mobile-form-${mode}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4, ease: EASE }}
                  className="relative"
                >
                  <AuthForms mode={mode} onToggle={toggle} oauth={oauth} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Desktop: LEFT = form, RIGHT = branding */}
          <div className="relative hidden min-h-[640px] lg:grid lg:grid-cols-2">
            <div className="relative overflow-hidden bg-card">
              {!ready ? (
                <AuthFormSkeleton />
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`form-${mode}`}
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="relative h-full"
                  >
                    <AuthForms mode={mode} onToggle={toggle} oauth={oauth} />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div className="relative overflow-hidden bg-[#0b1224] text-white">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`brand-${mode}`}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="h-full"
                >
                  <BrandingPanel mode={mode} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
