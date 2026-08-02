'use client'

import Link from 'next/link'
import { PathCard } from '@/components/app/learning-paths/PathCard'
import { ListPagination } from '@/components/ui/list-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import type { LearningPath, UserPathProgress } from '@/components/app/learning-paths/types'

const SECTION_PAGE_SIZE = 4

type SectionItem = {
  path: LearningPath
  progress?: UserPathProgress | null
  reason?: string
  badge?: string
}

type PathSectionsProps = {
  continueLearning: SectionItem[]
  recommended: SectionItem[]
  popular: LearningPath[]
  newest: LearningPath[]
  completed: SectionItem[]
}

function Section({
  title,
  href,
  items,
}: {
  title: string
  href?: string
  items: SectionItem[]
}) {
  const { page, setPage, pageItems, totalPages } = useClientPagination(items, SECTION_PAGE_SIZE)

  if (items.length === 0) return null
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {href ? (
          <Link href={href} className="text-xs text-primary hover:underline">
            View all
          </Link>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {pageItems.map((item) => (
          <PathCard
            key={item.path.id}
            path={item.path}
            progress={item.progress}
            reason={item.reason}
            badge={item.badge}
          />
        ))}
      </div>
      <ListPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  )
}

export function PathSections({
  continueLearning,
  recommended,
  popular,
  newest,
  completed,
}: PathSectionsProps) {
  return (
    <div className="space-y-8">
      <Section title="Continue Learning" items={continueLearning} />
      <Section
        title="Recommended For You"
        items={recommended.map((r) => ({ ...r, badge: r.badge || 'For you' }))}
      />
      <Section
        title="Popular Paths"
        items={popular.map((path) => ({ path, badge: 'Popular' }))}
      />
      <Section
        title="New Paths"
        items={newest.map((path) => ({ path, badge: 'New' }))}
      />
      <Section title="Recently Completed" items={completed} />
    </div>
  )
}
