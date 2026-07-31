'use client'

import { BarChart3, LineChart } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import {
  PROGRESS_STATS,
  SKILL_BARS,
  WEEK_BARS,
} from '@/components/landing/product/product-data'
import {
  SectionBand,
  SectionHeading,
  SkillMeter,
  useInViewOnce,
} from '@/components/landing/product/product-ui'

export function ProductProgressPreview() {
  const ref = useReveal<HTMLDivElement>()
  const { ref: chartRef, inView: animate } = useInViewOnce(0.35)

  return (
    <SectionBand tint id="progress">
      <div ref={ref} className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Analytics preview"
          title="Dashboard widgets for saved practice history"
          description="Sample charts matching the analytics layout—your live data fills these after sessions are saved."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRESS_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="reveal rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.hint}</div>
            </div>
          ))}
        </div>

        <div ref={chartRef} className="reveal mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <LineChart className="h-4 w-4 text-[var(--hq-display-blue)]" />
              <h3 className="text-sm font-bold text-foreground">Weekly activity</h3>
            </div>
            <div className="flex h-40 items-end gap-2 sm:gap-3">
              {WEEK_BARS.map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-32 w-full items-end overflow-hidden rounded-lg bg-border/40">
                    <div
                      className="w-full rounded-lg bg-[var(--hq-display-blue)] transition-[height] duration-700 ease-out"
                      style={{
                        height: animate ? `${value}%` : '0%',
                        transitionDelay: `${index * 70}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--hq-display-blue)]" />
              <h3 className="text-sm font-bold text-foreground">Skills breakdown</h3>
            </div>
            <div className="space-y-4">
              {SKILL_BARS.map((skill) => (
                <SkillMeter
                  key={skill.label}
                  label={skill.label}
                  value={skill.value}
                  animate={animate}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionBand>
  )
}
