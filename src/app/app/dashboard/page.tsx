import { AppDashboardPanel } from '@/components/app/UserDashboard'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'

export const metadata = {
  title: 'App Dashboard — HireQuest',
}

export default function AppDashboardRoute() {
  return (
    <>
      <DashboardPageHeader
        title="App Dashboard"
        description="Activity snapshot, upcoming interviews & progress."
        titleHighlight="accent"
        variant="dashboard"
      />
      <AppDashboardPanel />
    </>
  )
}
