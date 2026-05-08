'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrandingPanel } from './BrandingPanel'
import { AuthForms } from './AuthForms'
import { BackgroundFX } from './BackgroundFX'

type Mode = 'signin' | 'signup'

const EASE = [0.65, 0, 0.35, 1] as const

export function SlidingAuth() {
  const [mode, setMode] = useState<Mode>('signin')
  const toggle = () => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-bg">
      <BackgroundFX />

      <div className="relative z-10 flex h-screen items-center justify-center p-3 sm:p-4 lg:p-6">
        <div className="relative h-full max-h-[760px] w-full max-w-6xl overflow-hidden rounded-3xl border glass-panel shadow-elegant">

          {/* Mobile: stacked layout */}
          <div className="flex h-full flex-col overflow-y-auto lg:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-brand-${mode}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="border-b border-white/10"
              >
                <BrandingPanel mode={mode} />
              </motion.div>
            </AnimatePresence>
            <AnimatePresence mode="wait">
              <motion.div
                key={`mobile-form-${mode}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.4, ease: EASE }}
              >
                <AuthForms mode={mode} onToggle={toggle} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Desktop: LEFT = form, RIGHT = branding */}
          <div className="relative hidden h-full lg:grid lg:grid-cols-2">
            {/* Form panel (LEFT) */}
            <div className="relative h-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`form-${mode}`}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  className="h-full"
                >
                  <AuthForms mode={mode} onToggle={toggle} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Branding panel (RIGHT) */}
            <div className="relative h-full overflow-hidden">
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

            {/* Vertical divider glow */}
            <div
              className="pointer-events-none absolute inset-y-8 left-1/2 w-px -translate-x-1/2"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, oklch(0.62 0.21 262 / 0.4), transparent)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
