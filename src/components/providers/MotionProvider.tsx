"use client"

import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { useReducedMotion } from 'framer-motion'
import {
  HQ_PREFS_EVENT,
  readReduceMotionPreference,
} from '@/lib/preferences/client'

type MotionProviderProps = {
  children: ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  const osReduceMotion = useReducedMotion()
  const [userReduceMotion, setUserReduceMotion] = useState(false)

  useEffect(() => {
    const sync = () => setUserReduceMotion(readReduceMotionPreference())
    sync()
    window.addEventListener(HQ_PREFS_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(HQ_PREFS_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const reduceMotion = Boolean(osReduceMotion) || userReduceMotion

  useEffect(() => {
    document.documentElement.dataset.motion = reduceMotion ? 'reduced' : 'full'
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) {
      return
    }

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.2,
    })

    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = window.requestAnimationFrame(raf)
    }

    frame = window.requestAnimationFrame(raf)

    return () => {
      window.cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [reduceMotion])

  return <>{children}</>
}
