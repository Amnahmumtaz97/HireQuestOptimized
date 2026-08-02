'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Clock, MapPin } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import { PathRoadmap } from '@/components/app/learning-paths/PathRoadmap'
import { StageView } from '@/components/app/learning-paths/StageView'
import type {
  LearningPath,
  UserPathProgress,
} from '@/components/app/learning-paths/types'
import { PATH_CATEGORY_LABELS, PATH_SUBCATEGORIES } from '@/lib/learning-paths/constants'

function subcategoryLabel(key: string | undefined): string | null {
  if (!key) return null
  const hit = PATH_SUBCATEGORIES.find((s) => s.key === key)
  return hit?.label || key.replace(/_/g, ' ')
}

function backHrefForPath(path: LearningPath): { href: string; label: string } {
  if (path.subcategory === 'pakistan' || path.tags?.includes('pakistan')) {
    return {
      href: '/app/learning-paths/categories/pakistan?tag=pakistan&category=company',
      label: 'Top 30 Companies IT (Pakistan)',
    }
  }
  if (path.category === 'company') {
    return { href: '/app/learning-paths', label: 'Learning paths' }
  }
  return { href: '/app/learning-paths', label: 'Learning paths' }
}

export function PathDetailPage({ pathId }: { pathId: string }) {
  const toast = useToast()
  const [path, setPath] = useState<LearningPath | null>(null)
  const [progress, setProgress] = useState<UserPathProgress | null>(null)
  const [activeStageId, setActiveStageId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/paths/${pathId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to load path')
      setPath(data.path)
      setProgress(data.progress)
      const stages = (data.path?.stages ?? []) as LearningPath['stages']
      const preferred =
        data.progress?.currentStageId ||
        stages.find((s) => !data.progress?.completedStageIds?.includes(s.id))?.id ||
        stages[0]?.id ||
        null
      setActiveStageId(preferred)
      setError('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load path')
    } finally {
      setLoading(false)
    }
  }, [pathId])

  useEffect(() => {
    void load()
  }, [load])

  const activeStage = useMemo(
    () => path?.stages.find((s) => s.id === activeStageId) ?? null,
    [path, activeStageId],
  )

  const analytics = progress?.analytics
  const back = path ? backHrefForPath(path) : null
  const subLabel = path ? subcategoryLabel(path.subcategory) : null
  const isPakistan = Boolean(
    path?.subcategory === 'pakistan' || path?.tags?.includes('pakistan'),
  )

  async function enroll() {
    setEnrolling(true)
    try {
      const res = await fetch(`/api/paths/${pathId}/enroll`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Enroll failed')
      setProgress(data.progress)
      if (data.progress?.currentStageId) {
        setActiveStageId(data.progress.currentStageId)
      }
      toast.success('Enrolled in path')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Enroll failed')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 w-40 rounded bg-input/40" />
        <div className="h-36 rounded-2xl bg-input/30" />
        <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="h-64 rounded-2xl bg-input/30" />
          <div className="h-64 rounded-2xl bg-input/30" />
        </div>
      </div>
    )
  }

  if (error || !path || !back) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{error || 'Path not found'}</p>
        <Link
          href="/app/learning-paths"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Learning paths
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-up space-y-6">
      <nav className="flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/app/learning-paths" className="shrink-0 hover:text-foreground hover:underline">
          Learning paths
        </Link>
        <span aria-hidden>/</span>
        <Link href={back.href} className="min-w-0 truncate hover:text-foreground hover:underline">
          {back.label}
        </Link>
        <span aria-hidden>/</span>
        <span className="min-w-0 truncate font-medium text-foreground">{path.title}</span>
      </nav>

      <div
        className={[
          'relative overflow-hidden rounded-2xl border border-border p-5 sm:p-6',
          isPakistan
            ? 'bg-gradient-to-br from-primary/10 via-card to-card'
            : 'bg-card',
        ].join(' ')}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Link
              href={back.href}
              className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to {back.label.toLowerCase()}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              {isPakistan ? (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Building2 className="h-4 w-4" />
                </span>
              ) : null}
              <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {path.title}
              </h1>
            </div>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {path.description}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-1">
                {PATH_CATEGORY_LABELS[path.category] || path.category}
              </span>
              {subLabel ? (
                <span className="rounded-full border border-border bg-background/60 px-2.5 py-1">
                  {subLabel}
                </span>
              ) : null}
              {path.difficultyLabel ? (
                <span className="rounded-full border border-border bg-background/60 px-2.5 py-1">
                  {path.difficultyLabel}
                </span>
              ) : null}
              {typeof path.estimatedMinutes === 'number' ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-1">
                  <Clock className="h-3 w-3" />~{path.estimatedMinutes} min
                </span>
              ) : null}
              <span className="rounded-full border border-border bg-background/60 px-2.5 py-1">
                {path.stages.length} stages
              </span>
              {progress ? (
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 capitalize text-primary">
                  {progress.status.replace('_', ' ')}
                </span>
              ) : null}
            </div>
            {analytics ? (
              <div className="mt-4 max-w-md">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Module progress</span>
                  <span>{analytics.completionPercent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-input/50">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${analytics.completionPercent}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
          {!progress ? (
            <LoadingButton
              type="button"
              loading={enrolling}
              loadingLabel="Enrolling..."
              onClick={() => void enroll()}
              className="hq-btn-primary h-11 w-full shrink-0 rounded-full px-6 text-sm sm:w-auto"
            >
              Enroll in path
            </LoadingButton>
          ) : null}
        </div>
      </div>

      {progress && analytics ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Completion', value: `${analytics.completionPercent}%` },
            { label: 'Path XP', value: String(analytics.xpEarned) },
            {
              label: 'Strongest',
              value: analytics.strongestStage
                ? `${analytics.strongestStage.title} (${analytics.strongestStage.score})`
                : '—',
            },
            {
              label: 'Focus next',
              value:
                analytics.recommendedTopics[0] ||
                analytics.weakestStage?.title ||
                '—',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-border bg-card/80 px-4 py-3"
            >
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </div>
              <div className="mt-1 text-sm font-semibold text-foreground line-clamp-2">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
        <aside className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="text-sm font-semibold text-foreground">Roadmap</div>
            {isPakistan ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                <MapPin className="h-3 w-3" /> Top 30 IT (PK)
              </span>
            ) : null}
          </div>
          <PathRoadmap
            stages={path.stages}
            progress={progress}
            activeStageId={activeStageId}
            onSelectStage={setActiveStageId}
          />
        </aside>
        <div>
          {activeStage ? (
            <StageView
              path={path}
              stage={activeStage}
              progress={progress}
              onProgressUpdated={(next) => {
                setProgress(next)
                if (next.currentStageId) setActiveStageId(next.currentStageId)
              }}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Select a stage on the roadmap.</p>
          )}
        </div>
      </div>
    </div>
  )
}
