import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { AnalyticsOverview } from '@/components/app/analytics/AnalyticsOverview'

export const metadata = {
  title: 'Analytics — HireQuest',
  description: 'Track your interview performance, streaks, skill breakdown, and learning path progress on HireQuest.',
}

export default function AnalyticsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Your Analytics"
        description="Track progress, spot trends, and find exactly where to focus next."
        titleHighlight="accent"
        variant="dashboard"
      />
      <AnalyticsOverview />
    </>
  )
}
