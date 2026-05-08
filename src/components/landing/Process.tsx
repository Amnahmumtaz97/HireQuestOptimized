'use client'

import {
  Sparkles,
  MessageSquareText,
  LineChart,
  CheckCircle2,
  Zap,
} from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

type Step = {
  icon: React.ComponentType<{ className?: string }>
  number: number
  title: string
  description: string
  bullets: string[]
  gradient: string
  gradientLight: string
}

const steps: Step[] = [
  {
    icon: Sparkles,
    number: 1,
    title: 'Create Interview',
    description: 'Choose your role, company, and difficulty level to get started.',
    bullets: [
      'Select from 500+ roles',
      'Target specific companies',
      'Junior to executive levels',
    ],
    gradient: 'from-blue-600/30 to-blue-500/10',
    gradientLight: 'from-blue-400/20 to-blue-300/10',
  },
  {
    icon: MessageSquareText,
    number: 2,
    title: 'Select & Prepare',
    description: 'AI generates personalized questions tailored to your profile.',
    bullets: [
      'Behavioral & technical mix',
      'Company-specific questions',
      'Real interview patterns',
    ],
    gradient: 'from-purple-600/30 to-purple-500/10',
    gradientLight: 'from-purple-400/20 to-purple-300/10',
  },
  {
    icon: Zap,
    number: 3,
    title: 'AI Interview Session',
    description: 'Practice with real-time AI coaching and interactive feedback.',
    bullets: [
      'Voice & text modes',
      'Real-time guidance',
      'Follow-up questions',
    ],
    gradient: 'from-amber-600/30 to-amber-500/10',
    gradientLight: 'from-amber-400/20 to-amber-300/10',
  },
  {
    icon: LineChart,
    number: 4,
    title: 'Get Detailed Feedback',
    description: 'Receive comprehensive analytics and actionable insights.',
    bullets: [
      'Per-question scoring',
      'Tone & pacing analysis',
      'Strength map',
    ],
    gradient: 'from-emerald-600/30 to-emerald-500/10',
    gradientLight: 'from-emerald-400/20 to-emerald-300/10',
  },
  {
    icon: CheckCircle2,
    number: 5,
    title: 'Track & Improve',
    description: 'Monitor progress with personalized study plans and insights.',
    bullets: [
      'Progress tracking',
      'Weak area focus',
      'Improvement trends',
    ],
    gradient: 'from-cyan-600/30 to-cyan-500/10',
    gradientLight: 'from-cyan-400/20 to-cyan-300/10',
  },
]

function StepCard({
  step,
  index,
}: {
  step: Step
  index: number
}) {
  const Icon = step.icon

  return (
    <div
      className="reveal group relative overflow-hidden rounded-[1.5rem] transition-all duration-300 hover:scale-105 hover:-translate-y-1"
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      {/* Background gradient wrapper */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${step.gradient} dark:${step.gradient} opacity-100 dark:opacity-60 transition-opacity duration-300`}
      />

      {/* Card base */}
      <div className="relative border border-white/10 dark:border-white/8 bg-white/[0.02] dark:bg-white/[0.02] backdrop-blur-xl rounded-[1.5rem] p-6 sm:p-7 md:p-8 h-full flex flex-col">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Icon section */}
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 group-hover:border-primary/40 transition-all duration-300 shadow-[0_0_20px_-4px_rgba(79,110,247,0.3)]">
              <Icon className="h-6 w-6 text-primary group-hover:scale-110 group-hover:text-primary-glow transition-all duration-300" />
            </div>
          </div>

          {/* Step number */}
          <div className="text-4xl sm:text-5xl font-bold text-foreground/5 dark:text-foreground/10 group-hover:text-foreground/10 dark:group-hover:text-foreground/20 transition-all duration-300 leading-none">
            {String(step.number).padStart(2, '0')}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <h3 className="mt-3 text-lg sm:text-xl font-semibold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
            {step.title}
          </h3>

          <p className="mt-2 text-sm sm:text-base text-muted-foreground group-hover:text-foreground/80 transition-colors duration-300 line-clamp-2">
            {step.description}
          </p>

          {/* Bullet points */}
          <ul className="mt-5 flex flex-col gap-2.5 flex-1">
            {step.bullets.map((bullet, i) => (
              <li
                key={i}
                className="flex items-center gap-2.5 text-sm text-muted-foreground group-hover:text-foreground/75 transition-colors duration-300"
              >
                <span className="inline-flex h-1 w-1 rounded-full bg-gradient-to-r from-primary to-primary-glow flex-shrink-0 group-hover:h-1.5 group-hover:w-1.5 transition-all duration-300" />
                <span className="leading-relaxed">{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom shimmer line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  )
}

export function Process() {
  const ref = useReveal<HTMLElement>()

  return (
    <section
      ref={ref}
      id="how-it-works"
      className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 h-72 w-96 bg-gradient-radial from-primary/20 to-transparent blur-3xl rounded-full opacity-30 dark:opacity-20" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-gradient-radial from-accent/15 to-transparent blur-3xl rounded-full opacity-20 dark:opacity-10" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header section */}
        <div className="reveal text-center max-w-2xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 sm:px-4 py-1.5 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary-glow" />
            <span className="text-xs sm:text-sm uppercase tracking-[0.15em] font-medium text-muted-foreground">
              How It Works
            </span>
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Your path to interview
            <br className="hidden sm:inline" />
            <span className="text-gradient"> success</span>
          </h2>

          <p className="mt-4 sm:mt-6 text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Five simple steps from preparation to mastery. Practice like a pro, get feedback like
            an expert.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6">
          {steps.map((step, i) => (
            <StepCard key={step.number} step={step} index={i} />
          ))}
        </div>

        {/* CTA section below grid */}
        <div className="reveal mt-14 sm:mt-16 md:mt-20 text-center" style={{ transitionDelay: '400ms' }}>
          <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-3">
            <button className="rounded-full h-11 sm:h-12 px-6 sm:px-8 bg-gradient-primary text-foreground font-semibold text-sm shadow-[0_0_30px_-6px_var(--primary)] hover:shadow-[0_0_44px_-4px_var(--primary)] hover:scale-[1.03] transition-all">
              Start Free Trial
            </button>
            <button className="rounded-full h-11 sm:h-12 px-6 sm:px-8 glass border-border hover:bg-input/30 text-foreground font-semibold text-sm transition-all">
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
