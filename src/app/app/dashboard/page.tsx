import { AppDashboardPanel } from '@/components/app/UserDashboard'
import { DashboardWelcomeHeader } from '@/components/app/dashboard/DashboardWelcomeHeader'
import { DashboardRobotLottie } from '@/components/app/dashboard/DashboardRobotLottie'

export const metadata = {
  title: 'Dashboard — HireQuest',
}

export default function AppDashboardRoute() {
  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <DashboardWelcomeHeader />
        </div>
        <DashboardRobotLottie />
      </div>
      <AppDashboardPanel />
    </>
  )
}
