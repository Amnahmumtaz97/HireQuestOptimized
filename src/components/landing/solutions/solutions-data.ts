import {
  Award,
  Briefcase,
  GraduationCap,
  LineChart,
  MessageSquare,
  RefreshCw,
  Route,
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
      'Start on the dashboard, run department-scoped technical and behavioral sessions, and follow a learning path that matches your target role.',
    outcome:
      'Walk into screening rounds with practiced answers and a clear sense of which topics still need work.',
  },
  {
    icon: RefreshCw,
    title: 'Career switchers',
    situation:
      'You are changing fields and must prove both credibility and technical depth without a linear resume story.',
    practice:
      'Combine behavioral sessions for narrative clarity with technical or mixed modes, then bookmark the certs and paths for the domain you are entering.',
    outcome:
      'Build a coherent story and a growing score trail that shows progress in the domain you are entering.',
  },
  {
    icon: Briefcase,
    title: 'Working professionals',
    situation:
      'You already have experience and are leveling up for a new company, senior bar, or role change.',
    practice:
      'Use analytics on weak dimensions, resume interviews from My Interviews, and track weekly activity while you prep.',
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
    detail: 'Configure behavioral sessions and study strengths and improvement notes on each report.',
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
    icon: Award,
    title: 'Prep a certification',
    detail: 'Open the cert catalog, match it to a learning path, then practice the topics the exam actually tests.',
    href: '/product#categories',
    linkLabel: 'See certifications',
  },
  {
    icon: LineChart,
    title: 'Track weekly readiness',
    detail: 'Use the dashboard and analytics for activity, completion rate, and skill breakdowns.',
    href: '/product#progress',
    linkLabel: 'View analytics preview',
  },
  {
    icon: Route,
    title: 'Follow a learning path',
    detail: 'Start from path overview, drill into a category, then launch interviews from that track.',
    href: '/product',
    linkLabel: 'See product surfaces',
  },
]
