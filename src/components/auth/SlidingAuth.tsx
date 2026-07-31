'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandingPanel } from './BrandingPanel'
import { AuthForms } from './AuthForms'
import { AuthDecor, AuthFormDecor } from './AuthDecor'

type Mode = 'signin' | 'signup'

const EASE = [0.65, 0, 0.35, 1] as const

export function SlidingAuth() {
  const [mode, setMode] = useState<Mode>('signin')
  const toggle = () => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
      <AuthDecor />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-border bg-card shadow-[0_24px_60px_-32px_rgba(17,24,39,0.28)]">

          {/* Mobile: form only (branding is intentionally hidden to focus signin flow) */}
          <div className="relative flex flex-col overflow-y-auto lg:hidden">
            <AuthFormDecor />
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-form-${mode}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="relative"
              >
                <AuthForms mode={mode} onToggle={toggle} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop: LEFT = form (theme-aware), RIGHT = dark branding */}
          <div className="relative hidden min-h-[640px] lg:grid lg:grid-cols-2">
            <div className="relative overflow-hidden">
              <AuthFormDecor />
              <AnimatePresence mode="wait">
                <motion.div
                  key={`form-${mode}`}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="relative h-full"
                >
                  <AuthForms mode={mode} onToggle={toggle} />
                </motion.div>
              </AnimatePresence>
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
