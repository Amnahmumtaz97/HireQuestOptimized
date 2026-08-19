'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flag,
  ListChecks,
  Sparkles,
  Target,
} from 'lucide-react'
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

  const questionCount = session?.questions?.length ?? session?.totalQuestions ?? 0
  const completionPercent = questionCount > 0 ? Math.round((answeredCount / questionCount) * 100) : 0
  const topicBreakdown = useMemo(() => {
    const map = new Map<string, { total: number; answered: number }>()
    for (const [questionIndex, question] of (session?.questions ?? []).entries()) {
      const current = map.get(question.topic) ?? { total: 0, answered: 0 }
      current.total += 1
      if ((answerByIndex.get(questionIndex) ?? '').trim()) current.answered += 1
      map.set(question.topic, current)
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 5)
  }, [answerByIndex, session?.questions])

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
    <div className="hq-results-page animate-fade-up">
      <header className="hq-results-header">
        <div>
          <div className="hq-results-eyebrow">INTERVIEW COMPLETED</div>
          <h1>Results summary</h1>
          <p>{isPathInterview ? 'Your session is complete. Continue your learning path when you are ready.' : 'Here is a clear breakdown of your interview session.'}</p>
        </div>
        <div className="hq-results-header__actions">
          <Link href={`/app/interviews/${id}`} className="hq-btn-outline h-10 px-4 text-sm btn-micro">
            <ArrowLeft className="h-4 w-4" /> Review interview
          </Link>
          <Link href={`/app/new-interview?type=${encodeURIComponent(session.interviewType)}`} className="hq-btn-primary h-10 px-4 text-sm btn-micro">
            <Sparkles className="h-4 w-4" /> Retake interview
          </Link>
        </div>
      </header>

      <div className="space-y-5">
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

        <section className="hq-results-hero">
          <div className="hq-results-hero__identity">
            <span className="hq-results-icon"><Briefcase className="h-5 w-5" /></span>
            <div>
              <h2>{formatInterviewSessionTitle(session, interviewConfigs)}</h2>
              <p>{formatIndustryDisplay(session.industryKey, interviewConfigs)} · {formatInterviewTypeLabel(session.interviewType)} · {formatDifficultyLabel(session.difficulty)}</p>
            </div>
          </div>
          <div className="hq-results-hero__body">
            <div className="hq-results-score-card">
              <div className="hq-results-score-card__label">Answer coverage</div>
              <div className="hq-results-score-ring" style={{ '--coverage': `${completionPercent * 3.6}deg` } as CSSProperties}>
                <strong>{completionPercent}</strong>
                <span>/100</span>
              </div>
              <div className="hq-results-score-card__caption">
                {completionPercent === 100 ? 'Complete session' : 'Saved response coverage'}
              </div>
            </div>
            <div className="hq-results-hero__stats">
          <div className="hq-results-stat-grid">
            <div className="hq-results-stat"><span>Answer coverage</span><strong>{completionPercent}%</strong><small>{answeredCount} of {questionCount} questions</small><div className="hq-results-meter"><i style={{ width: `${completionPercent}%` }} /></div></div>
            <div className="hq-results-stat"><span>Answered</span><strong className="text-success">{answeredCount}</strong><small>Responses saved</small></div>
            <div className="hq-results-stat"><span>Review queue</span><strong className="text-warning">{flagged.size}</strong><small>Flagged questions</small></div>
            <div className="hq-results-stat"><span>Session state</span><strong className="text-primary">{session.status === 'completed' ? 'Done' : 'Open'}</strong><small>{questionCount} total questions</small></div>
          </div>
            </div>
          </div>
        </section>

        <section className="hq-results-section-grid">
          <div className="hq-results-panel">
            <div className="hq-results-panel__title"><Target className="h-4 w-4 text-primary" /> Topic coverage</div>
            <div className="space-y-4">
              {topicBreakdown.length ? topicBreakdown.map(([topic, stats]) => {
                const percent = Math.round((stats.answered / stats.total) * 100)
                return <div key={topic}><div className="flex justify-between gap-3 text-xs"><span className="truncate text-foreground">{topic}</span><strong className="text-muted-foreground">{percent}%</strong></div><div className="hq-results-meter mt-2"><i style={{ width: `${percent}%` }} /></div></div>
              }) : <p className="text-sm text-muted-foreground">Topic details are not available for this session.</p>}
            </div>
          </div>
          <div className="hq-results-panel">
            <div className="hq-results-panel__title"><ListChecks className="h-4 w-4 text-primary" /> Question status</div>
            <div className="hq-results-status-ring" style={{ '--coverage': `${completionPercent * 3.6}deg` } as CSSProperties}><strong>{answeredCount}</strong><span>answered</span></div>
            <div className="hq-results-status-key"><span><i className="is-answered" /> Answered {answeredCount}</span><span><i className="is-flagged" /> Review {flagged.size}</span><span><i className="is-open" /> Unanswered {Math.max(0, questionCount - answeredCount)}</span></div>
          </div>
          <div className="hq-results-panel">
            <div className="hq-results-panel__title"><CheckCircle2 className="h-4 w-4 text-success" /> Question progress</div>
            <div className="hq-results-question-progress">
              {(session.questions ?? []).slice(0, 12).map((question, questionIndex) => {
                const answered = Boolean(answerByIndex.get(questionIndex)?.trim())
                const isQuestionFlagged = flagged.has(questionIndex)
                return (
                  <div key={`${questionIndex}-${question.topic}`} className="hq-results-question-progress__row">
                    <span className={answered ? 'is-done' : isQuestionFlagged ? 'is-review' : ''}>{questionIndex + 1}</span>
                    <div><div className="hq-results-question-progress__track"><i className={answered ? 'is-done' : isQuestionFlagged ? 'is-review' : ''} /></div><small>{answered ? 'Answered' : isQuestionFlagged ? 'Flagged for review' : 'Unanswered'}</small></div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="hq-results-feedback"><Sparkles className="h-5 w-5 text-primary" /><div><h2>Session feedback</h2><p>Review your saved answers to identify strong areas and questions worth revisiting. Automated scoring is not enabled yet, so no score has been inferred.</p></div><CheckCircle2 className="ml-auto hidden h-6 w-6 text-success sm:block" /></section>

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
                ({questionCount} questions)
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
    </div>
  )
}
