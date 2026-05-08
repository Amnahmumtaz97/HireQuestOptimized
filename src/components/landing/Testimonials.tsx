'use client'

import { Star } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

type Testimonial = {
  name: string
  role: string
  initials: string
  rating: number
  title: string
  text: string
  hue: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Aarav Mehta',
    role: 'Software Engineer @ Stripe',
    initials: 'AM',
    rating: 5,
    title: 'Amazing Experience',
    text: "HireQuest's mock interviews felt incredibly realistic. The AI feedback pinpointed weaknesses I didn't know I had — I landed my offer in three weeks.",
    hue: '262',
  },
  {
    name: 'Sofia Lindqvist',
    role: 'Product Designer @ Linear',
    initials: 'SL',
    rating: 5,
    title: 'Genuinely game-changing',
    text: "The behavioral practice with real-time tone analysis is unreal. It's like having a senior coach available at midnight before every interview.",
    hue: '245',
  },
  {
    name: 'Daniel Park',
    role: 'ML Engineer @ Anthropic',
    initials: 'DP',
    rating: 5,
    title: 'Worth every minute',
    text: 'I ran 40+ system design sessions. The structured feedback and follow-up questions were sharper than what I got from human mocks.',
    hue: '230',
  },
  {
    name: 'Priya Nair',
    role: 'PM @ Notion',
    initials: 'PN',
    rating: 4,
    title: 'Confidence on tap',
    text: 'I went from freezing on case prompts to walking in calm. The replay + transcript feature is a quiet superpower.',
    hue: '275',
  },
  {
    name: 'Marcus Chen',
    role: 'Frontend Engineer @ Vercel',
    initials: 'MC',
    rating: 5,
    title: 'Incredible AI feedback',
    text: 'The specificity of the feedback blew me away. It caught subtle issues in my system design explanations that I never would have noticed on my own.',
    hue: '210',
  },
  {
    name: 'Aisha Rahman',
    role: 'Data Scientist @ OpenAI',
    initials: 'AR',
    rating: 5,
    title: 'Best prep tool I have used',
    text: 'I was skeptical at first, but after my first mock session I was hooked. The follow-up questions felt like a real panel interview — I was hired in two rounds.',
    hue: '290',
  },
]

function TCard({
  t,
  compact,
}: {
  t: Testimonial
  compact?: boolean
}) {
  return (
    <article
      className={[
        'glass relative overflow-hidden rounded-2xl p-6 sm:p-8',
        'group border border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.04)_inset]',
        'transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-20px_rgba(59,130,246,0.25)]',
        compact ? 'w-[85vw] max-w-[24rem] min-w-[280px] flex-shrink-0 sm:w-96' : '',
      ].join(' ')}
    >
      <div
        className="absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-0 blur-3xl transition-opacity group-hover:opacity-50"
        style={{ background: `oklch(0.62 0.21 ${t.hue} / 0.6)` }}
        aria-hidden
      />

      <header className="relative flex items-center gap-3 sm:gap-4">
        <div
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-full text-sm font-bold text-foreground glow-ring sm:h-14 sm:w-14 sm:text-base"
          style={{
            background: `linear-gradient(135deg, oklch(0.62 0.21 ${t.hue}), oklch(0.7 0.18 ${Number(t.hue) - 15}))`,
          }}
          aria-hidden
        >
          {t.initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-foreground sm:text-base">{t.name}</div>
          <div className="truncate text-xs text-muted-foreground sm:text-sm">{t.role}</div>
        </div>
        <div className="ml-auto flex flex-shrink-0 items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={[
                'h-4 w-4 sm:h-5 sm:w-5',
                i < t.rating
                  ? 'fill-[oklch(0.85_0.16_85)] text-[oklch(0.85_0.16_85)]'
                  : 'text-muted-foreground/40',
              ].join(' ')}
            />
          ))}
        </div>
      </header>

      <h3 className="relative mt-5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">{t.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{t.text}</p>
    </article>
  )
}

function MarqueeRow({
  testimonials: items,
  reverse,
  ariaHidden,
}: {
  testimonials: Testimonial[]
  reverse?: boolean
  ariaHidden?: boolean
}) {
  return (
    <div
      className={[
        'flex w-max gap-5',
        'animate-testimonials-marquee motion-reduce:animate-none',
        reverse ? '[animation-direction:reverse] [animation-duration:55s]' : '',
        'hover:[animation-play-state:paused]',
      ].join(' ')}
      aria-hidden={ariaHidden}
    >
      <div className="flex gap-5 pr-5">
        {items.map((t, i) => (
          <TCard key={`a-${t.name}-${i}`} t={t} compact />
        ))}
      </div>
      <div className="flex gap-5 pr-5">
        {items.map((t, i) => (
          <TCard key={`b-${t.name}-${i}`} t={t} compact />
        ))}
      </div>
    </div>
  )
}

export function Testimonials() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} id="testimonials" className="relative py-20 sm:py-28">
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, color-mix(in oklab, var(--primary) 60%, transparent), transparent)',
        }}
        aria-hidden
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <span className="inline-flex items-center rounded-full glass px-4 py-1.5 text-sm uppercase tracking-wider text-muted-foreground">
            Testimonials
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Loved by people who got <span className="text-gradient">hired</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Real stories from candidates who used HireQuest to prep — and won.
          </p>
        </div>
      </div>

      {/* Full-bleed marquee — static grid when prefers-reduced-motion */}
      <div className="mx-auto hidden max-w-7xl grid-cols-1 gap-5 px-4 motion-reduce:grid sm:grid-cols-2 lg:px-6">
        {testimonials.map((t) => (
          <TCard key={`static-${t.name}`} t={t} />
        ))}
      </div>

      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen overflow-hidden pb-2 pt-1 motion-reduce:hidden">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[var(--background)] to-transparent sm:w-28"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[var(--background)] to-transparent sm:w-28"
          aria-hidden
        />

        <div className="flex flex-col gap-8">
          <MarqueeRow testimonials={testimonials} />
          <MarqueeRow testimonials={[...testimonials].reverse()} reverse ariaHidden />
        </div>
      </div>
    </section>
  )
}
