'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { StarfieldBackground } from '@/components/landing/StarfieldBackground'
import { IsometricIllustration } from '@/components/landing/IsometricIllustration'
import { useAuthHrefs } from '@/components/landing/features/features-ui'

export function FeaturesHero() {
  const ref = useReveal<HTMLElement>()
  const { getStartedHref, practiceHref } = useAuthHrefs()

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
      <StarfieldBackground section />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--hq-display-blue)_14%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
        <div className="text-center lg:text-left">
          <div className="reveal text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Features
          </div>
          <h1 className="reveal mt-4 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            The toolkit behind every HireQuest session
          </h1>
          <p className="reveal mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            AI feedback, interview list, learning paths, certifications, bookmarks, and analytics—how
            each live capability works, and what is still on the roadmap.
          </p>
          <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
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
        <div className="reveal mx-auto w-full max-w-[590px]">
          <IsometricIllustration variant="features" />
        </div>
      </div>
    </section>
  )
}
