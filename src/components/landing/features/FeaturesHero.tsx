'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { useAuthHrefs } from '@/components/landing/features/features-ui'

export function FeaturesHero() {
  const ref = useReveal<HTMLElement>()
  const { getStartedHref, practiceHref } = useAuthHrefs()

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--hq-display-blue)_14%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="reveal text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Features
        </div>
        <h1 className="reveal mt-4 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
          The practice toolkit behind every session
        </h1>
        <p className="reveal mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Feedback, scoped questions, analytics, and interview styles—how each capability works and
          what you take away from it.
        </p>
        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={getStartedHref}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--hq-display-blue)] px-6 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/product"
            className="inline-flex h-12 items-center rounded-xl border border-border bg-card/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
          >
            See product inventory
          </Link>
          <Link
            href={practiceHref}
            className="inline-flex h-12 items-center rounded-xl border border-transparent px-4 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Start practicing
          </Link>
        </div>
      </div>
    </section>
  )
}
