'use client'

import { Users, FileText, Building2, Star } from 'lucide-react'
import { useReveal, useCountUp } from '@/hooks/use-reveal'

type Stat = {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  suffix: string
  progress: number
  isFloat?: boolean
}

const stats: Stat[] = [
  { icon: Users, label: 'Active Users', value: 10000, suffix: '+', progress: 0.85 },
  { icon: FileText, label: 'Interviews Created', value: 650000, suffix: '+', progress: 0.92 },
  { icon: Building2, label: 'Companies', value: 65, suffix: '+', progress: 0.7 },
  { icon: Star, label: 'Average Rating', value: 48, suffix: '/5', progress: 0.96, isFloat: true },
]

function ProgressRing({ progress, children }: { progress: number; children: React.ReactNode }) {
  const size = 52
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - progress)
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.62 0.21 262)" />
            <stop offset="100%" stopColor="oklch(0.7 0.18 245)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="url(#ringGrad)" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            filter: 'drop-shadow(0 0 6px oklch(0.62 0.21 262 / 0.6))',
            transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center">{children}</span>
    </div>
  )
}

function StatCard({ stat, delay }: { stat: Stat; delay: number }) {
  const Icon = stat.icon
  const countRef = useCountUp(stat.value)

  return (
    <div
      className="reveal hover-lift glass rounded-2xl p-8 group relative overflow-hidden"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className="absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ background: 'color-mix(in oklab, var(--primary) 50%, transparent)' }}
        aria-hidden
      />
      <div className="flex items-center justify-between">
        <ProgressRing progress={stat.progress}>
          <Icon className="h-6 w-6 text-primary-glow" />
        </ProgressRing>
        <span className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          Live
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-live-pulse" />
        </span>
      </div>
      <div className="mt-7">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl sm:text-5xl font-semibold tracking-tight text-gradient">
            {stat.isFloat ? (
              <span>4.8</span>
            ) : (
              <span ref={countRef}>0</span>
            )}
          </span>
          <span className="text-2xl font-medium text-muted-foreground">{stat.suffix}</span>
        </div>
        <p className="mt-2 text-base text-muted-foreground">{stat.label}</p>
      </div>
    </div>
  )
}

export function Stats() {
  const ref = useReveal<HTMLElement>()

  return (
    <section ref={ref} className="relative pt-0 sm:pt-4 pb-20 sm:pb-28" id="stats">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center rounded-full glass px-4 py-1.5 text-sm uppercase tracking-wider text-muted-foreground">
            By the numbers
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight text-foreground">
            Trusted by candidates <span className="text-gradient">worldwide</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            A growing community using HireQuest to land roles at top companies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} delay={i * 80} />
          ))}
        </div>
      </div>
    </section>
  )
}
