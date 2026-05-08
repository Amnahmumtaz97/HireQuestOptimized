import { CreateInterviewWizard } from '@/components/app/UserDashboard'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'

export const metadata = {
  title: 'New Interview — HireQuest',
}

export default function NewInterviewPage() {
  return (
    <>
      <DashboardPageHeader
        title="New Interview"
        description="Select all options below to generate your interview session."
      />
      <CreateInterviewWizard />
    </>
  )
}
