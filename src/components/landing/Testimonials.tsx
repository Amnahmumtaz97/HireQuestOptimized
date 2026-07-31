'use client'

import { Star } from 'lucide-react'
import { useReveal, useResponsiveColumns, rowRevealDelay } from '@/hooks/use-reveal'

type Testimonial = {
  name: string
  role: string
  goal: string
  initials: string
  color: string
  rating: number
  text: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Sarah Khan',
    role: 'CS Student, LUMS',
    goal: 'Backend Engineering internship',
    initials: 'SK',
    color: '#3B82F6',
    rating: 5,
    text: 'After 2 weeks of practice, I finally understood how to structure my system design answers.',
  },
  {
    name: 'Daniel Ma',
    role: 'Final-year CS Student',
    goal: 'New-grad SWE role',
    initials: 'DM',
    color: '#22C55E',
    rating: 5,
    text: "I practiced the exact question type I got asked three days later. That doesn't happen by luck.",
  },
  {
    name: 'Sara Raza',
    role: 'Software Engineering Student',
    goal: 'Product Engineer role',
    initials: 'SR',
    color: '#F59E0B',
    rating: 5,
    text: "Behavioral prep is usually an afterthought everywhere else. Here it's treated as seriously as the coding round.",
  },
  {
    name: 'Aarav Mehta',
    role: 'Software Engineer @ Stripe',
    goal: 'Landed offer in 3 weeks',
    initials: 'AM',
    color: '#8B5CF6',
    rating: 5,
    text: "HireQuest's mock interviews felt incredibly realistic. The AI feedback pinpointed weaknesses I didn't know I had.",
  },
  {
    name: 'Marcus Chen',
    role: 'Frontend Engineer @ Vercel',
    goal: 'Senior FE role',
    initials: 'MC',
    color: '#06B6D4',
    rating: 5,
    text: 'The specificity of the feedback blew me away. It caught subtle issues in my system design explanations.',
  },
  {
    name: 'Priya Nair',
    role: 'PM @ Notion',
    goal: 'PM role',
    initials: 'PN',
    color: '#EC4899',
    rating: 4,
    text: 'I went from freezing on case prompts to walking in calm. The replay + transcript feature is a quiet superpower.',
  },
]

type StarDot = { left: string; top: string; size: number; delay: string }

const STARS: StarDot[] = [
  { left: '6%', top: '14%', size: 2, delay: '0s' },
  { left: '18%', top: '32%', size: 3, delay: '1.2s' },
  { left: '11%', top: '58%', size: 2, delay: '2.6s' },
  { left: '22%', top: '78%', size: 2, delay: '3.4s' },
  { left: '34%', top: '18%', size: 3, delay: '0.6s' },
  { left: '42%', top: '46%', size: 2, delay: '1.9s' },
  { left: '38%', top: '72%', size: 2, delay: '2.2s' },
  { left: '52%', top: '22%', size: 2, delay: '4.1s' },
  { left: '58%', top: '54%', size: 3, delay: '0.9s' },
  { left: '64%', top: '30%', size: 2, delay: '2.9s' },
  { left: '72%', top: '68%', size: 2, delay: '1.4s' },
  { left: '78%', top: '20%', size: 3, delay: '3.6s' },
  { left: '85%', top: '52%', size: 2, delay: '0.4s' },
  { left: '91%', top: '76%', size: 2, delay: '2.1s' },
  { left: '46%', top: '84%', size: 2, delay: '1.6s' },
]

type Drift = { left: string; bottom: string; delay: string; duration: string }

const DRIFTS: Drift[] = [
  { left: '14%', bottom: '10%', delay: '0s', duration: '15s' },
  { left: '38%', bottom: '30%', delay: '4s', duration: '18s' },
  { left: '62%', bottom: '18%', delay: '2s', duration: '16s' },
  { left: '82%', bottom: '38%', delay: '6s', duration: '17s' },
]

function TCard({ t, delay }: { t: Testimonial; delay: number }) {
  return (
    <article
      className="tst-card reveal-from-top hover-lift flex h-full flex-col rounded-2xl p-7 sm:p-8"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={[
              'h-4 w-4',
              i < t.rating ? 'fill-amber-400 text-amber-400' : 'tst-star-empty',
            ].join(' ')}
          />
        ))}
      </div>

      <p className="tst-body mt-4 flex-1 text-[15px] leading-[1.65]">
        &ldquo;{t.text}&rdquo;
      </p>

      <div className="tst-divider mt-6 pt-5 flex items-center gap-3">
        <div
          className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full text-sm font-bold text-white"
          style={{ background: t.color, boxShadow: `0 0 20px ${t.color}55` }}
          aria-hidden
        >
          {t.initials}
        </div>
        <div className="min-w-0">
          <div className="tst-name text-[14.5px] font-bold truncate">
            {t.name}
          </div>
          <div className="tst-role text-[13px] truncate">{t.role}</div>
          <div className="tst-goal text-[12.5px] font-semibold mt-0.5 truncate">
            Goal: {t.goal}
          </div>
        </div>
      </div>
    </article>
  )
}

export function Testimonials() {
  const ref = useReveal<HTMLElement>()
  const cols = useResponsiveColumns({ base: 1, md: 2, lg: 3 })

  return (
    <section
      ref={ref}
      id="testimonials"
      className="section-nightsky relative overflow-hidden py-24 sm:py-28"
    >
      <div className="section-nightsky-glow-a" aria-hidden />
      <div className="section-nightsky-glow-b" aria-hidden />

      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {STARS.map((s, i) => (
          <span
            key={`s-${i}`}
            className="section-nightsky-star"
            style={{
              left: s.left,
              top: s.top,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
            }}
          />
        ))}
        {DRIFTS.map((d, i) => (
          <span
            key={`d-${i}`}
            className="section-nightsky-drift"
            style={{
              left: d.left,
              bottom: d.bottom,
              animationDelay: d.delay,
              animationDuration: d.duration,
            }}
          />
        ))}
      </div>

      {/* End-of-section circular line doodles */}
      <div
        className="pointer-events-none absolute -right-20 bottom-[-10%] h-80 w-80 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_40%,transparent)] opacity-55"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 bottom-[0%] h-56 w-56 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_28%,transparent)] opacity-45"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-[6%] bottom-[8%] h-32 w-32 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_20%,transparent)] opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-[-14%] h-72 w-72 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_36%,transparent)] opacity-50"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[4%] bottom-[-2%] h-44 w-44 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_24%,transparent)] opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-[14%] bottom-[10%] h-24 w-24 rounded-full border border-[color:color-mix(in_oklab,var(--primary)_18%,transparent)] opacity-35"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto mb-14 max-w-[620px] text-center">
          <div className="tst-eyebrow text-[13px] font-semibold uppercase tracking-[0.06em] mb-3.5">
            Testimonials
          </div>
          <h2 className="tst-heading text-[2rem] sm:text-[2.375rem] font-extrabold tracking-[-0.02em] leading-[1.15]">
            Trusted by students who got the offer.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {testimonials.map((t, i) => (
            <TCard key={t.name} t={t} delay={rowRevealDelay(i, cols)} />
          ))}
        </div>
      </div>
    </section>
  )
}
