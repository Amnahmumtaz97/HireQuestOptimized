'use client'

import {
  ArrowRight,
  AudioLines,
  BadgeCheck,
  Bot,
  Clock3,
  Mic,
  MessageSquareMore,
  Play,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useReveal } from '@/hooks/use-reveal'
import { ConstellationBackground } from '@/components/landing/ConstellationBackground'
import { InterviewDeck } from '@/components/landing/InterviewDeck'

function PracticeChip({
  icon: Icon,
  title,
  detail,
  className = '',
  delay = '0ms',
}: {
  icon: LucideIcon
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
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isAdmin = session?.user?.role === 'admin'
  const authedEntryHref = isAdmin ? '/dashboard' : '/app/new-interview'

  return (
    <section
      id="home"
      ref={ref}
      className="relative isolate overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28"
    >
      {/* Hero-scoped background — extends under fixed nav; brain fills the plane */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <ConstellationBackground
          className="absolute inset-0 h-full w-full pointer-events-none opacity-70"
          intensity={0.4}
        />
        <div className="absolute inset-0 hq-hero-brain">
          <Image
            src="/hero-ai-brain-removebg-preview.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_20%] sm:object-center"
          />
        </div>
        <div className="absolute inset-0 hq-hero-wash-x" />
        <div className="absolute inset-0 hq-hero-wash-y" />
        <div className="absolute inset-0 bg-mesh opacity-40" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
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
            {isAuthenticated ? (
              <Link
                href={authedEntryHref}
                className="hq-btn-primary inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-7 text-sm"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="hq-btn-primary inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-7 text-sm"
                >
                  Start Practicing Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/auth"
                  className="hq-btn-outline inline-flex h-12 items-center justify-center gap-2 rounded-[10px] px-7 text-sm"
                >
                  <Play className="h-4 w-4" />
                  Login
                </Link>
              </>
            )}
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
          <div
            className="hq-hero-code-panel relative overflow-x-clip overflow-y-visible rounded-[24px]"
            style={{ boxShadow: '0 30px 80px -30px color-mix(in oklab, var(--primary) 35%, transparent)' }}
          >
            <div className="hq-hero-code-bg" aria-hidden>
              <pre className="hq-hero-code-pre">
                <code>{`function reconcile(prev, next) {
  if (prev.type !== next.type) {
    return replace(prev, next);
  }
  // diff children by key
  const patches = [];
  for (const key of keys(next)) {
    patches.push(update(prev[key], next[key]));
  }
  return apply(patches);
}

async function interview() {
  const q = await ask("virtual DOM?");
  const score = grade(q, { clarity: true });
  return feedback(score);
}`}</code>
              </pre>
            </div>

            {/* Header strip */}
            <div className="hq-hero-code-header relative z-[1] flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 sm:px-5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-white shadow-[0_6px_18px_-6px_color-mix(in_oklab,var(--primary)_60%,transparent)]">
                  <AudioLines className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 leading-tight">
                  <div className="truncate text-[13px] font-bold text-foreground">AI Interview Assistant</div>
                  <div className="text-[10.5px] text-muted-foreground">Live Interview</div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden items-center gap-1.5 rounded-full bg-success-muted px-2.5 py-1 text-[10.5px] font-semibold text-success min-[380px]:inline-flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
                  AI Responding
                </span>
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-primary"
                  style={{ background: 'color-mix(in oklab, var(--primary) 12%, transparent)' }}
                >
                  <Bot className="h-3.5 w-3.5" strokeWidth={1.8} />
                </span>
              </div>
            </div>

            {/* Content — interactive interview deck */}
            <div className="relative z-[1] overflow-x-clip px-2 pb-8 pt-4 sm:px-4">
              <InterviewDeck />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
