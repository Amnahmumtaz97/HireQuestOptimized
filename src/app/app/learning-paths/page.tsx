import { PathSelector } from '@/components/app/learning-paths/PathSelector'
import { LearningPathsProgressPanel } from '@/components/app/learning-paths/LearningPathsProgressPanel'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'

export const metadata = {
  title: 'Learning Paths — HireQuest',
}

export default function LearningPathsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Learning Paths"
        description="Interview-driven journeys with levels, adaptive focus practice, and progress tracking."
      />
      <div className="mb-6">
        <LearningPathsProgressPanel />
      </div>
      <PathSelector />
    </>
  )
}
