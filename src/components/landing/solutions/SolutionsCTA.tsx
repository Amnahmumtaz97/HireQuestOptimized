'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useReveal } from '@/hooks/use-reveal'
import { StarfieldBackground } from '@/components/landing/StarfieldBackground'

export function SolutionsCTA() {
  const ref = useReveal<HTMLElement>()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isAdmin = session?.user?.role === 'admin'
  const startHref = isAuthenticated
    ? isAdmin
      ? '/dashboard'
      : '/app/new-interview'
    : '/auth'

  return (
    <section ref={ref} className="relative isolate overflow-hidden border-t border-border/60 py-20 sm:py-24">
      <StarfieldBackground section />
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--hq-display-blue)_10%,transparent),transparent_68%)]"
        aria-hidden
      />
      <div className="reveal relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
          Pick your path and start a session
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
          Choose an audience playbook above, then open the wizard with a department and mode that
          match your goal.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href={startHref}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[var(--hq-display-blue)] px-8 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Start a session
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
