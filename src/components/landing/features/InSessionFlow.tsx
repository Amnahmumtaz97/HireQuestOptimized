'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { SESSION_FLOW } from '@/components/landing/features/features-data'
import { SectionBand, SectionHeading } from '@/components/landing/features/features-ui'

export function InSessionFlow() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand id="in-session" className="isolate">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src="/15292731_5576407.jpg"
          alt=""
          fill
          sizes="100vw"
          className="hq-section-photo object-cover object-center"
        />
        <div className="hq-section-photo-wash" />
      </div>
      <div ref={ref} className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="In a session"
          title="Where capabilities show up"
          description="A compact practice loop—not a six-step onboarding orbit."
        />

        {/* One column per step on large screens so the loop reads as a single
            left-to-right sequence; the trailing card fills the row below sm. */}
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SESSION_FLOW.map((step, index) => {
            const Icon = step.icon
            const isLast = index === SESSION_FLOW.length - 1
            const fillsRow = isLast && SESSION_FLOW.length % 2 === 1
            return (
              <li
                key={step.title}
                className={`reveal relative rounded-3xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm ${
                  fillsRow ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--hq-display-blue)]/15 text-xs font-bold text-[var(--hq-display-blue)]">
                    {index + 1}
                  </span>
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/10 text-[var(--hq-display-blue)]">
                    <Icon className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                {step.href && step.linkLabel ? (
                  <Link
                    href={step.href}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[var(--hq-display-blue)] hover:underline"
                  >
                    {step.linkLabel}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </li>
            )
          })}
        </ol>
      </div>
    </SectionBand>
  )
}
