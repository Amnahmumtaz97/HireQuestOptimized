import {
  Award,
  BarChart3,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  MessageSquare,
  Mic,
  PlusCircle,
  Route,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'

/** Real app surfaces — matches the signed-in sidebar. */
export const PRODUCT_SURFACES: Array<{
  icon: LucideIcon
  title: string
  href: string
  description: string
}> = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    href: '/app/dashboard',
    description: 'Activity snapshot, upcoming interviews, and learning-path progress in one place.',
  },
  {
    icon: PlusCircle,
    title: 'New interview',
    href: '/app/new-interview',
    description: 'Configure type, department, topics, and difficulty, then start a timed session.',
  },
  {
    icon: Mic,
    title: 'My interviews',
    href: '/app/interviews',
    description: 'Resume, review results, or delete sessions from a single interview list.',
  },
  {
    icon: Route,
    title: 'Learning paths',
    href: '/app/learning-paths',
    description: 'Browse overview, categories, and catalog tracks that match the role you want.',
  },
  {
    icon: Award,
    title: 'Certifications',
    href: '/app/learning-paths/certifications',
    description: 'Explore 70+ certs and jump into practice aligned to the exam you are targeting.',
  },
  {
    icon: FileBarChart,
    title: 'Results & analytics',
    href: '/app/analytics',
    description: 'Scored reports plus trends across communication, accuracy, confidence, and problem solving.',
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
    title: 'Screening HR',
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
    q: 'What do I see after I sign in?',
    a: 'Your dashboard shows an activity snapshot and upcoming interviews. From there you open My Interviews, Learning Paths, Certifications, Results, Analytics, and Bookmarks—the same structure as the app sidebar.',
  },
  {
    q: 'How do departments and specializations work in the wizard?',
    a: 'You select exactly one department, then one or more specializations and topics from that department’s catalog before generating questions.',
  },
  {
    q: 'Can I reopen a past session?',
    a: 'Yes. Saved interviews stay in My Interviews so you can resume in-progress work, open results, or start a fresh configuration.',
  },
  {
    q: 'How do certifications connect to practice?',
    a: 'The certifications catalog maps exams to learning paths and interview topics so you can practice what the cert actually tests.',
  },
  {
    q: 'Where do weekly activity and skill charts live?',
    a: 'Analytics and the dashboard summarize completed interviews, average scores, weekly activity, and skill breakdowns from your saved sessions.',
  },
]
