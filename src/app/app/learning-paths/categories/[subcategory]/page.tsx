import { Suspense } from 'react'
import { CategoryBrowseClient } from '@/components/app/learning-paths/CategoryBrowseClient'

export const metadata = {
  title: 'Category Paths — HireQuest',
}

export default function CategoryBrowsePage({
  params,
}: {
  params: Promise<{ subcategory: string }>
}) {
  return (
    <Suspense fallback={null}>
      <CategoryBrowseClient params={params} />
    </Suspense>
  )
}
