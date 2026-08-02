'use client'

import {
  X,
  Check,
  Shuffle,
  MessageCircle,
  HelpCircle,
  Target,
  BarChart3,
  GitBranch,
  type LucideIcon,
} from 'lucide-react'
import { useReveal, useResponsiveColumns, rowRevealDelay } from '@/hooks/use-reveal'

type Item = { icon: LucideIcon; title: string; subtitle: string }

const beforeItems: Item[] = [
  {
    icon: Shuffle,
    title: 'Random interview practice',
    subtitle: 'No structure or direction.',
  },
  {
    icon: MessageCircle,
    title: 'No feedback beyond pass or fail',
    subtitle: "You don't learn or improve.",
  },
  {
    icon: HelpCircle,
    title: 'No idea which weaknesses to fix next',
    subtitle: "You're left guessing your next move.",
  },
]

const afterItems: Item[] = [
  {
    icon: Target,
    title: 'Personalized questions',
    subtitle: 'Matched to your target role and goals.',
  },
  {
    icon: BarChart3,
    title: 'AI evaluation on every answer',
    subtitle: 'Detailed feedback that helps you improve.',
  },
  {
    icon: GitBranch,
    title: 'A clear, visible path to improvement',
    subtitle: 'Know your weaknesses and track progress.',
  },
]

type CardTheme = {
  card: string
  border: string
  iconTileBg: string
  iconColor: string
  badgeBorder: string
  badgeBg: string
  badgeIcon: string
  pillBg: string
  pillText: string
  pillBorder: string
}

const beforeTheme: CardTheme = {
  card: 'linear-gradient(180deg, color-mix(in oklab, var(--destructive) 18%, var(--card)) 0%, color-mix(in oklab, var(--destructive) 8%, var(--card)) 100%)',
  border: 'color-mix(in oklab, var(--destructive) 32%, var(--border))',
  iconTileBg: 'var(--destructive-muted)',
  iconColor: 'var(--destructive)',
  badgeBorder: 'color-mix(in oklab, var(--destructive) 55%, transparent)',
  badgeBg: 'var(--card)',
  badgeIcon: 'var(--destructive)',
  pillBg: 'var(--destructive-muted)',
  pillText: 'var(--destructive)',
  pillBorder: 'color-mix(in oklab, var(--destructive) 35%, transparent)',
}

const afterTheme: CardTheme = {
  card: 'linear-gradient(180deg, color-mix(in oklab, var(--success) 22%, var(--card)) 0%, color-mix(in oklab, var(--success) 8%, var(--card)) 100%)',
  border: 'color-mix(in oklab, var(--success) 34%, var(--border))',
  iconTileBg: 'var(--success-muted)',
  iconColor: 'var(--success)',
  badgeBorder: 'color-mix(in oklab, var(--success) 55%, transparent)',
  badgeBg: 'var(--card)',
  badgeIcon: 'var(--success)',
  pillBg: 'var(--success-muted)',
  pillText: 'var(--success)',
  pillBorder: 'color-mix(in oklab, var(--success) 35%, transparent)',
}

function CompareCard({
  theme,
  label,
  headIcon: HeadIcon,
  items,
  delay = 0,
}: {
  theme: CardTheme
  label: 'BEFORE' | 'AFTER'
  headIcon: LucideIcon
  items: Item[]
  delay?: number
}) {
  return (
    <div
      className="reveal-from-top relative rounded-[18px] border pt-12 pb-5 px-4 sm:px-5"
      style={{ background: theme.card, borderColor: theme.border, transitionDelay: `${delay}ms` }}
    >
      {/* Floating circular badge, half above the card */}
      <div
        className="absolute -top-[20px] left-1/2 flex h-[40px] w-[40px] -translate-x-1/2 items-center justify-center rounded-full border-[1.5px]"
        style={{
          background: theme.badgeBg,
          borderColor: theme.badgeBorder,
          boxShadow: `0 8px 18px -10px color-mix(in oklab, ${theme.badgeIcon} 45%, transparent)`,
        }}
      >
        <HeadIcon
          className="h-4.5 w-4.5"
          strokeWidth={2.4}
          style={{ color: theme.badgeIcon }}
        />
      </div>

      {/* Pill label */}
      <div className="flex justify-center">
        <span
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            background: theme.pillBg,
            color: theme.pillText,
            borderColor: theme.pillBorder,
          }}
        >
          {label}
        </span>
      </div>

      <ul className="mt-5 space-y-3.5">
        {items.map((item) => {
          const ItemIcon = item.icon
          return (
            <li key={item.title} className="flex items-start gap-3">
              <span
                className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px]"
                style={{ background: theme.iconTileBg, color: theme.iconColor }}
              >
                <ItemIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-foreground leading-[1.35]">
                  {item.title}
                </div>
                <div className="mt-0.5 text-[12px] leading-[1.5] text-muted-foreground">
                  {item.subtitle}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function Problem() {
  const ref = useReveal<HTMLElement>()
  const cols = useResponsiveColumns({ base: 1, md: 2 })

  return (
    <section
      ref={ref}
      id="problem"
      className="relative overflow-hidden py-24 sm:py-28 scroll-mt-24"
    >
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-[320px] w-[80%] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.16), transparent 65%)',
          filter: 'blur(80px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-1/2 -z-0 h-[280px] w-[280px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.18), transparent 70%)',
          filter: 'blur(90px)',
        }}
        aria-hidden
      />
      <div
        className="section-arc-outline hidden lg:block"
        style={{ left: '-8%', top: '25%', width: '360px', height: '360px', opacity: 0.55 }}
        aria-hidden
      />
      <div
        className="section-arc-outline section-arc-outline--soft hidden lg:block"
        style={{ left: '-3%', top: '30%', width: '260px', height: '260px' }}
        aria-hidden
      />
      <div
        className="section-arc-outline hidden lg:block"
        style={{ right: '-10%', bottom: '10%', width: '320px', height: '320px', opacity: 0.55 }}
        aria-hidden
      />
      <div
        className="section-arc-outline section-arc-outline--soft hidden lg:block"
        style={{ right: '-5%', bottom: '15%', width: '220px', height: '220px' }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto max-w-[720px] text-center mb-14">
          <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">
            The problem
          </div>
          <h2 className="text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-extrabold tracking-[-0.02em] leading-[1.1] text-foreground">
            Most interview prep
            <br className="hidden sm:block" />{' '}
            isn&apos;t actually preparing you
            <span className="text-primary">.</span>
          </h2>
        </div>

        <div className="relative mx-auto grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <CompareCard theme={beforeTheme} label="BEFORE" headIcon={X} items={beforeItems} delay={rowRevealDelay(0, cols)} />
          <CompareCard theme={afterTheme} label="AFTER" headIcon={Check} items={afterItems} delay={rowRevealDelay(1, cols)} />
        </div>
      </div>
    </section>
  )
}
