import { PathSelector } from '@/components/app/learning-paths/PathSelector'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import Link from 'next/link'
import { ArrowLeft, Library } from 'lucide-react'

export const metadata = {
  title: 'All Paths Catalog — HireQuest',
}

export default function LearningPathsCatalogPage() {
  return (
    <>
      <DashboardPageHeader
        title="All Paths Catalog"
        description="Search and filter every learning path in one list."
      />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        <Link
          href="/app/learning-paths"
          className="inline-flex items-center gap-1.5 text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Categories
        </Link>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <Library className="h-3.5 w-3.5" />
          Full catalog
        </span>
      </div>
      <PathSelector />
    </>
  )
}
