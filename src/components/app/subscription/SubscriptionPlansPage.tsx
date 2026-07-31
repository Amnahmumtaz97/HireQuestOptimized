'use client'

import { useMemo, useState } from 'react'
import { Check, Crown, Sparkles } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

type Plan = {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  priceMonthly: number | null
  priceYearly: number | null
  blurb: string
  highlight?: boolean
  features: string[]
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    blurb: 'Try the platform and build momentum.',
    features: ['1 interview template', 'Basic question generation', 'Local drafts'],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 9.99,
    priceYearly: 99,
    blurb: 'Best for consistent, serious interview prep.',
    highlight: true,
    features: ['Unlimited interviews', 'Advanced analytics overview', 'Priority generation', 'Exportable reports'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: null,
    priceYearly: null,
    blurb: 'Teams, cohorts, and custom scoring pipelines.',
    features: ['Team workspaces', 'Custom rubrics', 'SSO & audit logs', 'Dedicated support'],
  },
]

export function SubscriptionPlansPage() {
  const [yearly, setYearly] = useState(false)

  const featureMatrix = useMemo(() => {
    const all = new Set<string>()
    for (const p of PLANS) for (const f of p.features) all.add(f)
    return Array.from(all)
  }, [])

  return (
    <div className="animate-fade-up space-y-6">
      <div className="dashboard-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-foreground">Pricing</div>
            <div className="text-xs text-muted-foreground">Toggle billing and upgrade instantly</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={['text-xs font-semibold', yearly ? 'text-muted-foreground' : 'text-foreground'].join(' ')}>Monthly</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={['text-xs font-semibold', yearly ? 'text-foreground' : 'text-muted-foreground'].join(' ')}>Yearly</span>
            {yearly ? (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-emerald-600/25 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" /> Save ~17%
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {PLANS.map((p) => {
            const price = yearly ? p.priceYearly : p.priceMonthly
            const priceLabel = price === null ? 'Custom' : price === 0 ? 'Free' : `$${price}`
            const period = price === null || price === 0 ? '' : yearly ? '/year' : '/month'
            return (
              <div
                key={p.id}
                className={[
                  'relative overflow-hidden rounded-3xl border p-6',
                  p.highlight
                    ? 'border-primary/25 bg-primary/5 shadow-[var(--shadow-card)]'
                    : 'border-border bg-input/10',
                ].join(' ')}
              >
                  {p.highlight ? (
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                    <Crown className="h-3 w-3" /> Popular
                  </span>
                ) : null}

                <div className="text-sm font-semibold text-foreground">{p.name}</div>
                <div className="mt-2 flex items-end gap-2">
                  <div className="text-3xl font-black tracking-tight text-foreground">{priceLabel}</div>
                  <div className="pb-1 text-xs text-muted-foreground">{period}</div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{p.blurb}</div>

                <Separator className="my-5" />

                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-muted-foreground">
                      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-xl bg-input/20 text-[var(--hq-display-blue)]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={[
                    'mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl text-xs font-semibold btn-micro',
                    p.highlight
                      ? 'bg-primary text-white hover:bg-[var(--primary-hover)]'
                      : 'border border-border bg-input/15 text-foreground hover:bg-input/25',
                  ].join(' ')}
                >
                  {p.id === 'free' ? 'Current plan' : p.id === 'enterprise' ? 'Contact sales' : 'Upgrade to Pro'}
                </button>

                {p.highlight ? (
                  <div
                    className="pointer-events-none absolute -inset-1 rounded-[2rem] opacity-25 blur-xl"
                    style={{ background: 'linear-gradient(90deg, rgba(79,110,247,0.85), rgba(37,99,235,0.85))' }}
                    aria-hidden
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      <div className="dashboard-card p-6">
        <div className="text-sm font-semibold text-foreground">Feature comparison</div>
        <div className="mt-1 text-xs text-muted-foreground">A quick matrix for stakeholders</div>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
          <div className="hidden grid-cols-12 gap-3 bg-input/15 px-4 py-3 text-[11px] font-semibold text-muted-foreground md:grid">
            <div className="col-span-6">Feature</div>
            <div className="col-span-2 text-center">Free</div>
            <div className="col-span-2 text-center">Pro</div>
            <div className="col-span-2 text-center">Ent</div>
          </div>
          <div className="divide-y divide-border/60">
            {featureMatrix.map((f) => {
              const has = (planId: Plan['id']) => PLANS.find((p) => p.id === planId)?.features.includes(f)
              return (
                <div key={f} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center md:py-3 text-sm">
                  <div className="md:col-span-6 font-semibold text-foreground md:text-muted-foreground md:font-normal">{f}</div>
                  {(['free', 'pro', 'enterprise'] as const).map((pid, idx) => (
                    <div key={pid} className="md:col-span-2 md:text-center">
                      <span className="font-semibold text-muted-foreground md:hidden">{['Free', 'Pro', 'Ent'][idx]}: </span>
                      {has(pid) ? <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"><Check className="h-4 w-4" /></span> : <span className="text-muted-foreground/50">—</span>}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

