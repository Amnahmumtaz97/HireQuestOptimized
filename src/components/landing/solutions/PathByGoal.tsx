'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { PATH_BY_GOAL } from '@/components/landing/solutions/solutions-data'

export function PathByGoal() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="goals" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="reveal inline-flex items-center rounded-full border border-border/70 bg-card/50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Path by goal
          </span>
          <h2 className="reveal mt-4 text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
            Choose an outcome, then jump to the right product area
          </h2>
          <p className="reveal mt-4 text-base text-muted-foreground sm:text-lg">
            Short goal rows—not a step-by-step process diagram.
          </p>
        </div>

        <ul className="mt-12 space-y-3">
          {PATH_BY_GOAL.map((goal, index) => {
            const Icon = goal.icon
            return (
              <li
                key={goal.title}
                className="reveal flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/70 p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-5 sm:py-4"
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-foreground sm:text-base">{goal.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{goal.detail}</p>
                  </div>
                </div>
                <Link
                  href={goal.href}
                  className="inline-flex min-h-10 shrink-0 items-center gap-1 py-2 text-sm font-semibold text-[var(--hq-display-blue)] hover:underline sm:pr-1"
                >
                  {goal.linkLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
