'use client'

import Link from 'next/link'
import { Flame, Sparkles, BookOpen, MessageSquare, ArrowRight, Zap } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type Action = {
  icon: LucideIcon
  iconWrap: string
  title: string
  description: string
  cta: string
  href: string
  badge?: string
  badgeColor?: string
}

function buildActions(
  interviewsCompleted: number,
  currentStreak: number,
  confidenceScore: number | null,
  pathsEnrolled: number,
): Action[] {
  const actions: Action[] = []

  if (interviewsCompleted === 0) {
    actions.push({
      icon: Zap,
      iconWrap: 'icon-wrap-purple',
      title: 'Start your first interview',
      description: 'Launch a mock interview to begin building your confidence score.',
      cta: 'Start now',
      href: '/app/new-interview',
      badge: 'Get started',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    })
  }

  if (currentStreak === 0 && interviewsCompleted > 0) {
    actions.push({
      icon: Flame,
      iconWrap: 'icon-wrap-amber',
      title: 'Reignite your streak',
      description: 'You had a streak going! Complete any interview today to restart it.',
      cta: 'Practice now',
      href: '/app/mocks',
      badge: 'Streak at risk',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    })
  } else if (currentStreak > 0 && currentStreak < 7) {
    actions.push({
      icon: Flame,
      iconWrap: 'icon-wrap-amber',
      title: `Keep your ${currentStreak}-day streak!`,
      description: "You're on a roll. A quick session today keeps the momentum going.",
      cta: 'Practice a topic',
      href: '/app/question-bank',
      badge: `${currentStreak}d streak`,
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    })
  }

  if (confidenceScore !== null && confidenceScore < 60) {
    actions.push({
      icon: Sparkles,
      iconWrap: 'icon-wrap-purple',
      title: 'Boost your confidence score',
      description: 'Your score is below 60%. More practice with feedback will push it higher.',
      cta: 'Take a mock interview',
      href: '/app/mocks',
      badge: `${confidenceScore}% confidence`,
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20',
    })
  }

  if (pathsEnrolled === 0) {
    actions.push({
      icon: BookOpen,
      iconWrap: 'icon-wrap-blue',
      title: 'Enrol in a learning path',
      description: 'Structured paths guide you from beginner to interview-ready systematically.',
      cta: 'Browse paths',
      href: '/app/learning-paths',
    })
  }

  // Always suggest question bank if fewer than 20 questions answered
  actions.push({
    icon: MessageSquare,
    iconWrap: 'icon-wrap-cyan',
    title: 'Practice from the question bank',
    description: 'Drill specific topics to reinforce weak areas in your skill breakdown.',
    cta: 'Open question bank',
    href: '/app/question-bank',
  })

  return actions.slice(0, 3)
}

type Props = {
  interviewsCompleted: number
  currentStreak: number
  confidenceScore: number | null
  pathsEnrolled: number
}

export function NextActionsPanel({
  interviewsCompleted,
  currentStreak,
  confidenceScore,
  pathsEnrolled,
}: Props) {
  const actions = buildActions(interviewsCompleted, currentStreak, confidenceScore, pathsEnrolled)

  return (
    <div className="card-enhanced flex flex-col rounded-2xl p-6">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">What to Do Next</span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Personalised suggestions based on your progress</p>

      <div className="mt-5 space-y-4">
        {actions.map((action, i) => {
          const Icon = action.icon
          return (
            <div
              key={i}
              className="group relative overflow-hidden rounded-xl border border-border bg-card/50 p-4 transition-colors hover:border-primary/30 hover:bg-card"
            >
              <div className="flex items-start gap-3">
                <div className={`${action.iconWrap} h-9 w-9 shrink-0`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">{action.title}</span>
                    {action.badge && (
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${action.badgeColor}`}>
                        {action.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{action.description}</p>
                  <Link
                    href={action.href}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-primary transition-opacity hover:opacity-80"
                  >
                    {action.cta} <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
