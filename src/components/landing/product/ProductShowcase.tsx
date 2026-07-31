'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  Check,
  ChevronDown,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  Lock,
  MessageSquare,
  MonitorSmartphone,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { ConstellationBackground } from '@/components/landing/ConstellationBackground'
import { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'
import { getIndustryIcon } from '@/lib/icon-mapping'

function SectionBand({
  children,
  className = '',
  tint = false,
  id,
}: {
  children: ReactNode
  className?: string
  tint?: boolean
  id?: string
}) {
  return (
    <section
      id={id}
      className={[
        'relative overflow-hidden py-20 sm:py-24 lg:py-28 scroll-mt-24',
        tint
          ? 'bg-[color-mix(in_oklab,var(--hq-display-blue)_6%,var(--background))]'
          : '',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="reveal inline-flex items-center rounded-full border border-border/70 bg-card/50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className="reveal mt-4 text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
        {title}
      </h2>
      {description ? (
        <p className="reveal mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

function useAuthHrefs() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isAdmin = session?.user?.role === 'admin'
  return {
    getStartedHref: isAuthenticated ? (isAdmin ? '/dashboard' : '/app/dashboard') : '/auth',
    practiceHref: isAuthenticated
      ? isAdmin
        ? '/dashboard'
        : '/app/new-interview'
      : '/auth',
  }
}

const CORE_FEATURES: Array<{ icon: LucideIcon; title: string; description: string }> = [
  {
    icon: Bot,
    title: 'AI Mock Interviews',
    description: 'Run realistic sessions that adapt to your role, topics, and difficulty.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Performance Reports',
    description: 'See scored breakdowns after every session—not just a pass or fail.',
  },
  {
    icon: MessageSquare,
    title: 'Instant AI Feedback',
    description: 'Get coaching on clarity, structure, and technical accuracy right away.',
  },
  {
    icon: Target,
    title: 'Department-Specific Questions',
    description: 'Practice with prompts scoped to your department and specialization.',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Watch scores, streaks, and topic mastery improve across attempts.',
  },
  {
    icon: Brain,
    title: 'Personalized Recommendations',
    description: 'Focus next practice on the skills that need the most attention.',
  },
  {
    icon: Lock,
    title: 'Secure User Dashboard',
    description: 'Your interviews, answers, and analytics stay in your private workspace.',
  },
  {
    icon: MonitorSmartphone,
    title: 'Responsive Experience',
    description: 'Prepare on desktop or mobile with a layout that stays usable everywhere.',
  },
]

const HOW_STEPS = [
  'Create an account',
  'Choose your department',
  'Start an AI interview',
  'Answer questions',
  'Receive instant feedback',
  'Improve and practice again',
]

const PRACTICE_MODES: Array<{
  icon: LucideIcon
  title: string
  description: string
  badge?: string
}> = [
  {
    icon: ClipboardList,
    title: 'Technical Interviews',
    description: 'Role-scoped technical prompts with depth that mirrors real loops.',
  },
  {
    icon: Users,
    title: 'HR Interviews',
    description: 'Practice culture-fit, motivation, and workplace scenario questions.',
  },
  {
    icon: MessageSquare,
    title: 'Behavioral Interviews',
    description: 'Build STAR-ready stories for leadership, teamwork, and conflict prompts.',
  },
  {
    icon: LayoutDashboard,
    title: 'System Design',
    description: 'Architecture walkthroughs for senior and backend-focused tracks.',
    badge: 'Coming soon',
  },
  {
    icon: Sparkles,
    title: 'Mixed Practice',
    description: 'Combine technical and behavioral questions in one balanced session.',
  },
]

const COMPARISON_ROWS = [
  { traditional: 'Static question lists', hirequest: 'Interactive AI interviews' },
  { traditional: 'No feedback', hirequest: 'Instant AI feedback' },
  { traditional: 'No progress tracking', hirequest: 'Detailed analytics' },
  { traditional: 'Manual preparation', hirequest: 'Personalized recommendations' },
  { traditional: 'One-size-fits-all', hirequest: 'Department-specific practice' },
]

const PROGRESS_STATS = [
  { label: 'Interviews Completed', value: '24', hint: 'This month' },
  { label: 'Average Score', value: '84%', hint: '+6% vs last month' },
  { label: 'Improvement Trend', value: '+12%', hint: 'Last 4 weeks' },
  { label: 'Weekly Activity', value: '5 days', hint: 'Active this week' },
]

const SKILL_BARS = [
  { label: 'Communication', value: 82 },
  { label: 'Technical Accuracy', value: 90 },
  { label: 'Confidence', value: 76 },
  { label: 'Problem Solving', value: 88 },
]

const PRODUCT_TESTIMONIALS = [
  {
    name: 'Ayesha Malik',
    role: 'CS Junior, NUST',
    text: 'The department-specific questions finally matched what my internship interviews asked. I stopped guessing and started practicing with purpose.',
    initials: 'AM',
  },
  {
    name: 'Leo Fernandez',
    role: 'Career switcher',
    text: 'Instant feedback on structure changed how I answer behavioral prompts. I can see my confidence score climb week over week.',
    initials: 'LF',
  },
  {
    name: 'Hina Qureshi',
    role: 'Final-year Software Eng.',
    text: 'I used HireQuest before every onsite. The progress dashboard made it obvious which topics still needed another session.',
    initials: 'HQ',
  },
  {
    name: 'Noah Park',
    role: 'New-grad candidate',
    text: 'Mixed practice felt closest to a real interview day. Retaking sessions with clearer answers was the best confidence builder.',
    initials: 'NP',
  },
]

const PRODUCT_FAQS = [
  {
    q: 'How does AI scoring work?',
    a: 'After each session, HireQuest evaluates your answers on dimensions like technical accuracy, communication, confidence, and problem solving. You get an overall score plus concrete strengths and improvement notes.',
  },
  {
    q: 'Can I retake interviews?',
    a: 'Yes. Retake any session to reinforce weak topics, compare attempts, and track how your scores change over time in your dashboard.',
  },
  {
    q: 'Is HireQuest free?',
    a: 'You can start practicing without a credit card. Free access covers getting started; paid plans unlock higher limits and deeper analytics when you need them.',
  },
  {
    q: 'Which departments are supported?',
    a: 'HireQuest covers a wide catalog—including Computer Science, Software Engineering, Data Science, Artificial Intelligence, Finance, Marketing, Healthcare, Law, and more—with specializations inside each department.',
  },
  {
    q: 'How is my progress tracked?',
    a: 'Completed interviews, average scores, weekly activity, and skill breakdowns are saved to your account so you can see improvement trends across practice sessions.',
  },
]

function ScoreRing({ value }: { value: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden>
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-border/70"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[var(--hq-display-blue)] transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-foreground">{value}</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Overall
        </span>
      </div>
    </div>
  )
}

function SkillMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-[var(--hq-display-blue)]">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full rounded-full bg-[var(--hq-display-blue)] transition-[width] duration-1000 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function ProductHero() {
  const ref = useReveal<HTMLElement>()
  const { getStartedHref, practiceHref } = useAuthHrefs()

  return (
    <section ref={ref} className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36">
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <ConstellationBackground
          className="pointer-events-none absolute inset-0 h-full w-full opacity-60"
          intensity={0.35}
        />
        <div className="absolute inset-0 bg-mesh opacity-35" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--hq-display-blue)_18%,transparent),transparent_55%)]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <div className="reveal text-sm font-extrabold tracking-[-0.03em] text-[var(--hq-display-blue)] sm:text-base">
            HireQuest
          </div>
          <h1 className="reveal mt-3 text-4xl font-extrabold tracking-[-0.03em] leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Everything You Need to Prepare for Your Next Interview
          </h1>
          <p className="reveal mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Practice realistic interviews, receive AI-powered feedback, track your progress, and
            improve your confidence—all in one platform.
          </p>
          <div className="reveal mt-8 flex flex-wrap gap-3">
            <Link
              href={getStartedHref}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--hq-display-blue)] px-6 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={practiceHref}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-border bg-card/60 px-6 text-sm font-semibold text-foreground backdrop-blur transition hover:bg-card"
            >
              Start Practicing
            </Link>
          </div>
        </div>

        <div className="reveal relative">
          <div className="glass-panel relative overflow-hidden rounded-3xl border border-border/60 p-5 sm:p-6 shadow-glow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Session preview
                </div>
                <div className="mt-1 text-lg font-bold text-foreground">AI Feedback Snapshot</div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--hq-display-blue)]/15 px-3 py-1 text-xs font-semibold text-[var(--hq-display-blue)]">
                <Sparkles className="h-3.5 w-3.5" />
                Live scoring
              </span>
            </div>
            <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
              <ScoreRing value={86} />
              <div className="space-y-3">
                {SKILL_BARS.map((skill) => (
                  <SkillMeter key={skill.label} label={skill.label} value={skill.value} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductFeatures() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand tint id="features">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Core features"
          title="Built for serious interview prep"
          description="Every capability is designed to turn practice into measurable improvement."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CORE_FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="reveal group rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--hq-display-blue)_35%,var(--border))]"
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}

function ProductHowItWorks() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand id="how-it-works">
      <div ref={ref} className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="How it works"
          title="From signup to sharper answers in six steps"
          description="A simple loop you can repeat until interview day feels familiar."
        />
        <ol className="relative mt-14 space-y-0 pl-2">
          <div
            className="absolute left-[1.35rem] top-4 bottom-4 w-px bg-[color-mix(in_oklab,var(--hq-display-blue)_35%,var(--border))]"
            aria-hidden
          />
          {HOW_STEPS.map((step, index) => (
            <li
              key={step}
              className="reveal relative flex items-start gap-4 py-3"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[var(--hq-display-blue)] bg-background text-sm font-bold text-[var(--hq-display-blue)]">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1 rounded-2xl border border-border/70 bg-card/80 px-4 py-3.5 backdrop-blur-sm">
                <div className="text-xs font-semibold uppercase tracking-wider text-[var(--hq-display-blue)]">
                  Step {index + 1}
                </div>
                <div className="mt-1 text-sm font-semibold text-foreground sm:text-base">{step}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionBand>
  )
}

function ProductCategories() {
  const ref = useReveal<HTMLDivElement>()
  const departments = INTERVIEW_CATALOG_DEPARTMENTS

  return (
    <SectionBand tint id="categories">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Interview categories"
          title="Practice across every department we support"
          description="Pick a department, choose a specialization, and get questions that match your track."
        />
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {departments.map((department, index) => {
            const icon = getIndustryIcon(department.key)
            const Icon = icon.icon
            const count = department.specializations?.length ?? 0
            return (
              <div
                key={department.key}
                className="reveal flex items-center gap-3 rounded-2xl border border-border/70 bg-card/70 px-4 py-3.5 backdrop-blur-sm"
                style={{ transitionDelay: `${Math.min(index, 12) * 30}ms` }}
              >
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                  <Icon className="h-5 w-5" strokeWidth={1.85} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-foreground">{department.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {count} specialization{count === 1 ? '' : 's'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}

function ProductFeedbackPreview() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand id="feedback">
      <div ref={ref} className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="AI feedback preview"
          title="See exactly where you stand after each session"
          description="Scores, strengths, and next actions—clear enough to practice smarter next time."
        />
        <div className="reveal mt-12 overflow-hidden rounded-3xl border border-border/70 bg-card/80 shadow-glow-sm backdrop-blur-sm">
          <div className="border-b border-border/60 px-5 py-4 sm:px-8 sm:py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Results dashboard
                </div>
                <h3 className="mt-1 text-xl font-bold text-foreground">Backend Engineering · Mock #12</h3>
              </div>
              <div className="rounded-full bg-[var(--hq-display-blue)]/12 px-3 py-1 text-xs font-semibold text-[var(--hq-display-blue)]">
                Overall score 86
              </div>
            </div>
          </div>

          <div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[220px_1fr]">
            <ScoreRing value={86} />
            <div className="space-y-4">
              {SKILL_BARS.map((skill) => (
                <SkillMeter key={skill.label} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 border-t border-border/60 p-5 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-border/60 bg-[color-mix(in_oklab,var(--hq-display-blue)_6%,transparent)] p-5">
              <div className="text-sm font-bold text-foreground">Strengths</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Good technical explanations
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Strong logical thinking
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/40 p-5">
              <div className="text-sm font-bold text-foreground">Areas to Improve</div>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Speak more confidently
                </li>
                <li className="flex gap-2">
                  <Target className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  Give more structured answers
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SectionBand>
  )
}

function ProductPracticeModes() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand tint id="modes">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Practice modes"
          title="Train the interview styles you will actually face"
          description="Switch between modes as your prep plan evolves."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRACTICE_MODES.map((mode, index) => {
            const Icon = mode.icon
            return (
              <div
                key={mode.title}
                className="reveal relative rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm"
                style={{ transitionDelay: `${index * 45}ms` }}
              >
                {mode.badge ? (
                  <span className="absolute right-4 top-4 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {mode.badge}
                  </span>
                ) : null}
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{mode.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{mode.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}

function ProductComparison() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand id="why-hirequest">
      <div ref={ref} className="mx-auto max-w-5xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Why choose HireQuest?"
          title="A clearer path than practicing alone"
          description="See how interactive prep compares with static question lists."
        />
        <div className="reveal mt-12 overflow-hidden rounded-3xl border border-border/70 bg-card/70 backdrop-blur-sm">
          <div className="grid grid-cols-[1.1fr_1fr] border-b border-border/60 bg-[color-mix(in_oklab,var(--hq-display-blue)_8%,transparent)] px-4 py-4 text-sm font-bold sm:grid-cols-2 sm:px-6">
            <div className="text-muted-foreground">Traditional Practice</div>
            <div className="text-[var(--hq-display-blue)]">HireQuest</div>
          </div>
          <div className="divide-y divide-border/60">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.traditional}
                className="grid grid-cols-[1.1fr_1fr] gap-3 px-4 py-4 text-sm sm:grid-cols-2 sm:px-6"
              >
                <div className="flex items-start gap-2 text-muted-foreground">
                  <X className="mt-0.5 h-4 w-4 shrink-0 opacity-60" />
                  <span>{row.traditional}</span>
                </div>
                <div className="flex items-start gap-2 font-medium text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--hq-display-blue)]" />
                  <span>{row.hirequest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionBand>
  )
}

function ProductProgressPreview() {
  const ref = useReveal<HTMLDivElement>()
  const chartRef = useRef<HTMLDivElement | null>(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const node = chartRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAnimate(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const weekBars = [42, 58, 51, 67, 74, 70, 82]

  return (
    <SectionBand tint id="progress">
      <div ref={ref} className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Progress dashboard"
          title="Track the practice that actually moves the needle"
          description="A clear view of volume, quality, and skill mix—so you know what to run next."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRESS_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className="reveal rounded-2xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-2 text-3xl font-extrabold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{stat.hint}</div>
            </div>
          ))}
        </div>

        <div
          ref={chartRef}
          className="reveal mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="rounded-3xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <LineChart className="h-4 w-4 text-[var(--hq-display-blue)]" />
              <h3 className="text-sm font-bold text-foreground">Weekly activity</h3>
            </div>
            <div className="flex h-40 items-end gap-2 sm:gap-3">
              {weekBars.map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex h-32 w-full items-end overflow-hidden rounded-lg bg-border/40">
                    <div
                      className="w-full rounded-lg bg-[var(--hq-display-blue)] transition-[height] duration-700 ease-out"
                      style={{
                        height: animate ? `${value}%` : '0%',
                        transitionDelay: `${index * 70}ms`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border/70 bg-card/70 p-5 backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--hq-display-blue)]" />
              <h3 className="text-sm font-bold text-foreground">Skills breakdown</h3>
            </div>
            <div className="space-y-4">
              {SKILL_BARS.map((skill) => (
                <SkillMeter
                  key={skill.label}
                  label={skill.label}
                  value={animate ? skill.value : 0}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionBand>
  )
}

function ProductTestimonials() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <SectionBand id="testimonials">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Testimonials"
          title="What candidates say after real practice"
          description="Realistic prep stories from students and new-grad candidates."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2">
          {PRODUCT_TESTIMONIALS.map((item, index) => (
            <blockquote
              key={item.name}
              className="reveal rounded-2xl border border-border/70 bg-card/70 p-6 backdrop-blur-sm"
              style={{ transitionDelay: `${index * 50}ms` }}
            >
              <p className="text-sm leading-relaxed text-foreground sm:text-[15px]">“{item.text}”</p>
              <footer className="mt-5 flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--hq-display-blue)]/15 text-xs font-bold text-[var(--hq-display-blue)]">
                  {item.initials}
                </div>
                <div>
                  <div className="text-sm font-bold text-foreground">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.role}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </SectionBand>
  )
}

function ProductFAQ() {
  const ref = useReveal<HTMLDivElement>()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <SectionBand tint id="faq">
      <div ref={ref} className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="FAQ"
          title="Answers before you start practicing"
          description="Quick clarity on scoring, retakes, pricing, and progress."
        />
        <div className="mt-10 space-y-3">
          {PRODUCT_FAQS.map((item, index) => {
            const open = openIndex === index
            return (
              <div
                key={item.q}
                className="reveal overflow-hidden rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span className="text-sm font-semibold text-foreground sm:text-[15px]">{item.q}</span>
                  <ChevronDown
                    className={[
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      open ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                </button>
                {open ? (
                  <div className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}

function ProductFinalCTA() {
  const ref = useReveal<HTMLElement>()
  const { getStartedHref, practiceHref } = useAuthHrefs()

  return (
    <section ref={ref} className="cta-diagonal-section relative overflow-hidden py-24 sm:py-32">
      <div className="cta-diagonal-plate" aria-hidden />
      <div className="cta-diagonal-mesh" aria-hidden />
      <div className="cta-diagonal-glow-a" aria-hidden />
      <div className="cta-diagonal-glow-b" aria-hidden />
      <div className="cta-diagonal-shine" aria-hidden />

      <div className="reveal relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="cta-diagonal-title text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl">
          Ready to Ace Your Next Interview?
        </h2>
        <p className="cta-diagonal-body mx-auto mt-4 max-w-xl text-base sm:text-lg">
          Create your account, pick a department, and start a practice session in minutes.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={getStartedHref}
            className="cta-diagonal-btn inline-flex h-12 items-center gap-2 rounded-[10px] px-8 text-sm font-semibold"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={practiceHref}
            className="inline-flex h-12 items-center rounded-[10px] border border-white/30 bg-white/10 px-8 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/16"
          >
            Start Practicing
          </Link>
        </div>
      </div>
    </section>
  )
}

export function ProductShowcase() {
  return (
    <>
      <ProductHero />
      <ProductFeatures />
      <ProductHowItWorks />
      <ProductCategories />
      <ProductFeedbackPreview />
      <ProductPracticeModes />
      <ProductComparison />
      <ProductProgressPreview />
      <ProductTestimonials />
      <ProductFAQ />
      <ProductFinalCTA />
    </>
  )
}
