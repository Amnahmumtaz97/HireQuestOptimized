import { InterviewsPanel } from '@/components/app/UserDashboard'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'

export const metadata = {
  title: 'Interviews — HireQuest',
}

export default function InterviewsRoute() {
  return (
    <>
      <DashboardPageHeader
        title="Interviews"
        description="Browse and manage your scheduled and past interview sessions."
        titleHighlight="accent"
        variant="dashboard"
      />
      <InterviewsPanel />
    </>
  )
}
