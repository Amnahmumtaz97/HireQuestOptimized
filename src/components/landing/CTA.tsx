'use client'

import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

export function CTA() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="contact" className="relative pt-8 pb-20 sm:pt-12 sm:pb-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="reveal relative overflow-hidden rounded-3xl glass-strong p-14 sm:p-20 text-center">
          {/* Background glows */}
          <div
            className="absolute inset-0 opacity-90 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 50% 100%, color-mix(in oklab, var(--primary) 35%, transparent), transparent 70%)',
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 60% 60% at 50% 0%, color-mix(in oklab, var(--accent) 30%, transparent), transparent 70%)',
            }}
            aria-hidden
          />
          <div className="absolute inset-0 grid-bg opacity-60" aria-hidden />

          <div className="relative">
            <span className="inline-flex items-center rounded-full glass px-4 py-1.5 text-sm uppercase tracking-wider text-muted-foreground">
              Ready when you are
            </span>
            <h2 className="mt-5 text-4xl sm:text-6xl font-semibold tracking-tight text-foreground">
              Ready to ace your <span className="text-gradient">next interview?</span>
            </h2>
            <p className="mt-5 max-w-xl mx-auto text-lg text-muted-foreground">
              Start practicing in under a minute. No credit card required.
            </p>

            <div className="mt-10 flex justify-center">
              <button className="inline-flex items-center gap-2 rounded-full h-14 px-10 text-base bg-gradient-primary text-primary-foreground font-semibold animate-glow-pulse hover:scale-[1.04] transition-transform shadow-glow">
                Start Your First Interview
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
