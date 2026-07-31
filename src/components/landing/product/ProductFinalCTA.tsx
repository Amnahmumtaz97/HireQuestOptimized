'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { useAuthHrefs } from '@/components/landing/product/product-ui'

export function ProductFinalCTA() {
  const ref = useReveal<HTMLElement>()
  const { practiceHref } = useAuthHrefs()

  return (
    <section ref={ref} className="relative overflow-hidden border-t border-border/60 py-20 sm:py-24">
      <div
        className="pointer-events-none absolute inset-0 bg-[color-mix(in_oklab,var(--hq-display-blue)_5%,var(--background))]"
        aria-hidden
      />
      <div className="reveal relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
          Open the interview wizard
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Configure a department, mode, and topics, then generate your next practice session.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={practiceHref}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--hq-display-blue)] px-8 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Start configuration
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
