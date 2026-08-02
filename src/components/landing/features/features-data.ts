import {
  BarChart3,
  Building2,
  Code2,
  FileText,
  MessageCircle,
  Settings2,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'

export type CapabilityDive = {
  icon: LucideIcon
  title: string
  howItWorks: string
  outcome: string
  status: 'live' | 'roadmap'
}

export const CAPABILITY_DIVES: CapabilityDive[] = [
  {
    icon: Sparkles,
    title: 'AI feedback',
    howItWorks:
      'After a session, answers are scored across communication, correctness, clarity, and related dimensions—then summarized into strengths and improvement notes you can act on.',
    outcome:
      'Leave each attempt with dimension scores and concrete coaching notes, not a single pass/fail.',
    status: 'live',
  },
  {
    icon: Building2,
    title: 'Role- and company-style questions',
    howItWorks:
      'The interview wizard scopes prompts by department, specialization, topics, and difficulty so practice mirrors the loop you are targeting—not a generic quiz bank.',
    outcome:
      'Practice questions that match the domain and seniority you are preparing for.',
    status: 'live',
  },
  {
    icon: BarChart3,
    title: 'Performance analytics',
    howItWorks:
      'Completed sessions feed dashboards and result views that surface activity, completion trends, and skill breakdowns across saved interviews.',
    outcome:
      'See where you are improving week to week and which dimensions still need reps.',
    status: 'live',
  },
  {
    icon: MessageCircle,
    title: 'Behavioral practice',
    howItWorks:
      'Choose behavioral (and mixed) interview types to rehearse structured storytelling under the same session runner used for technical loops.',
    outcome:
      'Build confidence on the human side of the interview with repeatable, reviewable sessions.',
    status: 'live',
  },
  {
    icon: Code2,
    title: 'Coding challenges',
    howItWorks:
      'A dedicated live coding surface with complexity and edge-case analysis is planned as a first-class practice mode.',
    outcome:
      'Technical coding drills will sit alongside spoken interview practice in one workspace.',
    status: 'roadmap',
  },
  {
    icon: FileText,
    title: 'Resume-driven questions',
    howItWorks:
      'Generating prompts directly from your resume and projects is on the roadmap so practice can mirror your own experience narrative.',
    outcome:
      'Future sessions will ask about your real projects instead of only catalog topics.',
    status: 'roadmap',
  },
]

export const SESSION_FLOW: Array<{
  icon: LucideIcon
  title: string
  detail: string
  href?: string
  linkLabel?: string
}> = [
  {
    icon: Settings2,
    title: 'Configure',
    detail: 'Pick interview type, department, topics, and difficulty in the wizard.',
    href: '/product#modes',
    linkLabel: 'See modes',
  },
  {
    icon: MessageCircle,
    title: 'Practice',
    detail: 'Run the session with generated questions under timed, focused conditions.',
    href: '/product',
    linkLabel: 'Product overview',
  },
  {
    icon: Sparkles,
    title: 'Feedback',
    detail: 'Review dimension scores, strengths, and improvement notes on the report.',
    href: '/product',
    linkLabel: 'See scoring',
  },
  {
    icon: TrendingUp,
    title: 'Progress',
    detail: 'Track completed sessions and skill trends so the next attempt is targeted.',
    href: '/product#progress',
    linkLabel: 'Analytics preview',
  },
]
