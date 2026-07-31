'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useReveal } from '@/hooks/use-reveal'
import { AUDIENCE_PLAYBOOKS } from '@/components/landing/solutions/solutions-data'

export function AudiencePlaybooks() {
  const ref = useReveal<HTMLElement>()
  const { status } = useSession()
  const href = status === 'authenticated' ? '/app/new-interview' : '/auth'

  return (
    <section
      ref={ref}
      id="playbooks"
      className="relative scroll-mt-24 overflow-hidden bg-[color-mix(in_oklab,var(--hq-display-blue)_6%,var(--background))] py-20 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <span className="reveal inline-flex items-center rounded-full border border-border/70 bg-card/50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Audience playbooks
          </span>
          <h2 className="reveal mt-4 text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl">
            Three situations HireQuest is built around
          </h2>
          <p className="reveal mt-4 text-base text-muted-foreground sm:text-lg">
            Each path starts from your context—not a generic feature tour.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {AUDIENCE_PLAYBOOKS.map((book, index) => {
            const Icon = book.icon
            return (
              <article
                key={book.title}
                className="reveal flex flex-col rounded-3xl border border-border/70 bg-card/80 p-6 backdrop-blur-sm"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-foreground">{book.title}</h3>
                <dl className="mt-5 space-y-4 text-sm leading-relaxed">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--hq-display-blue)]">
                      Situation
                    </dt>
                    <dd className="mt-1 text-muted-foreground">{book.situation}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--hq-display-blue)]">
                      What you practice
                    </dt>
                    <dd className="mt-1 text-muted-foreground">{book.practice}</dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-[var(--hq-display-blue)]">
                      Outcome
                    </dt>
                    <dd className="mt-1 text-muted-foreground">{book.outcome}</dd>
                  </div>
                </dl>
                <Link
                  href={href}
                  className="inline-flex min-h-10 items-center py-2 text-sm font-semibold text-[var(--hq-display-blue)] hover:underline"
                >
                  Start this path
                </Link>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
