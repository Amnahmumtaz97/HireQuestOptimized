import {
  Award,
  BarChart3,
  Bookmark,
  Code2,
  MessageCircle,
  Mic,
  Route,
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
    outcome: 'Leave each attempt with dimension scores and concrete coaching notes, not a single pass/fail.',
    status: 'live',
  },
  {
    icon: Mic,
    title: 'Interview list & sessions',
    howItWorks:
      'Configure a session in the wizard, then resume or review it from My Interviews. Status, type, difficulty, and scores stay on the same row.',
    outcome: 'Pick up where you left off instead of hunting through scattered practice notes.',
    status: 'live',
  },
  {
    icon: Route,
    title: 'Learning paths & certifications',
    howItWorks:
      'Browse path overview, categories, and catalog, then jump into certs that map to the same topics you practice in interviews.',
    outcome: 'Prep for a role and an exam from one workspace, with matching guidance when a cert fits.',
    status: 'live',
  },
  {
    icon: BarChart3,
    title: 'Dashboard & analytics',
    howItWorks:
      'The dashboard shows activity and upcoming interviews. Analytics adds completion trends and skill breakdowns across saved sessions.',
    outcome: 'See where you are improving week to week and which dimensions still need reps.',
    status: 'live',
  },
  {
    icon: Bookmark,
    title: 'Bookmarks',
    howItWorks:
      'Save certifications, paths, and topics so the next session starts from what you already marked.',
    outcome: 'Keep a short list of the tracks you are actually studying.',
    status: 'live',
  },
  {
    icon: Code2,
    title: 'Live coding surface',
    howItWorks:
      'A dedicated live coding surface with complexity and edge-case analysis is planned as a first-class practice mode.',
    outcome: 'Technical coding drills will sit alongside spoken interview practice in one workspace.',
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
    detail: 'Run the session, then find it again on My Interviews when you need to resume.',
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
    detail: 'Track completed sessions on the dashboard and analytics so the next attempt is targeted.',
    href: '/product#progress',
    linkLabel: 'Analytics preview',
  },
  {
    icon: Award,
    title: 'Certify',
    detail: 'Open the certifications catalog when a path maps to an exam you want to pass.',
    href: '/product#categories',
    linkLabel: 'See catalog',
  },
]
