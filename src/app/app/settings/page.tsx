import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { SettingsModulePage } from '@/components/app/settings/SettingsModulePage'

export const metadata = {
  title: 'Settings — HireQuest',
}

export default function SettingsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Settings"
        description="Configure app behavior and account preferences."
      />
      <SettingsModulePage />
    </>
  )
}
