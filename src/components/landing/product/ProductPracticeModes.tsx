'use client'

import Image from 'next/image'
import { useReveal } from '@/hooks/use-reveal'
import { PRACTICE_MODES } from '@/components/landing/product/product-data'
import { SectionBand, SectionHeading } from '@/components/landing/product/product-ui'

export function ProductPracticeModes() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand id="modes" className="isolate">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <Image
          src="/36226316_v859-katie-12.jpg"
          alt=""
          fill
          sizes="100vw"
          className="hq-section-photo object-cover object-[22%_center] sm:object-left"
        />
        <div className="hq-section-photo-wash" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--background)_35%,transparent),color-mix(in_oklab,var(--background)_78%,transparent)_75%)]" />
      </div>
      <div ref={ref} className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Interview types"
          title="Modes available in the wizard"
          description="Select one mode when configuring a session; mixed combines technical and behavioral prompts."
        />
        {/* Flex + centered wrap keeps the trailing row balanced when the mode
            count is not a multiple of the column count. */}
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {PRACTICE_MODES.map((mode, index) => {
            const Icon = mode.icon
            return (
              <div
                key={mode.title}
                className="reveal relative w-full rounded-2xl border border-border/70 bg-card/85 p-5 backdrop-blur-md sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.667rem)]"
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
