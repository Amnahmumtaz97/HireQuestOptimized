'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { StarfieldBackground } from '@/components/landing/StarfieldBackground'
import { useAuthHrefs } from '@/components/landing/features/features-ui'

export function FeaturesCTA() {
  const ref = useReveal<HTMLElement>()
  const { practiceHref } = useAuthHrefs()

  return (
    <section ref={ref} className="relative isolate overflow-hidden border-t border-border/60 py-20 sm:py-24">
      <StarfieldBackground section />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--hq-display-blue)_10%,transparent),transparent_68%)]"
        aria-hidden
      />
      <div className="reveal relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
          Explore the toolkit in a live session
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Open the interview wizard and put feedback, scoped questions, and analytics to work on a
          real practice attempt.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={practiceHref}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--hq-display-blue)] px-8 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Start a session
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/product"
            className="inline-flex h-12 items-center rounded-xl border border-border bg-card/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
          >
            Product inventory
          </Link>
          <Link
            href="/solutions"
            className="inline-flex h-12 items-center rounded-xl border border-transparent px-4 text-sm font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Audience paths
          </Link>
        </div>
        <p className="mt-8 text-sm text-muted-foreground">
          Questions about the product?{' '}
          <Link href="/auth" className="font-semibold text-[var(--hq-display-blue)] hover:underline">
            Create an account
          </Link>{' '}
          or review the{' '}
          <Link href="/product" className="font-semibold text-[var(--hq-display-blue)] hover:underline">
            product inventory
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
