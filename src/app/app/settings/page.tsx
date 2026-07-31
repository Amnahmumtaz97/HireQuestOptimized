import { Suspense } from 'react'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { SettingsModulePage } from '@/components/app/settings/SettingsModulePage'
import { BounceLoader } from '@/components/ui/bounce-loader'

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
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <BounceLoader label="Loading settings" />
          </div>
        }
      >
        <SettingsModulePage />
      </Suspense>
    </>
  )
}
