'use client'

import { useReveal } from '@/hooks/use-reveal'
import { PRACTICE_MODES } from '@/components/landing/product/product-data'
import { SectionBand, SectionHeading } from '@/components/landing/product/product-ui'

export function ProductPracticeModes() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand tint id="modes">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Interview types"
          title="Modes available in the wizard"
          description="Select one mode when configuring a session; mixed combines technical and behavioral prompts."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_MODES.map((mode, index) => {
            const Icon = mode.icon
            return (
              <div
                key={mode.title}
                className="reveal relative rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm"
                style={{ transitionDelay: `${index * 45}ms` }}
              >
                {mode.badge ? (
                  <span className="absolute right-4 top-4 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {mode.badge}
                  </span>
                ) : null}
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{mode.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}
