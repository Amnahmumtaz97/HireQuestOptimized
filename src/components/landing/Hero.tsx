"use client"

import {
  ArrowRight,
  BadgeCheck,
  Clock3,
  Mic,
  MessageSquareMore,
  Play,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import { useReveal } from '@/hooks/use-reveal'

function FloatingCard({
  title,
  value,
  hint,
  className = '',
  style,
}: {
  title: string
  value: string
  hint: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={['glass-strong rounded-xl px-4 py-3 min-w-[170px]', className].join(' ')}
      style={style}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold text-gradient">{value}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground/80">{hint}</div>
    </div>
  )
}

function PracticeChip({
  icon: Icon,
  title,
  detail,
  className = '',
  delay = '0ms',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  detail: string
  className?: string
  delay?: string
}) {
  return (
    <div
      className={[
        'glass rounded-2xl border border-border/30 p-3 flex items-center gap-3 hover-lift animate-fade-up',
        className,
      ].join(' ')}
      style={{ animationDelay: delay }}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary/20 text-primary-glow shadow-glow-sm">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{detail}</div>
      </div>
    </div>
  )
}

export function Hero() {
  const ref = useReveal<HTMLElement>()

  return (
    <section
      id="home"
      ref={ref}
      className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28"
    >
      {/* Background layers (mesh/grid kept; large radial wash removed) */}
      <div className="absolute inset-0 bg-mesh pointer-events-none" aria-hidden />
      <div className="absolute inset-0 grid-bg pointer-events-none" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="max-w-2xl text-left">
          <div className="reveal inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            <span>New onboarding experience</span>
          </div>

          <h1
            className="reveal mt-6 text-4xl font-semibold tracking-tight leading-[1.02] text-foreground sm:text-6xl lg:text-7xl"
            style={{ transitionDelay: '80ms' }}
          >
            Your{' '}
            <span className="relative inline-block">
              <span className="text-gradient">Shortcut</span>
              <span
                className="absolute -inset-x-2 -inset-y-1 -z-10 rounded-2xl blur-2xl opacity-60"
                style={{
                  background:
                    'linear-gradient(120deg, color-mix(in oklab, var(--primary) 50%, transparent), color-mix(in oklab, var(--primary-glow) 40%, transparent))',
                }}
                aria-hidden
              />
            </span>{' '}
            to Interview
            <br className="hidden sm:block" /> Success
          </h1>

          <p
            className="reveal mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            style={{ transitionDelay: '160ms' }}
          >
            AI-powered interview preparation made simple and effective. Practice with realistic mock
            interviews, get instant feedback, and land your dream role.
          </p>

          <div
            className="reveal mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ transitionDelay: '240ms' }}
          >
            <Link
              href="/app/new-interview"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-primary px-7 text-sm font-semibold text-foreground shadow-[0_0_30px_-6px_var(--primary)] transition-all hover:scale-[1.03] hover:shadow-[0_0_44px_-4px_var(--primary)]"
            >
              Try Prep AI Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border px-7 text-sm font-semibold text-foreground transition-all hover:bg-input/30"
            >
              <Play className="h-4 w-4" />
              See our plans
            </Link>
          </div>

          <div className="reveal mt-8 grid max-w-xl gap-3 sm:grid-cols-2" style={{ transitionDelay: '320ms' }}>
            <PracticeChip
              icon={Mic}
              title="Voice analysis"
              detail="Tone, pace, filler words"
              delay="0ms"
            />
            <PracticeChip
              icon={MessageSquareMore}
              title="Follow-up prompts"
              detail="Realistic interviewer replies"
              delay="120ms"
            />
            <PracticeChip
              icon={Clock3}
              title="Timed drills"
              detail="Answer under pressure"
              delay="240ms"
            />
            <PracticeChip
              icon={BadgeCheck}
              title="Score tracking"
              detail="Watch confidence rise"
              delay="360ms"
            />
          </div>

          <div className="reveal mt-6 flex items-center gap-3 text-xs text-muted-foreground" style={{ transitionDelay: '400ms' }}>
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)] animate-live-pulse" />
            Live rehearsal session in progress
          </div>
        </div>

        <div className="reveal relative" style={{ transitionDelay: '240ms' }}>
          <div className="relative overflow-hidden rounded-[2rem] glass-strong shimmer-border p-4 sm:p-5 glow-ring-strong animate-brain-glow">
            {/* Decorative inner radial overlays removed for cleaner appearance */}
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[oklch(0.08_0.03_265)] min-h-[520px] sm:min-h-[600px]">
              <Image
                src="/hero-ai-brain.jpg"
                alt="AI neural network powering HireQuest interview preparation"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover opacity-20 blur-[1px] scale-110"
                priority
              />

              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.07_0.03_265_/0.05),oklch(0.12_0.03_265_/0.82))]" />

              <div className="absolute inset-x-4 top-4 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-muted-foreground backdrop-blur-md sm:inset-x-5">
                <span>Live interview assistant</span>
                <span className="inline-flex items-center gap-2 text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  responding
                </span>
              </div>

              <div className="absolute left-1/2 top-1/2 w-[min(82vw,390px)] -translate-x-1/2 -translate-y-[44%] sm:-translate-y-1/2">
                <div className="relative rounded-[1.75rem] border border-white/10 bg-white/5 p-4 shadow-[0_0_60px_-12px_color-mix(in_oklab,var(--primary)_55%,transparent)] backdrop-blur-xl">
                  <div className="relative aspect-[1.05/1] overflow-hidden rounded-[1.5rem] bg-[oklch(0.08_0.03_265)]">
                    <DotLottieReact
                      src="/Live%20chatbot.lottie"
                      loop
                      autoplay
                      style={{ width: '100%', height: '100%' }}
                    />

                    <div className="absolute bottom-4 left-4 right-4 grid gap-3 sm:grid-cols-2">
                      <FloatingCard
                        className="animate-float"
                        style={{ animationDelay: '0.2s' }}
                        title="Confidence"
                        value="92%"
                        hint="↑ 14% this week"
                      />
                      <FloatingCard
                        className="animate-float"
                        style={{ animationDelay: '0.9s' }}
                        title="Clarity"
                        value="8.7 / 10"
                        hint="better structure"
                      />
                    </div>

                    {/* inner subtle overlay removed */}
                  </div>
                </div>
              </div>

              <div className="absolute right-4 top-20 hidden xl:flex flex-col gap-3">
                <div className="rounded-2xl glass px-4 py-3 text-xs text-muted-foreground animate-float" style={{ animationDelay: '0s' }}>
                  Behavioral prep
                </div>
                <div className="rounded-2xl glass px-4 py-3 text-xs text-muted-foreground animate-float" style={{ animationDelay: '0.7s' }}>
                  System design
                </div>
                <div className="rounded-2xl glass px-4 py-3 text-xs text-muted-foreground animate-float" style={{ animationDelay: '1.4s' }}>
                  Rapid feedback
                </div>
              </div>
            </div>
          </div>

          {/* bottom decorative radial blur removed */}
        </div>
      </div>
    </section>
  )
}
