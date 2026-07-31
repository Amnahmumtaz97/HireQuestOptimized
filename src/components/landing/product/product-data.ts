import {
  BarChart3,
  Brain,
  ClipboardList,
  Code2,
  FileBarChart,
  LayoutDashboard,
  LineChart,
  MessageSquare,
  MonitorSmartphone,
  Network,
  Palette,
  PlusCircle,
  Server,
  Shield,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react'

/** Real app surfaces — not landing “toolkit” marketing bullets. */
export const PRODUCT_SURFACES: Array<{
  icon: LucideIcon
  title: string
  href: string
  description: string
}> = [
  {
    icon: PlusCircle,
    title: 'New Interview wizard',
    href: '/app/new-interview',
    description:
      'Configure interview type, one department, specializations, topics, difficulty, and question count before you start.',
  },
  {
    icon: MessageSquare,
    title: 'Live session runner',
    href: '/app/interviews',
    description:
      'Work through generated questions in-session with timers, flags, and answer capture.',
  },
  {
    icon: FileBarChart,
    title: 'Results report',
    href: '/app/results',
    description:
      'Open a scored report with dimension breakdowns, strengths, and improvement notes after a session.',
  },
  {
    icon: LineChart,
    title: 'Analytics & progress',
    href: '/app/analytics',
    description:
      'Review completed interviews, average scores, and skill trends across practice history.',
  },
  {
    icon: UserRound,
    title: 'Account dashboard',
    href: '/app/dashboard',
    description:
      'Jump back into recent sessions, profile settings, and billing from your private workspace.',
  },
]

export const PRACTICE_MODES: Array<{
  icon: LucideIcon
  title: string
  description: string
  badge?: string
}> = [
  {
    icon: ClipboardList,
    title: 'Technical',
    description: 'Department-scoped technical prompts with adjustable difficulty and topic filters.',
  },
  {
    icon: Users,
    title: 'HR',
    description: 'Motivation, culture-fit, and workplace scenario questions for HR-style rounds.',
  },
  {
    icon: MessageSquare,
    title: 'Behavioral',
    description: 'Structured prompts for leadership, teamwork, conflict, and impact stories.',
  },
  {
    icon: LayoutDashboard,
    title: 'System Design',
    description: 'Architecture walkthroughs for senior and backend-focused tracks.',
    badge: 'Coming soon',
  },
  {
    icon: Sparkles,
    title: 'Mixed',
    description: 'Combine technical and behavioral questions in one session configuration.',
  },
]

export const PROGRESS_STATS = [
  { label: 'Interviews Completed', value: '24', hint: 'Sample month view' },
  { label: 'Average Score', value: '84%', hint: 'Across saved sessions' },
  { label: 'Improvement Trend', value: '+12%', hint: 'Sample 4-week delta' },
  { label: 'Weekly Activity', value: '5 days', hint: 'Sample activity streak' },
]

export const SKILL_BARS = [
  { label: 'Communication', value: 82 },
  { label: 'Technical Accuracy', value: 90 },
  { label: 'Confidence', value: 76 },
  { label: 'Problem Solving', value: 88 },
]

export const OVERALL_SCORE = 86

export const WEEK_BARS = [42, 58, 51, 67, 74, 70, 82]

export const PRODUCT_FAQS = [
  {
    q: 'Which dimensions appear on a results report?',
    a: 'Sample and live reports break scores into communication, technical accuracy, confidence, and problem solving, plus an overall score with strengths and improvement notes.',
  },
  {
    q: 'How do departments and specializations work in the wizard?',
    a: 'You select exactly one department, then one or more specializations and topics from that department’s catalog before generating questions.',
  },
  {
    q: 'Can I open and retake a past session?',
    a: 'Yes. Saved interviews stay in your Interviews list so you can reopen results and run another attempt with a fresh configuration when you want more practice.',
  },
  {
    q: 'What limits apply on free access?',
    a: 'You can create an account and start practicing without a credit card. Higher session limits and deeper analytics unlock on paid plans when you need them.',
  },
  {
    q: 'Where do weekly activity and skill charts live?',
    a: 'Analytics and dashboard views summarize completed interviews, average scores, weekly activity, and skill breakdowns from your saved sessions.',
  },
]

export const HIGHLIGHT_TRACKS: Array<{
  label: string
  subtitle: string
  icon: LucideIcon
}> = [
  { label: 'Software Engineering', subtitle: 'Department', icon: Code2 },
  { label: 'Frontend Development', subtitle: 'Specialization', icon: MonitorSmartphone },
  { label: 'Backend Development', subtitle: 'Specialization', icon: Server },
  { label: 'Full Stack Development', subtitle: 'Specialization', icon: Network },
  { label: 'Data Science', subtitle: 'Department', icon: BarChart3 },
  { label: 'AI & Machine Learning', subtitle: 'Department', icon: Brain },
  { label: 'Cyber Security', subtitle: 'Track', icon: Shield },
  { label: 'DevOps', subtitle: 'Specialization', icon: LayoutDashboard },
  { label: 'UI/UX Design', subtitle: 'Related track', icon: Palette },
]
