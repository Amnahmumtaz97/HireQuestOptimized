'use client'

import { useReveal } from '@/hooks/use-reveal'

const companies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Adobe']

const stats = [
  { value: '10,000+', label: 'AI-Generated Questions' },
  { value: '10k+', label: 'Mock Interviews Completed' },
  { value: '+24%', label: 'Avg. Readiness Improvement' },
  { value: '3-Level', label: 'Adaptive Difficulty' },
]

type Particle = { left: string; bottom: string; delay: string; duration: string; size: number }

const PARTICLES: Particle[] = [
  { left: '8%', bottom: '18%', delay: '0s', duration: '13s', size: 3 },
  { left: '22%', bottom: '42%', delay: '2.4s', duration: '16s', size: 2 },
  { left: '38%', bottom: '24%', delay: '1.2s', duration: '15s', size: 3 },
  { left: '54%', bottom: '48%', delay: '3.6s', duration: '14s', size: 2 },
  { left: '68%', bottom: '28%', delay: '0.8s', duration: '17s', size: 3 },
  { left: '82%', bottom: '40%', delay: '4.4s', duration: '15s', size: 2 },
]

export function Stats() {
  const ref = useReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      id="stats"
      className="cta-diagonal-section relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-20"
    >
      <div className="cta-diagonal-plate" aria-hidden />
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

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <p className="reveal hq-on-diagonal-muted text-sm font-semibold uppercase tracking-[0.05em] mb-8">
          Practice questions inspired by interviews at leading tech companies
        </p>

        <div className="reveal flex flex-wrap items-center justify-center gap-10 sm:gap-14">
          {companies.map((name) => (
            <span
              key={name}
              className="hq-on-diagonal-company text-xl sm:text-[20px] font-extrabold tracking-[-0.01em]"
            >
              {name}
            </span>
          ))}
        </div>

        <div className="reveal relative mt-14 pt-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="hq-on-diagonal-stat text-[32px] sm:text-[36px] font-extrabold tracking-[-0.02em] leading-none">
                  {stat.value}
                </div>
                <div className="hq-on-diagonal-muted mt-2.5 text-[13px] font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
