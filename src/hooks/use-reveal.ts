'use client'

import { useEffect, useRef } from 'react'

export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return

    const elements = Array.from(root.querySelectorAll<HTMLElement>('.reveal'))
    if (elements.length === 0) return

    // If elements are already within the viewport on first paint (above-the-fold),
    // reveal immediately. We run this after the next paint to avoid timing issues
    // (fonts/layout settling) that can otherwise leave sections invisible until scroll.
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
      // One extra pass shortly after for late layout shifts.
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
