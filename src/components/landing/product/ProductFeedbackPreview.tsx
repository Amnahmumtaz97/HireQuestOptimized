'use client'

import { Check, Target } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { OVERALL_SCORE, SKILL_BARS } from '@/components/landing/product/product-data'
import {
  ScoreRing,
  SectionBand,
  SectionHeading,
  SkillMeter,
  useInViewOnce,
} from '@/components/landing/product/product-ui'

export function ProductFeedbackPreview() {
  const ref = useReveal<HTMLDivElement>()
  const { ref: panelRef, inView } = useInViewOnce(0.3)

  return (
    <SectionBand id="feedback">
      <div ref={ref} className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Results report demo"
          title="Sample layout of a scored session report"
          description="Illustrative UI only—live reports use your own answers and the same dimension layout."
        />
        <div
          ref={panelRef}
          className="reveal mt-12 overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-glow-sm backdrop-blur-sm"
        >
          <div className="border-b border-border/60 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sample report
                </div>
                <h3 className="mt-1 text-xl font-bold text-foreground">
                  Backend Engineering · Mock #12
                </h3>
              </div>
              <div className="rounded-full bg-[var(--hq-display-blue)]/12 px-3 py-1 text-xs font-semibold text-[var(--hq-display-blue)]">
                Overall {OVERALL_SCORE}
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[220px_1fr]">
            <ScoreRing value={OVERALL_SCORE} animate={inView} />
            <div className="space-y-4">
              {SKILL_BARS.map((skill) => (
                <SkillMeter
                  key={skill.label}
                  label={skill.label}
                  value={skill.value}
                  animate={inView}
                />
              ))}
            </div>
          </div>

          <div className="grid gap-4 border-t border-border/60 p-5 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-border/60 bg-[color-mix(in_oklab,var(--hq-display-blue)_6%,transparent)] p-5">
              <div className="text-sm font-bold text-foreground">Strengths</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Good technical explanations
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Strong logical thinking
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <div className="text-sm font-bold text-foreground">Areas to Improve</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Speak more confidently
                </li>
                <li className="flex gap-2">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Give more structured answers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SectionBand>
  )
}
