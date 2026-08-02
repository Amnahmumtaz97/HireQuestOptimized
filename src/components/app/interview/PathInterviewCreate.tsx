'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ListChecks, Clock, Sparkles } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import type { LearningStage } from '@/components/app/learning-paths/types'

type PathInterviewCreateProps = {
  pathId: string
  stageId: string
  pathTitle?: string | null
  stage: LearningStage
  pathRemediationId?: string | null
}

export function PathInterviewCreate({
  pathId,
  stageId,
  pathTitle,
  stage,
  pathRemediationId = null,
}: PathInterviewCreateProps) {
  const router = useRouter()
  const toast = useToast()
  const [totalQuestions, setTotalQuestions] = useState(
    typeof stage.totalQuestions === 'number' ? stage.totalQuestions : 12,
  )
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [difficulty, setDifficulty] = useState<
    'Easy' | 'Medium' | 'Hard' | 'Adaptive'
  >((stage.difficulty as 'Easy' | 'Medium' | 'Hard' | 'Adaptive') || 'Medium')
  const [creating, setCreating] = useState(false)

  const topics = useMemo(
    () => (stage.suggestedTopics || []).filter(Boolean),
    [stage.suggestedTopics],
  )

  const canGenerate = topics.length > 0 && totalQuestions >= 5 && totalQuestions <= 40

  const generate = async () => {
    if (!canGenerate) {
      toast.error(
        topics.length === 0
          ? 'This stage has no bound topics'
          : 'Enter a valid question count (5–40)',
      )
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/interviews/from-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pathId,
          stageId,
          pathRemediationId: pathRemediationId || null,
          totalQuestions,
          durationMinutes,
          difficulty,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to generate interview')
      toast.success(
        data.source === 'gemini'
          ? `Ready — ${data.questionCount ?? totalQuestions} questions generated`
          : 'Interview created',
      )
      router.push(`/app/interviews/${data.sessionId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not generate interview')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href={`/app/learning-paths/${pathId}`}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs text-muted-foreground hover:bg-input/30"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to path
        </Link>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Path interview</h1>
          <p className="text-xs text-muted-foreground">
            Stage bindings are fixed. Set time and question count, then generate the question bank.
          </p>
        </div>
      </div>

      <div className="dashboard-card space-y-4 p-5">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Path</div>
          <div className="mt-0.5 text-sm font-medium text-foreground">
            {pathTitle || 'Learning path'}
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Stage</div>
          <div className="mt-0.5 text-sm font-medium text-foreground">{stage.title}</div>
          <div className="mt-1 text-xs capitalize text-muted-foreground">
            {stage.type.replace('_', ' ')}
            {stage.interviewType ? ` · ${stage.interviewType}` : ''}
            {stage.departmentKey
              ? ` · ${stage.departmentKey.replace(/_/g, ' ')}`
              : ''}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
            Topics (locked)
          </div>
          {topics.length ? (
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-border bg-input/20 px-2.5 py-0.5 text-[11px] text-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-red-400">
              No topics bound on this stage. An admin must add catalog topics before you can
              generate.
            </p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <ListChecks className="h-3.5 w-3.5" /> Questions
            </span>
            <input
              type="number"
              min={5}
              max={40}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value) || 5)}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Duration (minutes)
            </span>
            <input
              type="number"
              min={5}
              max={180}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value) || 30)}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
          <label className="block space-y-1.5 sm:col-span-2">
            <span className="text-xs text-muted-foreground">Difficulty</span>
            <select
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard' | 'Adaptive')
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Adaptive">Adaptive</option>
            </select>
          </label>
        </div>

        <LoadingButton
          type="button"
          loading={creating}
          loadingLabel="Generating question bank…"
          disabled={!canGenerate}
          onClick={() => void generate()}
          className="hq-btn-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-sm font-semibold"
        >
          <Sparkles className="h-4 w-4" />
          Generate question bank
        </LoadingButton>
      </div>
    </div>
  )
}
