import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { SubscriptionPlansPage } from '@/components/app/subscription/SubscriptionPlansPage'

export const metadata = {
  title: 'Subscription Plan — HireQuest',
}

export default function SubscriptionPage() {
  return (
    <>
      <DashboardPageHeader
        title="Subscription Plan"
        description="Upgrade, downgrade, or manage your active plan."
      />
      <SubscriptionPlansPage />
    </>
  )
}
