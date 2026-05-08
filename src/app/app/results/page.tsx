import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { ResultsOverviewPage } from '@/components/app/results/ResultsOverviewPage'

export const metadata = {
  title: 'Results — HireQuest',
}

export default function ResultsIndexPage() {
  return (
    <>
      <DashboardPageHeader
        title="Results"
        description="Review scores, feedback, and improvement insights."
      />
      <ResultsOverviewPage />
    </>
  )
}
