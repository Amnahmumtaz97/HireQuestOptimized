'use client'

import Image from 'next/image'
import { Volume2, Brain, CheckCircle2, type LucideIcon } from 'lucide-react'
import { useReveal, useResponsiveColumns, rowRevealDelay } from '@/hooks/use-reveal'

type Analysis = {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  bullets: string[]
  image: {
    src: string
    alt: string
  }
  visual: {
    tone: string
    toneClass: string
    metric: string
    metricClass: string
  }
}

const items: Analysis[] = [
  {
    eyebrow: 'Voice Analysis',
    title: 'Sound as confident as you are.',
    description:
      'Our AI processes your tone, pacing, and vocabulary in real time, providing actionable insights to project absolute confidence and authority.',
    icon: Volume2,
    bullets: ['Pitch modulation tracking', 'Filler word detection', 'Pacing & pause insights'],
    image: {
      src: '/voice-analysis.png',
      alt: 'Voice analysis dashboard preview',
    },
    visual: {
      tone: 'Tone Modulation',
      toneClass: 'border-l-primary text-foreground',
      metric: 'Filler Rate < 1%',
      metricClass: 'border-l-emerald-400 text-emerald-400',
    },
  },
  {
    eyebrow: 'Behavioral Coaching',
    title: 'STAR-perfect answers, every time.',
    description:
      'Simulate complex technical and behavioral interviews tailored to your target companies. The engine adapts to your responses dynamically.',
    icon: Brain,
    bullets: ['Company-specific question banks', 'STAR method structuring', 'Adaptive follow-ups'],
    image: {
      src: '/behavior-analysis.png',
      alt: 'Behavioral STAR analysis preview',
    },
    visual: {
      tone: 'STAR Compliance',
      toneClass: 'border-l-indigo-500 text-indigo-400',
      metric: '2.4x Metric Density',
      metricClass: 'border-l-cyan-400 text-cyan-400',
    },
  },
]

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

      <div className="group/visual relative mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-background/60 p-3 shadow-inner">
        <div
          className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full opacity-80"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--primary) 24%, transparent), transparent 70%)',
            filter: 'blur(34px)',
          }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-20 left-8 h-40 w-56 rounded-full opacity-60"
          style={{
            background:
              'radial-gradient(ellipse, color-mix(in oklab, #06b6d4 15%, transparent), transparent 72%)',
            filter: 'blur(38px)',
          }}
          aria-hidden
        />
        <div
          className="relative flex aspect-[4/3] h-full w-full items-center justify-center overflow-hidden rounded-xl border border-border/80 p-4 sm:p-6"
          style={{
            background:
              'linear-gradient(160deg, color-mix(in oklab, var(--primary) 10%, var(--secondary)) 0%, var(--secondary) 60%, color-mix(in oklab, var(--primary) 6%, var(--secondary)) 100%)',
          }}
        >
          <Image
            src={item.image.src}
            alt={item.image.alt}
            width={560}
            height={350}
            className="relative z-10 h-auto w-full max-w-[420px] object-contain drop-shadow-2xl transition-transform duration-500 group-hover/visual:scale-105"
          />

          <div
            className={[
              'absolute left-3 top-3 z-20 rounded-xl border border-border/80 border-l-4 bg-card/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md sm:left-4 sm:top-4',
              item.visual.toneClass,
            ].join(' ')}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Analysis Signal
            </div>
            <div className="mt-0.5 text-xs font-extrabold sm:text-sm">{item.visual.tone}</div>
          </div>

          <div
            className={[
              'absolute bottom-3 right-3 z-20 rounded-xl border border-border/80 border-l-4 bg-card/90 px-3 py-2 text-xs shadow-xl backdrop-blur-md sm:bottom-4 sm:right-4',
              item.visual.metricClass,
            ].join(' ')}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Live Metric
            </div>
            <div className="mt-0.5 text-xs font-extrabold sm:text-sm">{item.visual.metric}</div>
          </div>
        </div>
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
