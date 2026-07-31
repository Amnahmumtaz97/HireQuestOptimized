'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useReveal } from '@/hooks/use-reveal'

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
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--hq-display-blue)_14%,transparent),transparent_55%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="reveal text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Solutions
        </div>
        <h1 className="reveal mt-4 text-4xl font-extrabold tracking-[-0.03em] text-foreground sm:text-5xl lg:text-6xl">
          Prep paths for the stage you are in
        </h1>
        <p className="reveal mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          HireQuest is used differently by students, career switchers, and working professionals.
          Pick the playbook that matches your situation, then start a session aimed at that outcome.
        </p>
        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
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
    </section>
  )
}
