'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Briefcase, ChevronDown, ChevronUp, Flag, ListChecks } from 'lucide-react'
import type { InterviewConfig } from '@/components/app/dashboard/types'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { InterviewQuestionMarkdown } from '@/components/app/interview/InterviewQuestionMarkdown'
import { formatGeneratedQuestion } from '@/lib/interview-questions/clean-question-text'
import { formatDifficultyLabel, formatInterviewTypeLabel, formatIndustryDisplay, formatRoleCategoryDisplay, formatQuestionTypeLabel } from '@/utils/dashboard/interview-labels'
import { BounceLoader } from '@/components/ui/bounce-loader'

type ResultsSession = {
  _id: string
  status: string
  industryKey: string
  roleCategoryKey: string
  interviewType: string
  interviewTypes?: Array<'technical' | 'behavioral' | 'hr'>
  difficulty: string
  totalQuestions: number
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

  const answerByIndex = useMemo(() => {
    const map = new Map<number, string>()
    for (const a of session?.answers ?? []) map.set(a.index, a.answer)
    return map
  }, [session?.answers])

  const flagged = useMemo(() => new Set(session?.flaggedQuestionIndexes ?? []), [session?.flaggedQuestionIndexes])

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
        <div className="text-sm text-red-400">{error || 'Interview not found.'}</div>
        <Link
          href="/app/interviews"
          className="hq-btn-outline h-10 px-4 text-sm btn-micro"
        >
          <ArrowLeft className="h-4 w-4" /> Back to interviews
        </Link>
      </div>
    )
  }

  const isCompleted = session.status === 'completed'

  return (
    <>
      <DashboardPageHeader
        title="Interview Results"
        description="Summary and stats below. Use Review answers when you want to see full questions and responses."
      />

      <div className="space-y-6 animate-fade-up">
        {!isCompleted ? (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            This interview is not marked complete yet.{' '}
            <Link href={`/app/interviews/${id}`} className="font-semibold text-primary underline-offset-2 hover:underline">
              Continue interview
            </Link>
          </div>
        ) : null}

        <div className="dashboard-card p-6">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl stat-icon-blue">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <div className="text-lg font-semibold text-foreground">
                {formatRoleCategoryDisplay(session.industryKey, session.roleCategoryKey, interviewConfigs)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatIndustryDisplay(session.industryKey, interviewConfigs)} · {formatInterviewTypeLabel(session.interviewType)} ·{' '}
                {formatDifficultyLabel(session.difficulty)}
              </div>
            </div>
            <span className={`ml-auto rounded-full border px-2.5 py-0.5 text-[10px] font-semibold badge-${session.status.replace('_', '-')}`}>
              {session.status.replace('_', ' ')}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-input/15 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                Progress
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {answeredCount}/{session.questions?.length ?? session.totalQuestions}
              </div>
              <div className="text-xs text-muted-foreground">Questions answered</div>
            </div>
            <div className="rounded-xl border border-border bg-input/15 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                Flagged
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">{flagged.size}</div>
              <div className="text-xs text-muted-foreground">Marked for review</div>
            </div>
            <div className="rounded-xl border border-border bg-input/15 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">
                Score
              </div>
              <div className="mt-1 text-2xl font-bold text-muted-foreground">—</div>
              <div className="text-xs text-muted-foreground">Auto-scoring coming soon</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <h2 className="mb-4 text-base font-semibold text-foreground">
            Feedback
          </h2>
          <p className="text-sm text-muted-foreground">
            Personalized feedback and improvement tips will appear here once scoring is enabled.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-input/10 p-4 sm:p-5">
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
                    className="rounded-2xl border border-border bg-input/10 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Q{i + 1} · {q.topic} · {formatQuestionTypeLabel(q.type)} · {q.difficulty}
                      </div>
                      {flagged.has(i) ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-200">
                          <Flag className="h-3 w-3" /> Flagged
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 text-sm">
                      <InterviewQuestionMarkdown markdown={formatGeneratedQuestion(q.question)} />
                    </div>
                    <div className="mt-3 rounded-xl border border-border bg-input/20 p-3 text-sm text-foreground/90">
                      {hasAnswer ? ans : <span className="text-muted-foreground">Not answered</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/app/interviews"
            className="hq-btn-outline h-10 px-4 text-sm btn-micro"
          >
            <ArrowLeft className="h-4 w-4" /> All interviews
          </Link>
        </div>
      </div>
    </>
  )
}
