'use client'

import { useReveal } from '@/hooks/use-reveal'
import { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'
import { getIndustryIcon } from '@/lib/icon-mapping'
import { HIGHLIGHT_TRACKS } from '@/components/landing/product/product-data'
import { SectionBand, SectionHeading } from '@/components/landing/product/product-ui'

export function ProductCategories() {
  const ref = useReveal<HTMLDivElement>()
  const departments = INTERVIEW_CATALOG_DEPARTMENTS

  return (
    <SectionBand id="categories">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Catalog"
          title="Departments and specializations in the wizard"
          description="One department per interview, then specializations and topics from that catalog entry."
        />

        <div className="mt-10">
          <div className="reveal mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Common tracks
          </div>
          <div className="flex flex-wrap gap-2.5">
            {HIGHLIGHT_TRACKS.map((track, index) => {
              const Icon = track.icon
              return (
                <div
                  key={track.label}
                  className="reveal inline-flex max-w-full flex-col items-start gap-0.5 rounded-full border border-[color-mix(in_oklab,var(--hq-display-blue)_28%,var(--border))] bg-card/70 px-3.5 py-2 text-sm font-semibold text-foreground backdrop-blur-sm sm:flex-row sm:items-center sm:gap-2"
                  style={{ transitionDelay: `${index * 35}ms` }}
                >
                  <Icon className="h-3.5 w-3.5 text-[var(--hq-display-blue)]" strokeWidth={2} />
                  <span>{track.label}</span>
                  <span className="hidden text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:inline">
                    {track.subtitle}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-10">
          <div className="reveal mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Full department list
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {departments.map((department, index) => {
              const icon = getIndustryIcon(department.key)
              const Icon = icon.icon
              const count = department.specializations?.length ?? 0
              return (
                <div
                  key={department.key}
                  className="reveal flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3.5 backdrop-blur-sm"
                  style={{ transitionDelay: `${Math.min(index, 12) * 30}ms` }}
                >
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                    <Icon className="h-5 w-5" strokeWidth={1.85} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-foreground">{department.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {count} specialization{count === 1 ? '' : 's'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </SectionBand>
  )
}
