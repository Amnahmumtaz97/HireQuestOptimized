import { CategoriesGrid } from '@/components/app/learning-paths/CategoriesGrid'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import Link from 'next/link'

export const metadata = {
  title: 'Path Categories — HireQuest',
}

export default function LearningPathCategoriesPage() {
  return (
    <>
      <DashboardPageHeader
        title="Path Categories"
        description="Browse interview prep by language, stack, role, or company."
      />
      <div className="mb-4">
        <Link href="/app/learning-paths" className="text-xs text-primary hover:underline">
          ← All learning paths
        </Link>
      </div>
      <CategoriesGrid />
    </>
  )
}
