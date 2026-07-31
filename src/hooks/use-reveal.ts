'use client'

import { useEffect, useRef, useState } from 'react'

export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const elements = Array.from(root.querySelectorAll<HTMLElement>('.reveal, .reveal-from-top'))
    if (elements.length === 0) return

    const revealAboveFold = () => {
      const vh = window.innerHeight || 0
      for (const el of elements) {
        const r = el.getBoundingClientRect()
        if (r.top < vh * 1.15) {
          el.classList.add('in-view')
        }
      }
    }
    requestAnimationFrame(() => {
      revealAboveFold()
      window.setTimeout(revealAboveFold, 200)
    })

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' },
    )

    elements.forEach((el) => {
      if (el.classList.contains('in-view')) return
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return ref
}

/** Column count matching Tailwind breakpoints for row-staggered card reveals. */
export function useResponsiveColumns(spec: {
  base?: number
  sm?: number
  md?: number
  lg?: number
  xl?: number
}) {
  const [cols, setCols] = useState(spec.base ?? 1)

  useEffect(() => {
    const compute = () => {
      const w = window.innerWidth
      if (spec.xl != null && w >= 1280) setCols(spec.xl)
      else if (spec.lg != null && w >= 1024) setCols(spec.lg)
      else if (spec.md != null && w >= 768) setCols(spec.md)
      else if (spec.sm != null && w >= 640) setCols(spec.sm)
      else setCols(spec.base ?? 1)
    }
    compute()
    window.addEventListener('resize', compute)
    return () => window.removeEventListener('resize', compute)
  }, [spec.base, spec.sm, spec.md, spec.lg, spec.xl])

  return cols
}

/** Same delay for every card in a row — next row starts later. */
export function rowRevealDelay(index: number, columns: number, rowMs = 420) {
  return Math.floor(index / Math.max(1, columns)) * rowMs
}

export function useCountUp(target: number, durationMs = 1800) {
  const ref = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let started = false

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true
            const start = performance.now()
            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / durationMs)
              const eased = 1 - Math.pow(1 - t, 3)
              const value = Math.floor(eased * target)
              el.textContent = value.toLocaleString()
              if (t < 1) requestAnimationFrame(tick)
              else el.textContent = target.toLocaleString()
            }
            requestAnimationFrame(tick)
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.4 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, durationMs])

  return ref
}
