import { AccountSettingsPanel } from '@/components/dashboard/AccountSettingsPanel'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'

export const metadata = {
  title: 'Account Settings — HireQuest',
}

export default function UserAccountSettingsPage() {
  return (
    <main className="min-h-screen px-4 pb-10 pt-24 sm:px-6">
      <DashboardNavbar />
      <div className="mx-auto max-w-7xl">
        <AccountSettingsPanel />
      </div>
    </main>
  )
}
