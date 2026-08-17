'use client'

import Link from 'next/link'
import { Award, ArrowRight, Star, ShieldCheck, BadgeCheck } from 'lucide-react'

const HIGHLIGHTS = [
  { icon: Star, text: 'Free & paid credentials' },
  { icon: ShieldCheck, text: 'Verified accuracy' },
  { icon: BadgeCheck, text: 'LinkedIn-friendly' },
]

export function CertificationsHubCard() {
  return (
    <Link
      href="/app/learning-paths/certifications"
      className="group relative block overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-6 transition hover:border-primary/50 hover:shadow-[var(--shadow-elegant)]"
    >
      {/* Decorative glow */}
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-primary/10 blur-2xl"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-start gap-4">
        {/* Icon */}
        <span className="inline-flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
          <Award className="h-6 w-6" />
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground sm:text-xl">Certifications</h2>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
              New
            </span>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Discover industry-recognised credentials to strengthen your portfolio, resume, and
            LinkedIn profile. From free Google and MongoDB exams to AWS and CompTIA certifications —
            find the right credential for your career path.
          </p>

          {/* Highlights */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground"
              >
                <Icon className="h-3 w-3 text-primary" />
                {text}
              </span>
            ))}
          </div>

          <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:underline">
            Browse certifications
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
