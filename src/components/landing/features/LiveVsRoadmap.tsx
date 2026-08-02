'use client'

import { useReveal } from '@/hooks/use-reveal'
import { CAPABILITY_DIVES } from '@/components/landing/features/features-data'
import { SectionBand, SectionHeading } from '@/components/landing/features/features-ui'

export function LiveVsRoadmap() {
  const ref = useReveal<HTMLDivElement>()
  const live = CAPABILITY_DIVES.filter((c) => c.status === 'live')
  const roadmap = CAPABILITY_DIVES.filter((c) => c.status === 'roadmap')

  return (
    <SectionBand tint id="live-vs-roadmap">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Availability"
          title="Live today vs coming soon"
          description="Clear labels—no fake “available” badges on roadmap work."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="reveal rounded-3xl border border-border/70 bg-card/80 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              Live in the app
            </h3>
            <ul className="mt-5 space-y-3">
              {live.map((item) => (
                <li key={item.title} className="flex gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
                  <span>
                    <span className="font-semibold">{item.title}</span>
                    <span className="mt-0.5 block text-muted-foreground">{item.outcome}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="reveal rounded-3xl border border-dashed border-border/80 bg-card/40 p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Coming soon
            </h3>
            <ul className="mt-5 space-y-3">
              {roadmap.map((item) => (
                <li key={item.title} className="flex gap-3 text-sm text-foreground">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/60" aria-hidden />
                  <span>
                    <span className="font-semibold">{item.title}</span>
                    <span className="mt-0.5 block text-muted-foreground">{item.howItWorks}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionBand>
  )
}
