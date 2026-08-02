'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, ShieldCheck, Zap, Crown } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

type Plan = {
  name: string
  monthlyPrice: string
  yearlyPrice?: string
  period?: string
  tagline: string
  features: string[]
  cta: string
  popular?: boolean
  icon?: typeof Zap
}

const plans: Plan[] = [
  {
    name: 'Starter Plan',
    monthlyPrice: 'Free',
    tagline: 'Perfect to get started with AI interview practice',
    features: [
      '3 mock interviews per week',
      'Up to 5 questions per session',
      'AI-generated interview questions',
      'Basic performance score',
      'Limited session history',
    ],
    cta: 'Get Started',
  },
  {
    name: 'Pro Plan',
    monthlyPrice: 'Rs. 999',
    yearlyPrice: 'Rs. 829',
    period: '/ month',
    tagline: 'For serious preparation and consistent improvement',
    features: [
      'Unlimited mock interviews',
      'Full-length interview sessions',
      'Voice-based interview experience',
      'Detailed AI performance reports',
      'Session history and progress tracking',
      'Role-based and experience-based questions',
    ],
    cta: 'Upgrade Now',
    popular: true,
    icon: Zap,
  },
  {
    name: 'Premium Plan',
    monthlyPrice: 'Rs. 1999',
    yearlyPrice: 'Rs. 1659',
    period: '/ month',
    tagline: 'Advanced preparation and professional-level coaching',
    features: [
      'Everything in Pro',
      'Advanced AI evaluation and feedback',
      'Confidence and tone analysis',
      'Grammar and communication improvement',
      'Personalized improvement suggestions',
      'Resume-based interview practice',
      'Faster AI responses',
      'Complete performance analytics',
    ],
    cta: 'Upgrade Now',
    icon: Crown,
  },
]

function PricingCard({ plan, yearly, delay }: { plan: Plan; yearly: boolean; delay: number }) {
  const popular = plan.popular
  const price = yearly && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice
  const isFree = price === 'Free'
  const Icon = plan.icon

  return (
    <div
      className={[
        'reveal relative flex flex-col rounded-2xl border p-6 sm:p-7 transition-all duration-300',
        popular
          ? 'border-primary/35 bg-card shadow-[0_24px_48px_-28px_rgba(37,99,235,0.45)] ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/25 hover:shadow-[0_16px_36px_-24px_rgba(37,99,235,0.28)]',
      ].join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {popular ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 50% -10%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 70%)',
          }}
          aria-hidden
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-[11px] text-primary"
              style={{ background: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
          ) : null}
          <h3 className="text-[15px] font-bold tracking-[-0.01em] text-foreground">{plan.name}</h3>
        </div>
        {popular ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
            <Sparkles className="h-2.5 w-2.5" /> Most Popular
          </span>
        ) : null}
      </div>

      <div className="relative mt-4 flex items-end gap-1.5">
        <span className="text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl">{price}</span>
        {plan.period && !isFree ? (
          <span className="mb-1 text-xs font-medium text-muted-foreground">{plan.period}</span>
        ) : null}
      </div>
      {yearly && plan.yearlyPrice ? (
        <div className="mt-1.5 text-[11px] font-semibold text-success">
          Save 17% with yearly billing
        </div>
      ) : null}

      <p className="relative mt-2 text-[13px] leading-relaxed text-muted-foreground">{plan.tagline}</p>

      <div className="relative my-5 h-px bg-border" />

      <ul className="relative flex-1 space-y-2.5">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[13px]">
            <span
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'color-mix(in oklab, var(--primary) 14%, transparent)',
                color: 'var(--primary)',
              }}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            <span className="leading-snug text-foreground">{f}</span>
          </li>
        ))}
      </ul>

      <Link href={isFree ? '/auth' : '/pricing/checkout'} className="relative mt-6 block">
        <span
          className={[
            'inline-flex h-11 w-full items-center justify-center rounded-[10px] text-sm font-semibold btn-micro',
            popular ? 'hq-btn-primary' : 'hq-btn-outline',
          ].join(' ')}
        >
          {plan.cta}
        </span>
      </Link>
    </div>
  )
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-24">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -z-0 h-[320px] w-[70%] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.14), transparent 65%)',
          filter: 'blur(80px)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="reveal mx-auto mb-12 max-w-2xl text-center">
          <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-primary">
            Plans & pricing
          </div>
          <h1 className="mt-3.5 text-[2rem] font-extrabold tracking-[-0.02em] leading-[1.15] text-foreground sm:text-[2.5rem]">
            Choose your <span className="text-primary">plan</span>
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            Practice smarter with AI-powered interviews and personalized feedback.
          </p>

          <div className="mt-7 inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)]">
            <button
              type="button"
              onClick={() => setYearly(false)}
              className={[
                'rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 btn-micro',
                !yearly
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
              ].join(' ')}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setYearly(true)}
              className={[
                'rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 btn-micro flex items-center gap-2',
                yearly
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
              ].join(' ')}
            >
              Yearly
              <span className="rounded-full border border-success/30 bg-success-muted px-1.5 py-0.5 text-[9px] font-bold text-success">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} yearly={yearly} delay={i * 80} />
          ))}
        </div>

        <div className="reveal mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:text-sm">
          <span className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-primary"
              style={{ background: 'color-mix(in oklab, var(--primary) 10%, transparent)' }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
            </span>
            Cancel anytime
          </span>
          <span className="text-border">•</span>
          <span>Encrypted payments</span>
          <span className="text-border">•</span>
          <span>No hidden fees</span>
          <span className="text-border">•</span>
          <span>7-day money back guarantee</span>
        </div>
      </div>
    </section>
  )
}
