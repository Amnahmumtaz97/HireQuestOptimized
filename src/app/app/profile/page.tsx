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
        description="Your resume, links, and experience — used to tailor every interview."
      />
      <ProfileManagementPage />
    </>
  )
}
