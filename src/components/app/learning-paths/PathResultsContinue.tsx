'use client'

import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  MapPinned,
  Route,
  Sparkles,
  Target,
} from 'lucide-react'
import type {
  LearningPath,
  LearningStage,
  UserPathProgress,
} from '@/components/app/learning-paths/types'
import { getStageUiState } from '@/components/app/learning-paths/types'

type PathResultsContinueProps = {
  path: LearningPath
  progress: UserPathProgress | null
}

function stageHref(pathId: string, stage: LearningStage) {
  const isInterview = stage.type === 'practice' || stage.type === 'mock_interview'
  if (isInterview) {
    return `/app/new-interview?mode=path&pathId=${encodeURIComponent(pathId)}&stageId=${encodeURIComponent(stage.id)}`
  }
  return `/app/learning-paths/${pathId}`
}

function stageActionLabel(stage: LearningStage) {
  if (stage.type === 'concept') return 'Open briefing'
  if (stage.type === 'ai_feedback') return 'Review feedback stage'
  if (stage.type === 'mock_interview') return 'Start next mock'
  return 'Start next interview'
}

export function PathResultsContinue({ path, progress }: PathResultsContinueProps) {
  const remediation = progress?.analytics?.activeRemediation
  const currentId = progress?.currentStageId
  const nextStage =
    path.stages.find((s) => s.id === currentId) ||
    path.stages.find((s) => getStageUiState(s, progress) === 'current') ||
    null

  const completed =
    progress?.status === 'completed' ||
    (!remediation && !nextStage && Boolean(progress))

  const pct = progress?.analytics?.completionPercent ?? 0

  if (remediation) {
    const href = `/app/new-interview?mode=path&pathId=${encodeURIComponent(path.id)}&stageId=${encodeURIComponent(remediation.sourceStageId)}&remediationId=${encodeURIComponent(remediation.id)}`
    return (
      <section className="relative overflow-hidden rounded-2xl border border-warning/40 bg-gradient-to-br from-warning-muted via-card to-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-warning/15 text-warning">
            <Target className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-warning">
              Focus practice unlocked
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{remediation.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Score was below the focus threshold. Clear this short drill on{' '}
              <span className="text-foreground">
                {remediation.topics.slice(0, 3).join(', ')}
              </span>{' '}
              to unlock the next stage.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={href}
                className="hq-btn-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
              >
                Start focus practice
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/app/learning-paths/${path.id}`}
                className="hq-btn-outline inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm"
              >
                View path roadmap
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (completed) {
    return (
      <section className="relative overflow-hidden rounded-2xl border border-success/35 bg-gradient-to-br from-success-muted/80 via-card to-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-success/15 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-success">
              Path complete
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{path.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              You finished every stage. Pick another path from Top 30 Companies IT (Pakistan) or revisit weak topics.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/app/learning-paths/categories/pakistan?tag=pakistan&category=company"
                className="hq-btn-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
              >
                Top 30 Companies IT (Pakistan)
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/app/learning-paths/${path.id}`}
                className="hq-btn-outline inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm"
              >
                Review this path
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (!nextStage) {
    return (
      <section className="rounded-2xl border border-border bg-card p-5">
        <Link
          href={`/app/learning-paths/${path.id}`}
          className="hq-btn-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
        >
          Continue on path
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    )
  }

  const href = stageHref(path.id, nextStage)

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/12 via-card to-card p-5 sm:p-6">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-primary/10 blur-2xl"
        aria-hidden
      />
      <div className="relative flex flex-wrap items-start gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <Route className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Up next on {path.title}
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{nextStage.title}</h3>
            <p className="mt-1 text-sm capitalize text-muted-foreground">
              {nextStage.type.replace(/_/g, ' ')}
              {nextStage.interviewType
                ? ` · ${nextStage.interviewType.replace(/_/g, ' ')}`
                : ''}
              {nextStage.difficulty ? ` · ${nextStage.difficulty}` : ''}
            </p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <MapPinned className="h-3 w-3" />
                Path progress
              </span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-input/50">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={href}
              className="hq-btn-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-sm"
            >
              {stageActionLabel(nextStage)}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/app/learning-paths/${path.id}`}
              className="hq-btn-outline inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              Open roadmap
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
