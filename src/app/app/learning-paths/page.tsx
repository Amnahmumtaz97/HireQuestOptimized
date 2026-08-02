import { CategoriesGrid } from '@/components/app/learning-paths/CategoriesGrid'
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
        description="Pick a category to start — Top 30 Companies IT (Pakistan), DSA, roles, stacks, and more."
      />
      <div className="mb-6">
        <LearningPathsProgressPanel />
      </div>
      <CategoriesGrid featuredFirst showCatalogLink />
    </>
  )
}
