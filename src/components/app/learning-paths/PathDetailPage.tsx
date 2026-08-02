'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import { PathRoadmap } from '@/components/app/learning-paths/PathRoadmap'
import { StageView } from '@/components/app/learning-paths/StageView'
import type {
  LearningPath,
  UserPathProgress,
} from '@/components/app/learning-paths/types'
import { PATH_CATEGORY_LABELS } from '@/lib/learning-paths/constants'

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
    return null
  }

  if (error || !path) {
    return <p className="text-sm text-red-400">{error || 'Path not found'}</p>
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="dashboard-card flex flex-wrap items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-foreground">{path.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{path.description}</p>
          <p className="mt-2 text-xs capitalize text-muted-foreground">
            {PATH_CATEGORY_LABELS[path.category] || path.category}
            {path.difficultyLabel ? ` · ${path.difficultyLabel}` : ''}
            {typeof path.estimatedMinutes === 'number'
              ? ` · ~${path.estimatedMinutes} min`
              : ''}
            {progress ? ` · Status: ${progress.status.replace('_', ' ')}` : ''}
            {analytics?.currentLevelLabel
              ? ` · ${analytics.currentLevelLabel}`
              : ''}
          </p>
          {analytics ? (
            <div className="mt-3 max-w-sm">
              <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                <span>Module progress</span>
                <span>{analytics.completionPercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-input/40">
                <div
                  className="h-full rounded-full bg-primary"
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
            className="hq-btn-primary h-10 rounded-full px-5 text-sm"
          >
            Enroll
          </LoadingButton>
        ) : null}
      </div>

      {progress && analytics ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="dashboard-card p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Completion
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">
              {analytics.completionPercent}%
            </div>
          </div>
          <div className="dashboard-card p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Path XP
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">
              {analytics.xpEarned}
            </div>
          </div>
          <div className="dashboard-card p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Strongest
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {analytics.strongestStage
                ? `${analytics.strongestStage.title} (${analytics.strongestStage.score})`
                : '—'}
            </div>
          </div>
          <div className="dashboard-card p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Weakest / focus
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
              {analytics.recommendedTopics[0] ||
                analytics.weakestStage?.title ||
                '—'}
            </div>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr]">
        <div className="dashboard-card p-5">
          <div className="mb-4 text-sm font-semibold text-foreground">Roadmap</div>
          <PathRoadmap
            stages={path.stages}
            progress={progress}
            activeStageId={activeStageId}
            onSelectStage={setActiveStageId}
          />
        </div>
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
