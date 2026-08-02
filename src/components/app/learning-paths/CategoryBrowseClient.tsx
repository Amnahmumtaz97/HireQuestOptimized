'use client'

import { use } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { PathSelector } from '@/components/app/learning-paths/PathSelector'
import { PATH_SUBCATEGORIES } from '@/lib/learning-paths/constants'

export function CategoryBrowseClient({
  params,
}: {
  params: Promise<{ subcategory: string }>
}) {
  const { subcategory } = use(params)
  const sp = useSearchParams()
  const tag = sp.get('tag') || undefined
  const category = sp.get('category') || undefined
  const meta = PATH_SUBCATEGORIES.find((s) => s.key === subcategory)
  const label = meta?.label || subcategory.replace(/_/g, ' ')

  return (
    <div className="space-y-4">
      <div>
        <Link href="/app/learning-paths/categories" className="text-xs text-primary hover:underline">
          ← Categories
        </Link>
        <h1 className="mt-2 text-lg font-semibold text-foreground">{label}</h1>
        <p className="text-sm text-muted-foreground">
          Filtered learning paths for this category.
        </p>
      </div>
      <PathSelector
        initialSubcategory={tag ? undefined : subcategory}
        initialTag={tag}
        initialCategory={category}
      />
    </div>
  )
}
