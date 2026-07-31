import { AppDashboardPanel } from '@/components/app/UserDashboard'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { DashboardRobotLottie } from '@/components/app/dashboard/DashboardRobotLottie'

export const metadata = {
  title: 'Dashboard — HireQuest',
}

export default function AppDashboardRoute() {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <DashboardPageHeader
            title="Dashboard"
            description="Activity snapshot, upcoming interviews & progress."
            titleHighlight="accent"
            variant="dashboard"
          />
        </div>
        <DashboardRobotLottie className="-mt-2" />
      </div>
      <AppDashboardPanel />
    </>
  )
}
