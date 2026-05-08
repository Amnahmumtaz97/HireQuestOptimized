import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { ProfileManagementPage } from '@/components/app/profile/ProfileManagementPage'

export const metadata = {
  title: 'Profile — HireQuest',
}

export default function ProfilePage() {
  return (
    <>
      <DashboardPageHeader
        title="Profile"
        description="Edit your personal details and contact information."
      />
      <ProfileManagementPage />
    </>
  )
}
