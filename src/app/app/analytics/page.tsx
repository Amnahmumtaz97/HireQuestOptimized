import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { AnalyticsOverview } from '@/components/app/analytics/AnalyticsOverview'

export const metadata = {
  title: 'Analytics — HireQuest',
}

export default function AnalyticsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Analytics"
        description="A high-level view of progress, streaks, and interview performance."
        titleHighlight="accent"
        variant="dashboard"
      />
      <AnalyticsOverview />
    </>
  )
}
