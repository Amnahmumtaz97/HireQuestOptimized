'use client'

import React, { useState } from 'react'
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
  icon?: React.FC<{ className?: string }>
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
        'reveal relative flex flex-col rounded-3xl p-6 sm:p-7 transition-all duration-300',
        popular
          ? 'glass-strong shimmer-border glow-ring-strong hover-lift'
          : 'glass hover-lift border border-white/10',
      ].join(' ')}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {popular && (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-90"
          style={{
            background:
              'radial-gradient(ellipse 70% 80% at 50% 0%, color-mix(in oklab, var(--primary) 28%, transparent), transparent 72%)',
          }}
          aria-hidden
        />
      )}

      <div className="relative flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-primary glow-ring text-primary-foreground">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
        </div>
        {popular && (
          <span className="inline-flex items-center gap-1 rounded-full glass px-2.5 py-1 text-[10px] font-medium text-muted-foreground border border-white/10 whitespace-nowrap">
            <Sparkles className="h-2.5 w-2.5 text-primary-glow" /> Most Popular
          </span>
        )}
      </div>

      <div className="relative flex items-end gap-1.5 mt-3">
        <span className="text-3xl sm:text-4xl font-bold text-gradient leading-none">{price}</span>
        {plan.period && !isFree && (
          <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>
        )}
      </div>
      {yearly && plan.yearlyPrice && (
        <div className="mt-1 text-[10px] text-emerald-400 font-medium">Save 17% with yearly billing</div>
      )}

      <p className="relative mt-2 text-xs text-muted-foreground">{plan.tagline}</p>

      <div className="relative my-5 h-px bg-white/10" />

      <ul className="relative space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-xs">
            <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full shrink-0 bg-primary/20 border border-primary/40">
              <Check className="h-2.5 w-2.5 text-primary-glow" strokeWidth={3} />
            </span>
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>

      <Link href={isFree ? '/auth' : '/pricing/checkout'}>
        <button
          className={[
            'relative mt-6 w-full rounded-[10px] h-11 text-sm font-semibold transition-all duration-200 btn-micro',
            popular ? 'hq-btn-primary' : 'hq-btn-outline',
          ].join(' ')}
        >
          {plan.cta}
        </button>
      </Link>
    </div>
  )
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className="relative pt-28 sm:pt-32 pb-16 sm:pb-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="reveal text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center rounded-full glass px-4 py-1.5 text-sm uppercase tracking-wider text-muted-foreground">
            Plans & pricing
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl font-semibold tracking-tight text-foreground">
            Choose your <span className="text-gradient">plan</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            Practice smarter with AI-powered interviews and personalized feedback.
          </p>

          <div className="mt-6 inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1">
            <button
              onClick={() => setYearly(false)}
              className={[
                'rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 btn-micro',
                !yearly
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-[var(--secondary)]',
              ].join(' ')}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={[
                'rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 btn-micro flex items-center gap-2',
                yearly
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-[var(--secondary)]',
              ].join(' ')}
            >
              Yearly
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                -17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 items-stretch">
          {plans.map((plan, i) => (
            <PricingCard key={plan.name} plan={plan} yearly={yearly} delay={i * 80} />
          ))}
        </div>

        <div className="reveal mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full glass border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-primary-glow" />
            </span>
            Cancel anytime
          </span>
          <span className="text-muted-foreground/50">•</span>
          <span>Encrypted payments</span>
          <span className="text-muted-foreground/50">•</span>
          <span>No hidden fees</span>
          <span className="text-muted-foreground/50">•</span>
          <span>7-day money back guarantee</span>
        </div>
      </div>
    </section>
  )
}
