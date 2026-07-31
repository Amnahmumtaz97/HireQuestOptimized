'use client'

import { Volume2, Brain, CheckCircle2, Mic, type LucideIcon } from 'lucide-react'
import { useReveal, useResponsiveColumns, rowRevealDelay } from '@/hooks/use-reveal'

type Analysis = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  bullets: string[]
  illustration: 'voice' | 'behavioral'
}

const items: Analysis[] = [
  {
    eyebrow: 'Voice Analysis',
    title: 'Sound as confident as you are.',
    description:
      'Our AI processes your tone, pacing, and vocabulary in real time, providing actionable insights to project absolute confidence and authority.',
    icon: Volume2,
    bullets: ['Pitch modulation tracking', 'Filler word detection', 'Pacing & pause insights'],
    illustration: 'voice',
  },
  {
    eyebrow: 'Behavioral Coaching',
    title: 'STAR-perfect answers, every time.',
    description:
      'Simulate complex technical and behavioral interviews tailored to your target companies. The engine adapts to your responses dynamically.',
    icon: Brain,
    bullets: ['Company-specific question banks', 'STAR method structuring', 'Adaptive follow-ups'],
    illustration: 'behavioral',
  },
]

function VoiceIllustration() {
  const bars = [22, 46, 32, 68, 54, 82, 44, 90, 60, 74, 40, 58, 30, 66, 48, 78, 36, 62, 26, 50]
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6"
      style={{
        background:
          'linear-gradient(160deg, color-mix(in oklab, var(--primary) 10%, var(--secondary)) 0%, var(--secondary) 60%, color-mix(in oklab, var(--primary) 6%, var(--secondary)) 100%)',
      }}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[9px] text-primary"
            style={{ background: 'color-mix(in oklab, var(--primary) 14%, transparent)' }}
          >
            <Mic className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Live capture
            </div>
            <div className="text-[13px] font-bold text-foreground tabular-nums">00:42 / 01:30</div>
          </div>
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold text-primary"
          style={{
            borderColor: 'color-mix(in oklab, var(--primary) 30%, transparent)',
            background: 'color-mix(in oklab, var(--primary) 8%, transparent)',
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Analyzing
        </div>
      </div>

      <div className="relative mt-4 flex flex-1 items-end gap-[3px]">
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${h}%`,
              background:
                i > bars.length * 0.55
                  ? 'color-mix(in oklab, var(--primary) 45%, transparent)'
                  : 'var(--primary)',
              opacity: i > bars.length * 0.72 ? 0.4 : 1,
            }}
          />
        ))}
      </div>

      <div className="relative mt-5 grid grid-cols-3 gap-1.5 sm:gap-2">
        {[
          { label: 'Pitch', value: '124 Hz' },
          { label: 'Pace', value: '148 wpm' },
          { label: 'Fillers', value: '2' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg border px-2 py-1.5 sm:px-3 sm:py-2"
            style={{
              borderColor: 'color-mix(in oklab, var(--primary) 18%, var(--border))',
              background: 'color-mix(in oklab, var(--background) 70%, transparent)',
            }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {m.label}
            </div>
            <div className="mt-0.5 text-[11px] font-bold tabular-nums text-foreground sm:text-[13px]">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BehavioralIllustration() {
  const metrics = [
    { label: 'Situation', value: 92 },
    { label: 'Task', value: 84 },
    { label: 'Action', value: 76 },
    { label: 'Result', value: 88 },
  ]
  return (
    <div
      className="relative flex h-full w-full flex-col justify-between p-5 sm:p-6"
      style={{
        background:
          'linear-gradient(160deg, color-mix(in oklab, var(--primary) 10%, var(--secondary)) 0%, var(--secondary) 60%, color-mix(in oklab, var(--primary) 6%, var(--secondary)) 100%)',
      }}
    >
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[9px] text-primary"
            style={{ background: 'color-mix(in oklab, var(--primary) 14%, transparent)' }}
          >
            <Brain className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              STAR breakdown
            </div>
            <div className="text-[13px] font-bold text-foreground">Response quality</div>
          </div>
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold text-primary tabular-nums"
          style={{
            borderColor: 'color-mix(in oklab, var(--primary) 30%, transparent)',
            background: 'color-mix(in oklab, var(--primary) 8%, transparent)',
          }}
        >
          85 / 100
        </div>
      </div>

      <div className="relative mt-5 space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between text-[11.5px] font-semibold text-foreground">
              <span>{m.label}</span>
              <span className="text-muted-foreground tabular-nums">{m.value}%</span>
            </div>
            <div
              className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: 'color-mix(in oklab, var(--primary) 12%, var(--border))' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${m.value}%`,
                  background:
                    'linear-gradient(90deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 65%, transparent) 100%)',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2">
        {[
          { label: 'Confidence', value: 'High' },
          { label: 'Follow-ups', value: '3 queued' },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg border px-3 py-2"
            style={{
              borderColor: 'color-mix(in oklab, var(--primary) 18%, var(--border))',
              background: 'color-mix(in oklab, var(--background) 70%, transparent)',
            }}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {m.label}
            </div>
            <div className="mt-0.5 text-[13px] font-bold text-foreground">{m.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Card({ item, delay = 0 }: { item: Analysis; delay?: number }) {
  const Icon = item.icon
  return (
    <div
      className="reveal-from-top relative flex h-full flex-col rounded-2xl border p-6 sm:p-8 backdrop-blur-xl"
      style={{
        transitionDelay: `${delay}ms`,
        background: 'color-mix(in oklab, var(--card) 82%, transparent)',
        borderColor: 'color-mix(in oklab, var(--primary) 12%, var(--border))',
        boxShadow: '0 20px 50px -30px color-mix(in oklab, var(--primary) 30%, transparent)',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="inline-flex h-10 w-10 items-center justify-center rounded-[11px] text-primary"
          style={{ background: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.4} />
        </div>
        <span className="text-[12px] font-semibold uppercase tracking-[0.06em] text-primary">
          {item.eyebrow}
        </span>
      </div>

      <h3 className="mt-5 text-[26px] sm:text-[28px] font-extrabold tracking-[-0.02em] leading-[1.15] text-foreground">
        {item.title}
      </h3>

      <p className="mt-3 text-[15px] leading-[1.65] text-muted-foreground">
        {item.description}
      </p>

      <ul className="mt-6 space-y-3">
        {item.bullets.map((b) => (
          <li key={b} className="flex items-center gap-2.5 text-[14px] font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" strokeWidth={1.6} />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-8 relative overflow-hidden rounded-xl border border-border aspect-[16/10]">
        {item.illustration === 'voice' ? <VoiceIllustration /> : <BehavioralIllustration />}
      </div>
    </div>
  )
}

export function AIAnalysis() {
  const ref = useReveal<HTMLElement>()
  const cols = useResponsiveColumns({ base: 1, lg: 2 })

  return (
    <section
      ref={ref}
      id="analysis"
      className="relative overflow-hidden py-24 sm:py-28 scroll-mt-24"
    >
      <div className="section-mesh-blob-a" aria-hidden />
      <div className="section-mesh-blob-b" aria-hidden />
      <div className="section-mesh-blob-c" aria-hidden />
      <div
        className="section-mesh-outline hidden lg:block"
        style={{ left: '6%', top: '16%', width: '300px', height: '300px' }}
        aria-hidden
      />
      <div
        className="section-mesh-outline hidden lg:block"
        style={{ left: '10%', top: '20%', width: '220px', height: '220px', opacity: 0.35 }}
        aria-hidden
      />
      <div
        className="section-mesh-outline hidden lg:block"
        style={{ right: '4%', bottom: '14%', width: '220px', height: '220px' }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto mb-14 max-w-[620px] text-center">
          <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-primary mb-3.5">
            AI Analysis
          </div>
          <h2 className="text-[2rem] sm:text-[2.375rem] font-extrabold tracking-[-0.02em] leading-[1.15] text-foreground">
            Feedback that actually helps you <span className="text-primary">improve</span>.
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.65] text-muted-foreground">
            Two engines, one goal: turn every answer into a coaching moment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {items.map((item, i) => (
            <Card key={item.eyebrow} item={item} delay={rowRevealDelay(i, cols)} />
          ))}
        </div>
      </div>
    </section>
  )
}
