'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, ShieldCheck, Zap, Crown } from 'lucide-react'

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

function SparkleIcon({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} style={style} aria-hidden>
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2z" fill="currentColor" />
    </svg>
  )
}

function PricingCard({ plan, yearly }: { plan: Plan; yearly: boolean }) {
  const popular = plan.popular
  const price = yearly && plan.yearlyPrice ? plan.yearlyPrice : plan.monthlyPrice
  const isFree = price === 'Free'
  const Icon = plan.icon

  return (
    <div
      className={[
        'relative rounded-2xl p-5 sm:p-6 flex flex-col transition-all duration-300',
        popular
          ? 'border-2 glow-primary-lg hover:-translate-y-2'
          : 'border hover:border-opacity-60 hover:-translate-y-1',
      ].join(' ')}
      style={{
        background: popular ? 'oklch(0.2 0.06 255 / 0.85)' : 'oklch(0.2 0.05 255 / 0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderColor: popular ? 'oklch(0.72 0.18 230)' : 'oklch(0.72 0.18 230 / 0.2)',
      }}
    >
      {popular && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-60"
          style={{ background: 'radial-gradient(ellipse at top, oklch(0.72 0.18 230 / 0.18), transparent 70%)' }}
        />
      )}

      <div className="relative flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'oklch(0.72 0.18 230 / 0.15)', color: 'oklch(0.72 0.18 230)' }}>
              <Icon className="h-4 w-4" />
            </span>
          )}
          <h3 className="text-base font-semibold text-white">{plan.name}</h3>
        </div>
        {popular && (
          <span
            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full border whitespace-nowrap"
            style={{ background: 'oklch(0.72 0.18 230 / 0.15)', color: 'oklch(0.72 0.18 230)', borderColor: 'oklch(0.72 0.18 230 / 0.5)' }}
          >
            <Sparkles className="h-2.5 w-2.5" /> Most Popular
          </span>
        )}
      </div>

      <div className="relative flex items-end gap-1.5 mt-2">
        <span className="text-3xl sm:text-4xl font-bold text-gradient-pricing leading-none">{price}</span>
        {plan.period && !isFree && <span className="text-xs text-muted-foreground mb-1">{plan.period}</span>}
      </div>
      {yearly && plan.yearlyPrice && (
        <div className="mt-1 text-[10px] text-emerald-400 font-medium">Save 17% with yearly billing</div>
      )}

      <p className="relative mt-2 text-xs text-muted-foreground">{plan.tagline}</p>

      <div className="relative my-4 h-px" style={{ background: 'oklch(0.72 0.18 230 / 0.15)' }} />

      <ul className="relative space-y-2.5 flex-1">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-xs">
            <span
              className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full shrink-0 border"
              style={{ background: 'oklch(0.72 0.18 230 / 0.2)', borderColor: 'oklch(0.72 0.18 230 / 0.5)' }}
            >
              <Check className="h-2.5 w-2.5" style={{ color: 'oklch(0.72 0.18 230)', strokeWidth: 3 }} />
            </span>
            <span className="text-white/95">{f}</span>
          </li>
        ))}
      </ul>

      <Link href={isFree ? '/auth' : '/pricing/checkout'}>
        <button
          className={[
            'relative mt-5 w-full rounded-xl h-10 text-sm font-semibold border-0 transition-all duration-200 btn-micro',
            popular
              ? 'bg-gradient-primary text-white glow-primary hover:opacity-90'
              : 'text-white hover:bg-white/10',
          ].join(' ')}
          style={!popular ? { border: '1px solid oklch(0.72 0.18 230 / 0.4)', background: 'transparent' } : {}}
        >
          {plan.cta}
        </button>
      </Link>
    </div>
  )
}

export function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section className="relative px-4 pt-24 pb-12 bg-grid-pricing">
      <div className="max-w-6xl mx-auto text-center mb-10 relative">
        <SparkleIcon className="hidden sm:block absolute left-[20%] top-2 h-5 w-5 opacity-70" style={{ color: 'oklch(0.72 0.18 230)' }} />
        <SparkleIcon className="hidden sm:block absolute left-[24%] top-10 h-2.5 w-2.5 opacity-50" style={{ color: 'oklch(0.72 0.18 230)' }} />
        <SparkleIcon className="hidden sm:block absolute right-[22%] top-1 h-4 w-4 opacity-70" style={{ color: 'oklch(0.72 0.18 230)' }} />
        <SparkleIcon className="hidden sm:block absolute right-[18%] top-9 h-2.5 w-2.5 opacity-50" style={{ color: 'oklch(0.72 0.18 230)' }} />

        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">
          Choose your <span className="text-gradient-pricing">plan</span>
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          Practice smarter with AI-powered interviews and personalized feedback.
        </p>

        {/* Billing cycle toggle */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-xl border border-border bg-input/20 p-1">
          <button
            onClick={() => setYearly(false)}
            className={[
              'rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 btn-micro',
              !yearly ? 'bg-primary text-white shadow-glow-sm' : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Monthly
          </button>
          <button
            onClick={() => setYearly(true)}
            className={[
              'rounded-lg px-5 py-2 text-sm font-medium transition-all duration-200 btn-micro flex items-center gap-2',
              yearly ? 'bg-primary text-white shadow-glow-sm' : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            Yearly
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400">-17%</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-5 items-stretch">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} yearly={yearly} />
        ))}
      </div>

      <div className="max-w-6xl mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
        <span className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full border"
            style={{ background: 'oklch(0.72 0.18 230 / 0.15)', borderColor: 'oklch(0.72 0.18 230 / 0.4)' }}
          >
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'oklch(0.72 0.18 230)' }} />
          </span>
          Cancel anytime
        </span>
        <span style={{ color: 'oklch(0.72 0.18 230 / 0.6)' }}>•</span>
        <span>Encrypted payments</span>
        <span style={{ color: 'oklch(0.72 0.18 230 / 0.6)' }}>•</span>
        <span>No hidden fees</span>
        <span style={{ color: 'oklch(0.72 0.18 230 / 0.6)' }}>•</span>
        <span>7-day money back guarantee</span>
      </div>
    </section>
  )
}
