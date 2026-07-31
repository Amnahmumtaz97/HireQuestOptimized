import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { ProgressRing } from '@/components/dashboard/ProgressRing'

export const metadata = {
  title: 'Analytics — HireQuest',
}

export default function AnalyticsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Analytics"
        description="A high-level view of progress, streaks, and interview performance."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="dashboard-card p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
                Performance overview
              </div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
                Your learning curve at a glance
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                This page is UI-focused and will be wired to richer metrics as they become available.
              </div>
            </div>
            <div className="hidden sm:block">
              <ProgressRing size={72} progress={0.72} />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-[var(--hq-stat-surface)] p-4">
              <div className="text-xs text-muted-foreground">Weekly consistency</div>
              <div className="mt-1 text-xl font-semibold text-foreground">4/5</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Sessions completed</div>
            </div>
            <div className="rounded-2xl border border-border bg-[var(--hq-stat-surface)] p-4">
              <div className="text-xs text-muted-foreground">Avg. AI score</div>
              <div className="mt-1 text-xl font-semibold text-foreground">72</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Across completed sessions</div>
            </div>
            <div className="rounded-2xl border border-border bg-[var(--hq-stat-surface)] p-4">
              <div className="text-xs text-muted-foreground">Response time</div>
              <div className="mt-1 text-xl font-semibold text-foreground">1.8s</div>
              <div className="mt-1 text-[11px] text-muted-foreground">Median generation latency</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
            Insights
          </div>
          <div className="mt-2 text-sm text-muted-foreground">
            Coming next:
          </div>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Topic mastery breakdown
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Difficulty vs. score trendline
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
              Personalized AI recommendations
            </li>
          </ul>
        </div>
      </div>
    </>
  )
}

