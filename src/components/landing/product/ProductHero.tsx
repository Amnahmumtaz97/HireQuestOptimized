'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { StarfieldBackground } from '@/components/landing/StarfieldBackground'
import { IsometricIllustration } from '@/components/landing/IsometricIllustration'
import { useAuthHrefs } from '@/components/landing/product/product-ui'

export function ProductHero() {
  const ref = useReveal<HTMLElement>()
  const { getStartedHref, practiceHref } = useAuthHrefs()

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36">
      <StarfieldBackground section />
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        <div className="absolute inset-0 bg-mesh opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--hq-display-blue)_18%,transparent),transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <div className="reveal text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Product inventory
          </div>
          <h1 className="reveal mt-3 text-4xl font-extrabold tracking-[-0.03em] leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Dashboard, interviews, paths, and certs—one workspace
          </h1>
          <p className="reveal mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            HireQuest is the signed-in app: a dashboard for activity, an interview list you can resume,
            learning paths and certifications that match your goal, plus scored results and analytics.
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

        <div className="reveal relative mx-auto w-full max-w-[590px]">
          <IsometricIllustration variant="product" />
        </div>
      </div>
    </section>
  )
}
