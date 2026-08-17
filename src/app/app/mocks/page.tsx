import Link from 'next/link'
import { Clock, Code2, MessageCircle, Network, Sparkles } from 'lucide-react'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'

export const metadata = {
  title: 'Mock Interviews — HireQuest',
}

const PRESETS = [
  {
    title: 'Coding sprint',
    blurb: 'Timed DSA practice. Pick Arrays or Graphs in the next step.',
    minutes: 30,
    href: '/app/new-interview?type=coding&topic=Arrays',
    icon: Code2,
  },
  {
    title: 'System design hour',
    blurb: 'One hour on scalability, APIs, and trade-offs.',
    minutes: 60,
    href: '/app/new-interview?type=system_design&topic=Scalability',
    icon: Network,
  },
  {
    title: 'Behavioral loop',
    blurb: 'STAR-style stories for teamwork and conflict.',
    minutes: 30,
    href: '/app/new-interview?type=behavioral&topic=Teamwork',
    icon: MessageCircle,
  },
  {
    title: 'Mixed mock',
    blurb: 'Technical + behavioral in one generated session.',
    minutes: 45,
    href: '/app/new-interview?type=mixed',
    icon: Sparkles,
  },
]

export default function MockInterviewsRoute() {
  return (
    <>
      <DashboardPageHeader
        title="Mock Interviews"
        description="Start a timed-style run with a preset type. You can still adjust difficulty and length on the next screen."
        titleHighlight="accent"
        variant="dashboard"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {PRESETS.map((preset) => {
          const Icon = preset.icon
          return (
            <Link
              key={preset.title}
              href={preset.href}
              className="group rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <div className="mt-3 text-sm font-semibold text-foreground">{preset.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{preset.blurb}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {preset.minutes} min suggested
              </div>
              <div className="mt-4 text-xs font-semibold text-primary group-hover:underline">
                Start this mock →
              </div>
            </Link>
          )
        })}
      </div>
    </>
  )
}
