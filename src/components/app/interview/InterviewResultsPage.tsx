'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, ChevronDown, ChevronUp, Flag, ListChecks } from 'lucide-react'
import { AlertBanner } from '@/components/ui/alert-banner'
import type { InterviewConfig } from '@/components/app/dashboard/types'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { InterviewQuestionMarkdown } from '@/components/app/interview/InterviewQuestionMarkdown'
import { PathResultsContinue } from '@/components/app/learning-paths/PathResultsContinue'
import type {
  LearningPath,
  UserPathProgress,
} from '@/components/app/learning-paths/types'
import { formatGeneratedQuestion } from '@/lib/interview-questions/clean-question-text'
import {
  formatDifficultyLabel,
  formatInterviewTypeLabel,
  formatIndustryDisplay,
  formatInterviewSessionTitle,
  formatQuestionTypeLabel,
} from '@/utils/dashboard/interview-labels'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { interviewExitHref } from '@/lib/learning-paths/interview-exit'

type ResultsSession = {
  _id: string
  status: string
  industryKey: string
  roleCategoryKey: string
  interviewType: string
  interviewTypes?: Array<'technical' | 'behavioral' | 'hr'>
  topics?: string[]
  codingCategories?: string[]
  behavioralCompetencies?: string[]
  systemDesignTopics?: string[]
  hrSections?: string[]
  difficulty: string
  totalQuestions: number
  learningPathId?: string | null
  learningStageId?: string | null
  questions?: Array<{
    question: string
    type: string
    topic: string
    difficulty: string
  }>
  flaggedQuestionIndexes?: number[]
  answers?: Array<{ index: number; answer: string; updatedAt: string }>
}

export function InterviewResultsPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id
  const [session, setSession] = useState<ResultsSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAnswers, setShowAnswers] = useState(false)
  const [interviewConfigs, setInterviewConfigs] = useState<InterviewConfig[]>([])
  const [path, setPath] = useState<LearningPath | null>(null)
  const [progress, setProgress] = useState<UserPathProgress | null>(null)
  const [pathLoading, setPathLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/interviews/${id}`)
        const data = await res.json()
        if (!res.ok) {
          setError((data.message as string) ?? 'Failed to load results')
          return
        }
        if (!cancelled) setSession((data.session ?? null) as ResultsSession | null)
      } catch {
        if (!cancelled) setError('Failed to load results')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    async function loadConfigs() {
      try {
        const res = await fetch('/api/interview-config')
        const data = await res.json()
        if (!cancelled && res.ok) setInterviewConfigs((data.configs ?? []) as InterviewConfig[])
      } catch {
        /* ignore */
      }
    }
    void loadConfigs()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const pathId = session?.learningPathId?.trim()
    if (!pathId) {
      setPath(null)
      setProgress(null)
      return
    }
    let cancelled = false
    async function loadPath() {
      setPathLoading(true)
      try {
        const res = await fetch(`/api/paths/${pathId}`)
        const data = await res.json()
        if (!res.ok) return
        if (!cancelled) {
          setPath((data.path ?? null) as LearningPath | null)
          setProgress((data.progress ?? null) as UserPathProgress | null)
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setPathLoading(false)
      }
    }
    void loadPath()
    return () => {
      cancelled = true
    }
  }, [session?.learningPathId])

  const answerByIndex = useMemo(() => {
    const map = new Map<number, string>()
    for (const a of session?.answers ?? []) map.set(a.index, a.answer)
    return map
  }, [session?.answers])

  const flagged = useMemo(
    () => new Set(session?.flaggedQuestionIndexes ?? []),
    [session?.flaggedQuestionIndexes],
  )

  const answeredCount = useMemo(() => {
    const n = session?.questions?.length ?? 0
    let c = 0
    for (let i = 0; i < n; i++) {
      if ((answerByIndex.get(i) ?? '').trim()) c++
    }
    return c
  }, [answerByIndex, session?.questions?.length])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <BounceLoader label="Loading results" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-destructive">
          {error || 'Interview not found.'}
        </div>
        <Link
          href="/app/learning-paths"
          className="hq-btn-outline h-10 px-4 text-sm btn-micro"
        >
          <ArrowLeft className="h-4 w-4" /> Learning paths
        </Link>
      </div>
    )
  }

  const isCompleted = session.status === 'completed'
  const isPathInterview = Boolean(session.learningPathId)
  const exitHref = interviewExitHref(session)

  return (
    <>
      <DashboardPageHeader
        title="Interview Results"
        description={
          isPathInterview
            ? 'Review this session, then continue to the next stage on your learning path.'
            : 'Summary and stats below. Use Review answers when you want to see full questions and responses.'
        }
      />

      <div className="space-y-6 animate-fade-up">
        {!isCompleted ? (
          <AlertBanner variant="warning">
            This interview is not marked complete yet.{' '}
            <Link
              href={`/app/interviews/${id}`}
              className="font-semibold underline underline-offset-2"
            >
              Continue interview →
            </Link>
          </AlertBanner>
        ) : null}

        {isPathInterview && isCompleted ? (
          pathLoading ? (
            <div className="h-36 animate-pulse rounded-2xl border border-border bg-input/30" />
          ) : path ? (
            <PathResultsContinue path={path} progress={progress} />
          ) : (
            <Link
              href={exitHref}
              className="hq-btn-primary inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold"
            >
              Back to path
            </Link>
          )
        ) : null}

        <div className="dashboard-card p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl stat-icon-blue">
              <Briefcase className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-semibold text-foreground">
                {formatInterviewSessionTitle(session, interviewConfigs)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatIndustryDisplay(session.industryKey, interviewConfigs)} ·{' '}
                {formatInterviewTypeLabel(session.interviewType)} ·{' '}
                {formatDifficultyLabel(session.difficulty)}
              </div>
            </div>
            <span
              className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold badge-${session.status.replace('_', '-')}`}
            >
              {session.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Progress
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {answeredCount}/{session.questions?.length ?? session.totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground">Questions answered</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Flagged
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">{flagged.size}</div>
              <div className="text-xs text-muted-foreground">Marked for review</div>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Score
              </div>
              <div className="mt-1 text-2xl font-bold text-muted-foreground">—</div>
              <div className="text-xs text-muted-foreground">Auto-scoring coming soon</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">Feedback</h2>
          <p className="text-sm text-muted-foreground">
            Personalized feedback and improvement tips will appear here once scoring is enabled.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
          <button
            type="button"
            onClick={() => setShowAnswers((v) => !v)}
            className="hq-btn-outline flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left btn-micro"
            aria-expanded={showAnswers}
          >
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              <ListChecks className="h-4 w-4 text-primary" />
              {showAnswers ? 'Hide answers' : 'Review answers'}
              <span className="text-xs font-normal text-muted-foreground">
                ({session.questions?.length ?? 0} questions)
              </span>
            </span>
            {showAnswers ? (
              <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
          </button>

          {showAnswers ? (
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              {(session.questions ?? []).map((q, i) => {
                const ans = answerByIndex.get(i)
                const hasAnswer = Boolean(ans?.trim())
                return (
                  <div
                    key={`${i}-${q.question.slice(0, 24)}`}
                    className="rounded-2xl border border-border bg-[var(--background)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Q{i + 1} · {q.topic} · {formatQuestionTypeLabel(q.type)} · {q.difficulty}
                      </div>
                      {flagged.has(i) ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-muted px-2 py-0.5 text-[10px] font-semibold text-warning">
                          <Flag className="h-3 w-3" /> Flagged
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm">
                      <InterviewQuestionMarkdown
                        markdown={formatGeneratedQuestion(q.question)}
                      />
                    </div>
                    <div className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-foreground">
                      {hasAnswer ? (
                        ans
                      ) : (
                        <span className="text-muted-foreground">Not answered</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        {!isPathInterview ? (
          <div className="flex flex-wrap gap-2">
            <Link href="/app/interviews" className="hq-btn-outline h-10 px-4 text-sm btn-micro">
              <ArrowLeft className="h-4 w-4" /> Back to interviews
            </Link>
          </div>
        ) : null}
      </div>
    </>
  )
}
