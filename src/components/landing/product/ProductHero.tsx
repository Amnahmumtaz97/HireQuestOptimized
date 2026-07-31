'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { ConstellationBackground } from '@/components/landing/ConstellationBackground'
import { OVERALL_SCORE, SKILL_BARS } from '@/components/landing/product/product-data'
import {
  ScoreRing,
  SkillMeter,
  useAuthHrefs,
  useInViewOnce,
} from '@/components/landing/product/product-ui'

export function ProductHero() {
  const ref = useReveal<HTMLElement>()
  const { getStartedHref, practiceHref } = useAuthHrefs()
  const { ref: panelRef, inView } = useInViewOnce(0.25)

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <ConstellationBackground
          className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
          intensity={0.35}
        />
        <div className="absolute inset-0 bg-mesh opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--hq-display-blue)_18%,transparent),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <div className="reveal text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Product inventory
          </div>
          <h1 className="reveal mt-3 text-4xl font-extrabold tracking-[-0.03em] leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Sessions, scoring, departments, and progress—wired into one workspace
          </h1>
          <p className="reveal mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            HireQuest includes an interview wizard, live session runner, results reports across four
            scoring dimensions, a multi-department catalog, and analytics for saved practice.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            <Link
              href={getStartedHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--hq-display-blue)] px-6 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={practiceHref}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
            >
              Open interview wizard
            </Link>
          </div>
        </div>

        <div ref={panelRef} className="reveal relative">
          <motion.div
            className="glass-panel relative overflow-hidden rounded-3xl border border-border/60 p-5 sm:p-6 shadow-glow-sm"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Sample report UI
                </div>
                <div className="mt-1 text-lg font-bold text-foreground">Dimension scores</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--hq-display-blue)]/15 px-3 py-1 text-xs font-semibold text-[var(--hq-display-blue)]">
                <Sparkles className="h-3.5 w-3.5" />
                Demo panel
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <ScoreRing value={OVERALL_SCORE} animate={inView} />
              <div className="space-y-3">
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
          </motion.div>
        </div>
      </div>
    </section>
  )
}
