import {
  Briefcase,
  GraduationCap,
  LineChart,
  MessageSquare,
  RefreshCw,
  Target,
  type LucideIcon,
} from 'lucide-react'

export const AUDIENCE_PLAYBOOKS: Array<{
  icon: LucideIcon
  title: string
  situation: string
  practice: string
  outcome: string
}> = [
  {
    icon: GraduationCap,
    title: 'Students & new grads',
    situation:
      'You are preparing for internships or first full-time loops and need structured reps before campus or virtual onsites.',
    practice:
      'Run department-scoped technical and behavioral sessions, then review dimension scores after each attempt.',
    outcome:
      'Walk into screening rounds with practiced answers and a clear sense of which topics still need work.',
  },
  {
    icon: RefreshCw,
    title: 'Career switchers',
    situation:
      'You are changing fields and must prove both credibility and technical depth without a linear resume story.',
    practice:
      'Combine behavioral sessions for narrative clarity with technical or mixed modes tied to your target department.',
    outcome:
      'Build a coherent story and a growing score trail that shows progress in the domain you are entering.',
  },
  {
    icon: Briefcase,
    title: 'Working professionals',
    situation:
      'You already have experience and are leveling up for a new company, senior bar, or role change.',
    practice:
      'Focus analytics on weak dimensions, retake sessions in your specialty, and track weekly activity while you prep.',
    outcome:
      'Enter the next loop with targeted practice history instead of scattered last-minute review.',
  },
]

export const PATH_BY_GOAL: Array<{
  icon: LucideIcon
  title: string
  detail: string
  href: string
  linkLabel: string
}> = [
  {
    icon: Target,
    title: 'Land an internship',
    detail: 'Use student-friendly departments and mixed modes to cover screening and behavioral rounds.',
    href: '/product#categories',
    linkLabel: 'Browse catalog',
  },
  {
    icon: MessageSquare,
    title: 'Pass a behavioral loop',
    detail: 'Configure behavioral sessions and study strengths/improvement notes on each report.',
    href: '/product#modes',
    linkLabel: 'See interview types',
  },
  {
    icon: Briefcase,
    title: 'Strengthen technical depth',
    detail: 'Pick one department, filter topics, and retake technical sessions until scores stabilize.',
    href: '/product#modes',
    linkLabel: 'See technical mode',
  },
  {
    icon: LineChart,
    title: 'Track weekly readiness',
    detail: 'Use analytics widgets for activity streaks and skill breakdowns across saved interviews.',
    href: '/product#progress',
    linkLabel: 'View analytics preview',
  },
]
