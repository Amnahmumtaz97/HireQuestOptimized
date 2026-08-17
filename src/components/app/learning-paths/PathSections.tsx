'use client'

import Link from 'next/link'
import {
  Compass,
  Flame,
  Sparkles,
  Star,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { PathCard } from '@/components/app/learning-paths/PathCard'
import { ListPagination } from '@/components/ui/list-pagination'
import { useClientPagination } from '@/hooks/useClientPagination'
import { usePathBookmarks } from '@/hooks/usePathBookmarks'
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
  icon: Icon,
}: {
  title: string
  href?: string
  items: SectionItem[]
  icon: LucideIcon
}) {
  const { page, setPage, pageItems, totalPages } = useClientPagination(items, SECTION_PAGE_SIZE)
  const { isSaved, toggle } = usePathBookmarks()

  if (items.length === 0) return null
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </h2>
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
            saved={isSaved(item.path.id)}
            onToggleSave={toggle}
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
      <Section title="Continue Learning" items={continueLearning} icon={Flame} />
      <Section
        title="Recommended For You"
        items={recommended.map((r) => ({ ...r, badge: r.badge || 'For you' }))}
        icon={Compass}
      />
      <Section
        title="Popular Paths"
        items={popular.map((path) => ({ path, badge: 'Popular' }))}
        icon={Star}
      />
      <Section
        title="New Paths"
        items={newest.map((path) => ({ path, badge: 'New' }))}
        icon={Sparkles}
      />
      <Section title="Completed" items={completed} icon={Trophy} />
    </div>
  )
}
