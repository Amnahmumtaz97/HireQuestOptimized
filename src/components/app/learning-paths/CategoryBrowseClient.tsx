'use client'

import { use } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Library } from 'lucide-react'
import { PathSelector } from '@/components/app/learning-paths/PathSelector'
import { PATH_CATEGORY_LABELS, PATH_SUBCATEGORIES } from '@/lib/learning-paths/constants'
import { PATH_SUBCATEGORY_DESCRIPTIONS } from '@/lib/learning-paths/path-category-meta'
import { pathSubcategoryIcon } from '@/lib/learning-paths/path-category-icons'

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
  const Icon = pathSubcategoryIcon(subcategory)
  const description =
    PATH_SUBCATEGORY_DESCRIPTIONS[
      subcategory as keyof typeof PATH_SUBCATEGORY_DESCRIPTIONS
    ] || 'Filtered learning paths for this category.'
  const categoryLabel = meta
    ? PATH_CATEGORY_LABELS[meta.category]
    : category
      ? PATH_CATEGORY_LABELS[category as keyof typeof PATH_CATEGORY_LABELS] || category
      : null

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/app/learning-paths" className="hover:text-foreground hover:underline">
          Learning paths
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">{label}</span>
      </nav>

      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Icon className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <Link
              href="/app/learning-paths"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              All categories
            </Link>
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {label}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              {categoryLabel ? (
                <span className="rounded-full border border-border bg-background/70 px-2.5 py-1">
                  {categoryLabel}
                </span>
              ) : null}
              <Link
                href="/app/learning-paths/catalog"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background/70 px-2.5 py-1 hover:border-primary/40 hover:text-foreground"
              >
                <Library className="h-3 w-3" />
                Full catalog
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <PathSelector
        initialSubcategory={tag ? undefined : subcategory}
        initialTag={tag}
        initialCategory={category}
      />
    </div>
  )
}
