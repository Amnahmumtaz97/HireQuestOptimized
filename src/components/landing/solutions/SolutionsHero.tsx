'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useReveal } from '@/hooks/use-reveal'
import { StarfieldBackground } from '@/components/landing/StarfieldBackground'
import { IsometricIllustration } from '@/components/landing/IsometricIllustration'

function useSolutionsHrefs() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isAdmin = session?.user?.role === 'admin'
  return {
    startHref: isAuthenticated
      ? isAdmin
        ? '/dashboard'
        : '/app/new-interview'
      : '/auth',
    productHref: '/product',
  }
}

export function SolutionsHero() {
  const ref = useReveal<HTMLElement>()
  const { startHref, productHref } = useSolutionsHrefs()

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
      <StarfieldBackground section />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--hq-display-blue)_14%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <div className="text-center lg:order-2 lg:text-left">
          <div className="reveal text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Solutions
          </div>
          <h1 className="reveal mt-4 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
            Prep paths for the stage you are in
          </h1>
          <p className="reveal mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg lg:mx-0">
            Students, career switchers, and working professionals use the same workspace differently:
            dashboard, interviews, learning paths, and certifications aimed at that outcome.
          </p>
          <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href={startHref}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--hq-display-blue)] px-6 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Start a session
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={productHref}
              className="inline-flex h-12 items-center rounded-xl border border-border bg-card/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
            >
              See product inventory
            </Link>
          </div>
        </div>
        <div className="reveal mx-auto w-full max-w-[590px] lg:order-1">
          <IsometricIllustration variant="solutions" />
        </div>
      </div>
    </section>
  )
}
