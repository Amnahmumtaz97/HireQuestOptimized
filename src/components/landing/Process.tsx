'use client'

import type { CSSProperties } from 'react'
import {
  type LucideIcon,
  FilePenLine,
  ClipboardList,
  Headphones,
  BarChart3,
  TrendingUp,
  Boxes,
} from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

type Step = {
  icon: LucideIcon
  number: number
  title: string
  description: string
  accent: string
  ringColor: string
  glowShadow: string
  orbitAngle: string
  counterAngle: string
  connector: { x: number; y: number; color: string }
}

const steps: Step[] = [
  {
    icon: FilePenLine,
    number: 1,
    title: 'Create Interview',
    description: 'Input your target job description and specific requirements to train your AI interviewer.',
    accent: 'process-accent-sky',
    ringColor: 'process-ring-sky',
    glowShadow: 'process-glow-sky',
    orbitAngle: '0deg',
    counterAngle: '0deg',
    connector: { x: 50, y: 8, color: 'var(--process-spoke-sky)' },
  },
  {
    icon: ClipboardList,
    number: 2,
    title: 'Select & Prepare',
    description: 'Choose from technical, behavioral, or mixed tracks. Review AI-curated prep material.',
    accent: 'process-accent-violet',
    ringColor: 'process-ring-violet',
    glowShadow: 'process-glow-violet',
    orbitAngle: '72deg',
    counterAngle: '-72deg',
    connector: { x: 90, y: 37, color: 'var(--process-spoke-violet)' },
  },
  {
    icon: Headphones,
    number: 3,
    title: 'AI Interview Session',
    description: 'Engage in a live, voice-interactive session with our adaptive AI personality.',
    accent: 'process-accent-teal',
    ringColor: 'process-ring-teal',
    glowShadow: 'process-glow-teal',
    orbitAngle: '144deg',
    counterAngle: '-144deg',
    connector: { x: 75, y: 84, color: 'var(--process-spoke-teal)' },
  },
  {
    icon: BarChart3,
    number: 4,
    title: 'Get Detailed Feedback',
    description: 'Receive line-by-line scoring on content, tone, structure, and body language.',
    accent: 'process-accent-amber',
    ringColor: 'process-ring-amber',
    glowShadow: 'process-glow-amber',
    orbitAngle: '216deg',
    counterAngle: '-216deg',
    connector: { x: 25, y: 84, color: 'var(--process-spoke-amber)' },
  },
  {
    icon: TrendingUp,
    number: 5,
    title: 'Track & Improve',
    description: 'Monitor your progress over time with our performance dashboard and trend reports.',
    accent: 'process-accent-fuchsia',
    ringColor: 'process-ring-fuchsia',
    glowShadow: 'process-glow-fuchsia',
    orbitAngle: '288deg',
    counterAngle: '-288deg',
    connector: { x: 10, y: 37, color: 'var(--process-spoke-fuchsia)' },
  },
]

function StepCard({ step }: { step: Step }) {
  const Icon = step.icon
  const active =
    'group-hover/step:opacity-100 group-hover/step:scale-100 group-hover/step:translate-y-0 group-has-[.hq-core:hover]/orbit:opacity-100 group-has-[.hq-core:hover]/orbit:scale-100 group-has-[.hq-core:hover]/orbit:translate-y-0'
  const inactive =
    'group-hover/step:opacity-0 group-hover/step:scale-90 group-hover/step:-translate-y-1 group-has-[.hq-core:hover]/orbit:opacity-0 group-has-[.hq-core:hover]/orbit:scale-90 group-has-[.hq-core:hover]/orbit:-translate-y-1'

  return (
    <div
      className="absolute left-1/2 top-1/2 z-10"
      style={{
        transform: `rotate(${step.orbitAngle}) translateY(calc(-1 * var(--orbit-radius))) rotate(${step.counterAngle})`,
      }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <div className="group/step relative">
          <div
            className={`process-step-card reveal relative aspect-square w-[var(--step-size)] cursor-default overflow-hidden rounded-full border transition-all duration-300 ease-&lsqb;cubic-bezier(0.22,1,0.36,1)&rsqb; group-hover/step:z-20 group-hover/step:scale-[1.06] group-has-[.hq-core:hover]/orbit:z-20 group-has-[.hq-core:hover]/orbit:scale-[1.06] ${step.ringColor}`}
            style={{ transitionDelay: '80ms' }}
          >
            <div className="process-step-shine absolute inset-[3px] rounded-full" />
            <div
              className={`absolute inset-0 rounded-full bg-current opacity-0 transition-opacity duration-500 group-hover/step:opacity-[0.07] group-has-[.hq-core:hover]/orbit:opacity-[0.07] ${step.accent}`}
            />

            {/* Front — number + title */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-1 px-2.5 text-center transition-all duration-500 ease-&lsqb;cubic-bezier(0.22,1,0.36,1)&rsqb; ${inactive}`}
            >
              <span className={`text-[clamp(1.05rem,2.2vw,1.4rem)] font-black leading-none ${step.accent}`}>
                {String(step.number).padStart(2, '0')}
              </span>
              <h3 className="max-w-[88%] text-[clamp(0.55rem,1.2vw,0.75rem)] font-bold leading-tight text-foreground">
                {step.title}
              </h3>
            </div>

            {/* Back — icon + description */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-3 py-2 text-center opacity-0 scale-95 translate-y-1 transition-all duration-500 ease-&lsqb;cubic-bezier(0.22,1,0.36,1)&rsqb; ${active}`}
            >
              <div className={`grid h-8 w-8 place-items-center rounded-full border bg-current/10 ${step.accent} border-current/40`}>
                <Icon className="h-4 w-4" strokeWidth={2.2} />
              </div>
              <p className="text-[clamp(0.5rem,0.95vw,0.62rem)] font-medium leading-snug text-muted-foreground">
                {step.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileStepCard({ step }: { step: Step }) {
  const Icon = step.icon

  return (
    <div
      className="process-mobile-card reveal-from-top relative z-10 overflow-hidden rounded-2xl border p-5"
      style={{ transitionDelay: '80ms' }}
    >
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <span className={`text-3xl font-black leading-none ${step.accent}`}>
            {String(step.number).padStart(2, '0')}
          </span>
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full border bg-current/10 ${step.accent} border-current/60`}>
            <Icon className="h-6 w-6" strokeWidth={2.2} />
          </div>
        </div>
        <h3 className="mt-4 text-lg font-extrabold tracking-tight text-foreground">
          {step.title}
        </h3>
        <p className="mt-3 text-sm font-medium leading-relaxed text-muted-foreground">
          {step.description}
        </p>
      </div>
    </div>
  )
}

export function Process() {
  const ref = useReveal<HTMLElement>()

  const orbitPoints = steps.map((s) => ({ x: s.connector.x, y: s.connector.y, color: s.connector.color }))

  return (
    <section
      ref={ref}
      id="solutions"
      className="relative min-h-[100svh] overflow-hidden scroll-mt-24 py-24 sm:scroll-mt-28 sm:py-28"
    >
      <div
        className="pointer-events-none absolute -top-20 left-1/2 h-[340px] w-[72%] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.3), transparent 65%)',
          filter: 'blur(95px)',
          zIndex: 0,
        }}
        aria-hidden
      />
      <div className="relative z-[1] mx-auto flex min-h-[100svh] max-w-7xl flex-col px-4 sm:px-6">
        <div className="reveal z-30 mx-auto max-w-[720px] shrink-0 pb-10 pt-0 text-center sm:pb-12 md:pb-14">
          <div className="text-[13px] font-semibold uppercase tracking-[0.12em] text-primary mb-4">
            How it works
          </div>
          <h2 className="text-[2rem] sm:text-[2.5rem] lg:text-[2.75rem] font-extrabold tracking-[-0.02em] leading-[1.1] text-foreground">
            Your <span className="text-primary">pathway</span> to interview success
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.65] text-muted-foreground max-w-2xl mx-auto">
            Your journey to mastery, orchestrated by our central intelligence core.
          </p>
        </div>

        {/* Desktop orbit */}
        <div className="relative mx-auto mt-4 hidden w-full flex-1 overflow-visible px-6 pb-6 md:block lg:px-10">
          <div
            className="process-orbit group/orbit relative mx-auto aspect-square w-full max-w-[min(82vw,40rem)] overflow-visible"
            style={{
              '--step-size': 'clamp(6.25rem, 15vw, 8.75rem)',
              '--core-size': 'clamp(7.25rem, 16.5vw, 10.5rem)',
              '--orbit-radius': 'clamp(10.5rem, min(36vw, 34vh), 17.5rem)',
              '--orbit-diameter': 'calc(var(--orbit-radius) * 2)',
            } as CSSProperties}
          >
            <svg
              className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[var(--orbit-diameter)] w-[var(--orbit-diameter)] -translate-x-1/2 -translate-y-1/2"
              viewBox="0 0 100 100"
              fill="none"
              aria-hidden="true"
            >
              {/* Outer dashed ring through step centres */}
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="var(--process-orbit-ring)"
                strokeWidth="0.38"
                strokeDasharray="1.5 2"
              />

              {/* Radial spokes from HQ Core */}
              {orbitPoints.map((pt, i) => (
                <line
                  key={`spoke-${i}`}
                  x1="50"
                  y1="50"
                  x2={pt.x}
                  y2={pt.y}
                  stroke={pt.color}
                  strokeWidth="0.28"
                  strokeDasharray="1.2 1.8"
                  opacity="0.9"
                />
              ))}

              {/* Neighbour links between steps */}
              {orbitPoints.map((pt, i) => {
                const next = orbitPoints[(i + 1) % orbitPoints.length]
                return (
                  <line
                    key={`link-${i}`}
                    x1={pt.x}
                    y1={pt.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="var(--process-orbit-link)"
                    strokeWidth="0.26"
                    strokeDasharray="1.2 1.8"
                  />
                )
              })}

              {/* Glowing dots on orbit */}
              {orbitPoints.map((pt, i) => (
                <circle
                  key={`dot-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="0.9"
                  fill={pt.color}
                  opacity="1"
                />
              ))}
            </svg>

            {/* HQ Core — centred hub */}
            <div className="hq-core absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2 cursor-pointer">
              <div className="process-core-card reveal grid aspect-square w-[var(--core-size)] place-items-center rounded-full border-2 border-primary transition-transform duration-300 hover:scale-105">
                <div className="relative flex flex-col items-center gap-1.5 px-2 text-center">
                  <Boxes className="process-core-icon h-[clamp(1.5rem,3.8vw,2.4rem)] w-[clamp(1.5rem,3.8vw,2.4rem)]" strokeWidth={1.6} />
                  <span className="text-[clamp(0.5rem,1.2vw,0.75rem)] font-extrabold uppercase tracking-[0.14em] text-foreground">
                    HQ Core
                  </span>
                </div>
              </div>
            </div>

            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </div>

        </div>

        {/* Mobile */}
        <div className="mt-8 flex flex-1 flex-col items-center gap-6 pb-8 md:hidden">
          <div className="process-core-card reveal grid aspect-square w-28 place-items-center rounded-full border-2 border-primary">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Boxes className="process-core-icon h-9 w-9" strokeWidth={1.6} />
              <span className="text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-foreground">HQ Core</span>
            </div>
          </div>
          <div className="grid w-full gap-4">
          {steps.map((step) => (
            <MobileStepCard key={step.number} step={step} />
          ))}
          </div>
        </div>

        <div className="reveal z-30 shrink-0 pb-8 text-center sm:pb-10" style={{ transitionDelay: '400ms' }}>
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-3">
            <button className="hq-btn-primary h-11 sm:h-12 px-6 sm:px-8 text-sm">
              Start Free Trial
            </button>
            <button className="hq-btn-outline h-11 sm:h-12 px-6 sm:px-8 text-sm">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
