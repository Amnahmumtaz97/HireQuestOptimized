'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BookOpen, MessageSquare, Sparkles, Target } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import {
  getStageUiState,
  type LearningPath,
  type LearningStage,
  type UserPathProgress,
} from '@/components/app/learning-paths/types'

type StageViewProps = {
  path: LearningPath
  stage: LearningStage
  progress: UserPathProgress | null
  onProgressUpdated: (progress: UserPathProgress) => void
}

export function StageView({ path, stage, progress, onProgressUpdated }: StageViewProps) {
  const toast = useToast()
  const [score, setScore] = useState(
    progress?.stageScores?.[stage.id]?.toString() ?? '75',
  )
  const [saving, setSaving] = useState(false)
  const state = getStageUiState(stage, progress)
  const locked = state === 'locked'
  const alreadyDone = state === 'completed'
  const isInterviewStage = stage.type === 'practice' || stage.type === 'mock_interview'
  const showManualComplete = stage.type === 'concept' || stage.type === 'ai_feedback'

  const interviewHref = `/app/new-interview?mode=path&pathId=${encodeURIComponent(path.id)}&stageId=${encodeURIComponent(stage.id)}`
  const activeRemediation = progress?.analytics?.activeRemediation
  const remediationHref =
    activeRemediation && activeRemediation.sourceStageId === stage.id
      ? `${interviewHref}&remediationId=${encodeURIComponent(activeRemediation.id)}`
      : null

  const Icon =
    stage.type === 'concept'
      ? BookOpen
      : stage.type === 'ai_feedback'
        ? Sparkles
        : stage.type === 'mock_interview'
          ? Target
          : MessageSquare

  async function completeStage() {
    if (!progress) {
      toast.error('Enroll in this path first')
      return
    }
    setSaving(true)
    try {
      const body: { stageId: string; score?: number } = { stageId: stage.id }
      if (typeof stage.unlockMinScore === 'number') {
        const n = Number(score)
        if (Number.isNaN(n)) {
          toast.error('Enter a valid score')
          setSaving(false)
          return
        }
        body.score = n
      } else if (score.trim()) {
        const n = Number(score)
        if (!Number.isNaN(n)) body.score = n
      }

      const res = await fetch(`/api/paths/${path.id}/progress`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.message || 'Could not update progress')
        return
      }
      onProgressUpdated(data.progress)
      toast.success('Stage completed')
    } catch {
      toast.error('Could not update progress')
    } finally {
      setSaving(false)
    }
  }

  if (locked) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-input/5 p-6 text-sm text-muted-foreground">
        This stage is locked. Complete the current stage to unlock it.
      </div>
    )
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-input/10 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold text-foreground">{stage.title}</h2>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {stage.type.replace('_', ' ')}
            {stage.levelLabel ? ` · ${stage.levelLabel}` : ''}
            {alreadyDone ? ' · Completed' : ''}
          </p>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {stage.contentRef || 'No content for this stage yet.'}
      </p>

      {isInterviewStage && (stage.departmentKey || (stage.suggestedTopics?.length ?? 0) > 0) ? (
        <div className="rounded-xl border border-border/60 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
          {stage.departmentKey ? (
            <div>
              Department: <span className="text-foreground">{stage.departmentKey.replace(/_/g, ' ')}</span>
            </div>
          ) : null}
          {stage.suggestedTopics?.length ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {stage.suggestedTopics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border px-2 py-0.5 text-[10px] text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          {stage.difficulty ? (
            <div className="mt-1">
              Difficulty: <span className="text-foreground">{stage.difficulty}</span>
              {stage.interviewType ? ` · ${stage.interviewType}` : ''}
            </div>
          ) : null}
        </div>
      ) : null}

      {activeRemediation && activeRemediation.sourceStageId === stage.id ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          <p className="font-medium">Focus practice recommended</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Score was below 80%. Complete a short focus interview on:{' '}
            {activeRemediation.topics.join(', ')} — then the next stage unlocks.
          </p>
          {remediationHref ? (
            <Link
              href={remediationHref}
              className="hq-btn-primary mt-3 inline-flex h-10 items-center gap-2 rounded-2xl px-4 text-xs font-semibold"
            >
              Start focus practice
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : null}
        </div>
      ) : null}

      {isInterviewStage && !activeRemediation ? (
        <Link
          href={interviewHref}
          className="hq-btn-primary inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-xs font-semibold"
        >
          Start path interview
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}

      {isInterviewStage && activeRemediation && activeRemediation.sourceStageId !== stage.id ? (
        <p className="text-xs text-amber-200/90">
          Finish the active focus practice on the current stage before continuing.
        </p>
      ) : null}

      {stage.type === 'ai_feedback' ? (
        <Link
          href="/app/results"
          className="hq-btn-outline-accent inline-flex h-11 items-center gap-2 rounded-2xl px-5 text-xs font-semibold"
        >
          View results
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}

      {!alreadyDone && progress && showManualComplete ? (
        <div className="space-y-3 border-t border-border pt-4">
          {typeof stage.unlockMinScore === 'number' ? (
            <label className="block space-y-1.5">
              <span className="text-xs text-muted-foreground">
                Score (need ≥ {stage.unlockMinScore} to unlock next)
              </span>
              <input
                type="number"
                min={0}
                max={100}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="h-10 w-full max-w-[140px] rounded-xl border border-border bg-input/30 px-3 text-sm"
              />
            </label>
          ) : null}
          <LoadingButton
            type="button"
            loading={saving}
            loadingLabel="Saving..."
            onClick={() => void completeStage()}
            className="hq-btn-primary h-10 rounded-full px-5 text-sm"
          >
            Mark stage complete
          </LoadingButton>
        </div>
      ) : null}

      {isInterviewStage && !alreadyDone ? (
        <p className="text-xs text-muted-foreground">
          Finish a path-linked interview to complete this stage
          {typeof stage.unlockMinScore === 'number'
            ? ` (need ≥ ${stage.unlockMinScore}% answers completed)`
            : ''}
          . Manual score unlock is disabled for practice and mock stages.
        </p>
      ) : null}
    </div>
  )
}
