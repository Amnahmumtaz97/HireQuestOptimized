'use client'

import Link from 'next/link'
import { Clock, Lock, GraduationCap, Briefcase, Route } from 'lucide-react'
import type { LearningPath, UserPathProgress } from '@/components/app/learning-paths/types'
import { PATH_CATEGORY_LABELS } from '@/lib/learning-paths/constants'

function audienceIcon(audience: string) {
  if (audience === 'experienced') return Briefcase
  if (audience.startsWith('domain:')) return Route
  return GraduationCap
}

type PathCardProps = {
  path: LearningPath
  progress?: UserPathProgress | null
  reason?: string | null
  badge?: string | null
}

export function PathCard({ path, progress, reason, badge }: PathCardProps) {
  const Icon = audienceIcon(path.targetAudience)
  const pct = progress?.analytics?.completionPercent
  const enrolled = Boolean(progress)

  return (
    <Link
      href={`/app/learning-paths/${path.id}`}
      className="dashboard-card block p-5 transition hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-sm font-semibold text-foreground">{path.title}</div>
            {path.difficultyLabel ? (
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {path.difficultyLabel}
              </span>
            ) : null}
            {badge ? (
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                {badge}
              </span>
            ) : null}
            {!enrolled && path.stages.length > 1 ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Progressive unlock
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs capitalize text-muted-foreground">
            {PATH_CATEGORY_LABELS[path.category] || path.category}
            {path.subcategory ? ` · ${path.subcategory.replace(/_/g, ' ')}` : ''}
            {' · '}
            {path.stages.length} modules
            {typeof path.estimatedMinutes === 'number' ? (
              <>
                {' · '}
                <span className="inline-flex items-center gap-0.5">
                  <Clock className="inline h-3 w-3" />~{path.estimatedMinutes}m
                </span>
              </>
            ) : null}
          </div>
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{path.description}</p>
          {reason ? (
            <p className="mt-2 text-xs text-primary">{reason}</p>
          ) : null}
          {typeof pct === 'number' ? (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                <span>{progress?.status === 'completed' ? 'Completed' : 'Progress'}</span>
                <span>{pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-input/40">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
