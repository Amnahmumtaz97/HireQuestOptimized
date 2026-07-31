'use client'

import type { ReactNode } from 'react'
import { useReveal, useResponsiveColumns, rowRevealDelay } from '@/hooks/use-reveal'

type FeatureGridProps = {
  items: Array<{
    title: string
    description: string
    icon: ReactNode
  }>
}

export function FeatureGrid({ items }: FeatureGridProps) {
  const ref = useReveal<HTMLElement>()
  const cols = useResponsiveColumns({ base: 1, sm: 2, lg: 3 })

  return (
    <section ref={ref} className="pb-16 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={item.title}
              className="reveal-from-top hover-lift rounded-2xl border border-border bg-card p-7 sm:p-8 transition-all duration-200"
              style={{ transitionDelay: `${rowRevealDelay(index, cols)}ms` }}
            >
              <div
                className="inline-flex h-10 w-10 items-center justify-center rounded-[11px] text-primary"
                style={{ background: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
              >
                {item.icon}
              </div>
              <h2 className="mt-5 text-[16.5px] font-bold text-foreground tracking-[-0.01em]">
                {item.title}
              </h2>
              <p className="mt-2 text-[14px] leading-[1.6] text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
