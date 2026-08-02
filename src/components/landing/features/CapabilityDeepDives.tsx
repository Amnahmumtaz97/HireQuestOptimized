'use client'

import { useReveal } from '@/hooks/use-reveal'
import { CAPABILITY_DIVES } from '@/components/landing/features/features-data'
import { SectionBand, SectionHeading } from '@/components/landing/features/features-ui'

export function CapabilityDeepDives() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand tint id="capabilities">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Capability deep-dives"
          title="How each piece of the toolkit works"
          description="Expanded from the landing teaser—mechanics and outcomes, not a feature fan."
        />

        <div className="mt-12 space-y-4">
          {CAPABILITY_DIVES.map((cap, index) => {
            const Icon = cap.icon
            return (
              <article
                key={cap.title}
                className="reveal grid gap-4 rounded-3xl border border-border/70 bg-card/80 p-5 backdrop-blur-sm sm:grid-cols-[auto_1fr] sm:gap-6 sm:p-6"
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">{cap.title}</h3>
                    <span
                      className={[
                        'rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider',
                        cap.status === 'live'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {cap.status === 'live' ? 'Live' : 'Coming soon'}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--hq-display-blue)]">
                        How it works
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {cap.howItWorks}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--hq-display-blue)]">
                        What you leave with
                      </dt>
                      <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {cap.outcome}
                      </dd>
                    </div>
                  </dl>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}
