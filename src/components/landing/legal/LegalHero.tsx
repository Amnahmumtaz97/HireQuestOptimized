'use client'

import { StarfieldBackground } from '@/components/landing/StarfieldBackground'
import { useReveal } from '@/hooks/use-reveal'
import { LegalSeal } from './LegalSeal'
import type { LegalPageContent } from './types'

type LegalHeroProps = Pick<
  LegalPageContent,
  'eyebrow' | 'title' | 'summary' | 'lastUpdated' | 'chips' | 'sealVariant'
>

export function LegalHero({ eyebrow, title, summary, lastUpdated, chips, sealVariant }: LegalHeroProps) {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className="hq-legal-hero relative isolate overflow-hidden pt-28 sm:pt-32 pb-10 sm:pb-12">
      <StarfieldBackground section overlay />
      <div className="hq-legal-hero-wash pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div className="reveal min-w-0">
            <span className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-sm">
              {eyebrow}
            </span>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl md:text-[2.65rem] md:leading-[1.08]">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Last updated {lastUpdated}
              </span>
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center rounded-full border border-border bg-input/20 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <LegalSeal variant={sealVariant} className="reveal mx-auto lg:mx-0" />
        </div>
      </div>
    </section>
  )
}
