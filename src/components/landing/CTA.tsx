'use client'

import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useReveal } from '@/hooks/use-reveal'

type Particle = { left: string; bottom: string; delay: string; duration: string; size: number }

const PARTICLES: Particle[] = [
  { left: '8%', bottom: '18%', delay: '0s', duration: '13s', size: 3 },
  { left: '18%', bottom: '32%', delay: '2.4s', duration: '16s', size: 2 },
  { left: '27%', bottom: '54%', delay: '5.1s', duration: '14s', size: 3 },
  { left: '38%', bottom: '22%', delay: '1.2s', duration: '15s', size: 2 },
  { left: '46%', bottom: '68%', delay: '3.6s', duration: '17s', size: 3 },
  { left: '54%', bottom: '38%', delay: '6.2s', duration: '13s', size: 2 },
  { left: '63%', bottom: '58%', delay: '0.8s', duration: '18s', size: 3 },
  { left: '72%', bottom: '26%', delay: '4.4s', duration: '14s', size: 2 },
  { left: '81%', bottom: '48%', delay: '2.1s', duration: '16s', size: 3 },
  { left: '90%', bottom: '30%', delay: '5.8s', duration: '15s', size: 2 },
]

export function CTA() {
  const ref = useReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      id="contact"
      className="cta-diagonal-section relative overflow-hidden py-28 sm:py-36 lg:py-44"
    >
      <div className="cta-diagonal-plate" aria-hidden />
      <div className="cta-diagonal-mesh" aria-hidden />
      <div className="cta-diagonal-glow-a" aria-hidden />
      <div className="cta-diagonal-glow-b" aria-hidden />
      <div className="cta-diagonal-shine" aria-hidden />
      <div className="cta-diagonal-particles" aria-hidden>
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="cta-diagonal-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="reveal relative mx-auto max-w-3xl px-4 sm:px-6 text-center">
        <span className="cta-diagonal-badge inline-flex items-center rounded-full border px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.14em]">
          Ready when you are
        </span>
        <h2 className="cta-diagonal-title mt-6 text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-[-0.02em] leading-[1.08]">
          Ready to ace your{' '}
          <span className="cta-diagonal-title-accent">next interview?</span>
        </h2>
        <p className="cta-diagonal-body mt-5 max-w-xl mx-auto text-[17px] sm:text-lg leading-[1.55]">
          Start practicing in under a minute. No credit card required.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 px-1 sm:flex-row sm:gap-6">
          <button className="cta-diagonal-btn inline-flex h-14 w-full max-w-md items-center justify-center gap-2 rounded-[10px] px-6 text-[15px] font-semibold sm:w-auto sm:px-10">
            Start Your First Interview
            <ArrowRight className="h-5 w-5" />
          </button>
          <Link
            href="/features"
            className="cta-diagonal-btn-ghost inline-flex h-14 w-full max-w-md items-center justify-center rounded-[10px] px-6 text-[15px] font-semibold sm:w-auto sm:px-10"
          >
            Explore features
          </Link>
        </div>
      </div>
    </section>
  )
}
