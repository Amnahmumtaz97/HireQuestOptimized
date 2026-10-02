'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Flag,
  ListChecks,
  Loader2,
  Mic,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react'
import { AlertBanner } from '@/components/ui/alert-banner'
import type { InterviewConfig } from '@/components/app/dashboard/types'
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
import type {
  EvaluationFlag,
  EvaluationStatus,
  QuestionEvaluation,
  Rubric,
  SessionEvaluation,
} from '@/lib/evaluation/types'

type ResultsQuestionEvaluation = Omit<QuestionEvaluation, 'evaluatedAt'> & { evaluatedAt?: string }

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
    kind?: 'spoken' | 'coding'
    rubric?: Rubric
    keyPoints?: Array<{ text: string; dimension?: string }>
  }>
  flaggedQuestionIndexes?: number[]
  answers?: Array<{
    index: number
    answer: string
    updatedAt: string
    inputMode?: 'typed' | 'spoken' | 'coding' | null
    evaluation?: ResultsQuestionEvaluation | null
  }>
  evaluationStatus?: EvaluationStatus
  evaluationError?: string | null
  evaluation?: (Omit<SessionEvaluation, 'completedAt'> & { completedAt?: string }) | null
}

const POLL_INTERVAL_MS = 2000
const POLL_MAX_ATTEMPTS = 150 // 5 minutes

/** §20 — every flag has a plain-language explanation. */
const FLAG_LABELS: Record<EvaluationFlag, string> = {
  unanswered: 'Not answered — counted as 0.',
  too_short: 'Too short to grade — counted as 0.',
  echoed_question: 'The answer mostly repeated the question — counted as 0.',
  gibberish: 'The answer did not look like real language — counted as 0.',
  no_solution: 'No working solution was submitted — counted as 0.',
  low_audio_confidence: 'Audio quality was poor: the transcript may contain errors and delivery was not scored.',
  delivery_too_short: 'The recording was too short to measure delivery.',
  ai_grading_failed: 'AI grading did not complete for this answer. Use "Retry AI grading".',
  language_mismatch: 'The answer was not in the interview language — counted as 0.',
  unverified_code: 'Code could not be executed — score is an estimate, capped at 60.',
  hypothetical: 'No specific past event was described — capped at 40.',
  no_answer_key: 'Created before scoring was enabled — content not gradable.',
}

const RUBRIC_LABELS: Record<Rubric, string> = {
  technical: 'Technical',
  coding: 'Coding',
  behavioral: 'Behavioral',
  system_design: 'System design',
  hr: 'HR',
}

const DIMENSION_LABELS: Record<string, string> = {
  correctness: 'Correctness',
  coverage: 'Coverage',
  depth: 'Depth',
  precision: 'Precision',
  tests: 'Tests',
  complexity: 'Complexity',
  edgeCases: 'Edge cases',
  readability: 'Readability',
  situationTask: 'Situation & task',
  action: 'Action',
  result: 'Result',
  ownership: 'Ownership',
  specificity: 'Specificity',
  requirements: 'Requirements',
  components: 'Components',
  scale: 'Scale',
  tradeoffs: 'Trade-offs',
  clarity: 'Clarity',
  roleAlignment: 'Role alignment',
  professionalism: 'Professionalism',
}

function scoreTone(score: number | null): string {
  if (score === null) return 'text-muted-foreground'
  if (score >= 80) return 'text-success'
  if (score >= 60) return 'text-primary'
  if (score >= 40) return 'text-warning'
  return 'text-destructive'
}

function ringStyle(score: number | null): CSSProperties {
  return { '--coverage': `${(score ?? 0) * 3.6}deg` } as CSSProperties
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
  const [evalError, setEvalError] = useState('')
  const [retrying, setRetrying] = useState(false)
  const pollAttempts = useRef(0)
  const evaluateRequested = useRef(false)

  const fetchSession = useCallback(async (): Promise<ResultsSession | null> => {
    if (!id) return null
    const res = await fetch(`/api/interviews/${id}`, { cache: 'no-store' })
    const data = await res.json()
    if (!res.ok) throw new Error((data.message as string) ?? 'Failed to load results')
    return (data.session ?? null) as ResultsSession | null
  }, [id])

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function load() {
      setIsLoading(true)
      setError('')
      try {
        const next = await fetchSession()
        if (!cancelled) setSession(next)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load results')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [fetchSession, id])

  const evaluationStatus: EvaluationStatus = session?.evaluationStatus ?? 'none'
  const isCompleted = session?.status === 'completed'

  const startEvaluation = useCallback(
    async (force: boolean) => {
      if (!id) return
      setEvalError('')
      const res = await fetch(`/api/interviews/${id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      if (!res.ok && res.status !== 202) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data.message as string) ?? 'Could not start evaluation')
      }
      pollAttempts.current = 0
      setSession((prev) => (prev ? { ...prev, evaluationStatus: 'running' } : prev))
    },
    [id],
  )

  // §23 — kick off scoring once, then poll until ready|failed.
  useEffect(() => {
    if (!session || !isCompleted) return
    if (evaluationStatus !== 'none' && evaluationStatus !== 'pending') return
    if (evaluateRequested.current) return
    evaluateRequested.current = true
    startEvaluation(false).catch((e) => setEvalError(e instanceof Error ? e.message : 'Could not start evaluation'))
  }, [evaluationStatus, isCompleted, session, startEvaluation])

  useEffect(() => {
    if (!isCompleted || evaluationStatus !== 'running') return
    let cancelled = false
    const timer = window.setInterval(async () => {
      pollAttempts.current += 1
      if (pollAttempts.current > POLL_MAX_ATTEMPTS) {
        window.clearInterval(timer)
        if (!cancelled) setEvalError('Scoring is taking longer than expected. Refresh to check again.')
        return
      }
      try {
        const next = await fetchSession()
        if (!cancelled && next) setSession(next)
      } catch {
        /* keep polling */
      }
    }, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [evaluationStatus, fetchSession, isCompleted])

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

  // Path progress moves only after evaluation, so reload it when the score lands.
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
  }, [session?.learningPathId, evaluationStatus])

  const answerByIndex = useMemo(() => {
    const map = new Map<number, NonNullable<ResultsSession['answers']>[number]>()
    for (const a of session?.answers ?? []) map.set(a.index, a)
    return map
  }, [session?.answers])

  const flagged = useMemo(
    () => new Set(session?.flaggedQuestionIndexes ?? []),
    [session?.flaggedQuestionIndexes],
  )

  const questionCount = session?.questions?.length ?? session?.totalQuestions ?? 0
  const evaluation = evaluationStatus === 'ready' ? session?.evaluation ?? null : null
  const answeredCount = useMemo(() => {
    let c = 0
    for (let i = 0; i < questionCount; i++) {
      if ((answerByIndex.get(i)?.answer ?? '').trim()) c++
    }
    return c
  }, [answerByIndex, questionCount])

  const anyAiFailed = useMemo(
    () => (session?.answers ?? []).some((a) => a.evaluation?.flags?.includes('ai_grading_failed')),
    [session?.answers],
  )

  const topicScores = useMemo(() => {
    const entries = Object.entries(evaluation?.byTopic ?? {})
    return entries.sort((a, b) => a[1] - b[1]).slice(0, 8)
  }, [evaluation?.byTopic])

  const handleRetry = async () => {
    setRetrying(true)
    try {
      await startEvaluation(true)
    } catch (e) {
      setEvalError(e instanceof Error ? e.message : 'Could not restart evaluation')
    } finally {
      setRetrying(false)
    }
  }

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

  const isPathInterview = Boolean(session.learningPathId)
  const exitHref = interviewExitHref(session)
  const scoring = isCompleted && (evaluationStatus === 'running' || evaluationStatus === 'pending' || evaluationStatus === 'none')
  const contentScore = evaluation?.contentScore ?? null
  const deliveryScore = evaluation?.deliveryScore ?? null
  const hasSpoken = (session.answers ?? []).some((a) => a.inputMode === 'spoken')

  return (
    <div className="hq-results-page animate-fade-up">
      <header className="hq-results-header">
        <div>
          <div className="hq-results-eyebrow">{scoring ? 'SCORING YOUR ANSWERS' : 'INTERVIEW COMPLETED'}</div>
          <h1>Results summary</h1>
          <p>
            {isPathInterview
              ? 'Your session is complete. Continue your learning path when you are ready.'
              : 'Content and delivery are scored separately so you know exactly what to practise.'}
          </p>
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

        {evaluationStatus === 'failed' || evalError ? (
          <AlertBanner variant="warning">
            <span className="inline-flex flex-wrap items-center gap-3">
              <span>
                <AlertTriangle className="mr-1 inline h-4 w-4" />
                {evalError || session.evaluationError || 'Scoring failed.'}
              </span>
              <button type="button" onClick={() => void handleRetry()} disabled={retrying} className="hq-btn-outline h-8 px-3 text-xs btn-micro">
                <RefreshCw className={`h-3 w-3${retrying ? ' animate-spin' : ''}`} /> Retry scoring
              </button>
            </span>
          </AlertBanner>
        ) : null}

        {evaluationStatus === 'ready' && anyAiFailed ? (
          <AlertBanner variant="warning">
            <span className="inline-flex flex-wrap items-center gap-3">
              <span>Some answers could not be AI-graded, so this score is partial and does not unlock path stages yet.</span>
              <button type="button" onClick={() => void handleRetry()} disabled={retrying} className="hq-btn-outline h-8 px-3 text-xs btn-micro">
                <RefreshCw className={`h-3 w-3${retrying ? ' animate-spin' : ''}`} /> Retry AI grading
              </button>
            </span>
          </AlertBanner>
        ) : null}

        {evaluationStatus === 'ready' && evaluation && evaluation.ungradableCount > 0 && !anyAiFailed ? (
          <AlertBanner variant="info">
            {evaluation.ungradableCount} question{evaluation.ungradableCount === 1 ? ' was' : 's were'} created before scoring was enabled and could not be content-graded. This session does not count toward learning-path unlocks.
          </AlertBanner>
        ) : null}

        {isPathInterview && isCompleted && evaluationStatus === 'ready' ? (
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
          <div className="hq-results-hero__body hq-results-hero__body--two-rings">
            <div className="hq-results-rings">
              <div className="hq-results-score-card">
                <div className="hq-results-score-card__label">Content</div>
                <div className={`hq-results-score-ring${scoring ? ' hq-results-score-ring--pending' : ''}`} style={ringStyle(contentScore)}>
                  {scoring ? (
                    <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Scoring" />
                  ) : (
                    <>
                      <strong>{contentScore ?? '—'}</strong>
                      <span>/100</span>
                    </>
                  )}
                </div>
                <div className="hq-results-score-card__caption">
                  {scoring
                    ? 'Grading against the answer key…'
                    : anyAiFailed
                      ? 'Partial — retry AI grading'
                      : contentScore === null
                        ? 'Not gradable'
                        : 'What you said'}
                </div>
              </div>
              <div className="hq-results-score-card">
                <div className="hq-results-score-card__label">Delivery</div>
                <div className={`hq-results-score-ring hq-results-score-ring--delivery${scoring ? ' hq-results-score-ring--pending' : ''}`} style={ringStyle(deliveryScore)}>
                  {scoring ? (
                    <Loader2 className="h-7 w-7 animate-spin text-primary" aria-label="Scoring" />
                  ) : (
                    <>
                      <strong>{deliveryScore ?? '—'}</strong>
                      <span>{deliveryScore === null ? '' : '/100'}</span>
                    </>
                  )}
                </div>
                <div className="hq-results-score-card__caption hq-results-score-card__caption--muted">
                  {scoring ? 'Pace, fillers, pauses' : deliveryScore === null ? (hasSpoken ? 'Not enough audio' : 'Typed answers') : 'How you said it'}
                </div>
              </div>
            </div>
            <div className="hq-results-hero__stats">
              <div className="hq-results-stat-grid">
                <div className="hq-results-stat"><span>Answered</span><strong className="text-success">{answeredCount}</strong><small>of {questionCount} questions</small><div className="hq-results-meter"><i style={{ width: `${questionCount ? (answeredCount / questionCount) * 100 : 0}%` }} /></div></div>
                <div className="hq-results-stat"><span>Graded</span><strong className="text-primary">{evaluation ? evaluation.gradedCount : scoring ? '…' : '—'}</strong><small>{evaluation?.ungradableCount ? (anyAiFailed ? `${evaluation.ungradableCount} awaiting AI grading` : `${evaluation.ungradableCount} not gradable`) : 'Scored answers'}</small></div>
                <div className="hq-results-stat"><span>Review queue</span><strong className="text-warning">{flagged.size}</strong><small>Flagged questions</small></div>
                <div className="hq-results-stat"><span>Path unlock</span><strong className={evaluation?.pathEligible ? 'text-success' : 'text-muted-foreground'}>{evaluation ? (evaluation.pathEligible ? 'Counts' : 'Held') : '—'}</strong><small>{isPathInterview ? 'Content score gates progress' : 'Not a path interview'}</small></div>
              </div>
            </div>
          </div>
        </section>

        <section className="hq-results-section-grid">
          <div className="hq-results-panel">
            <div className="hq-results-panel__title"><Target className="h-4 w-4 text-primary" /> Topic scores</div>
            <div className="space-y-4">
              {topicScores.length ? topicScores.map(([topic, score]) => (
                <div key={topic}>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="truncate text-foreground">{topic}</span>
                    <strong className={scoreTone(score)}>{score}</strong>
                  </div>
                  <div className="hq-results-meter mt-2"><i style={{ width: `${score}%` }} /></div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">
                  {scoring ? 'Topic scores appear once grading finishes.' : 'No topic scores for this session.'}
                </p>
              )}
            </div>
          </div>

          <div className="hq-results-panel">
            <div className="hq-results-panel__title"><TrendingUp className="h-4 w-4 text-success" /> Strengths &amp; gaps</div>
            {evaluation ? (
              <div className="space-y-4 text-sm">
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-success">Strengths</div>
                  {evaluation.strengths.length ? (
                    <ul className="space-y-1">
                      {evaluation.strengths.map((s) => <li key={s} className="flex gap-2 text-foreground"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />{s}</li>)}
                    </ul>
                  ) : <p className="text-muted-foreground">Nothing scored 80+ yet.</p>}
                </div>
                <div>
                  <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-warning">Gaps</div>
                  {evaluation.gaps.length ? (
                    <ul className="space-y-1">
                      {evaluation.gaps.map((g) => <li key={g} className="flex gap-2 text-foreground"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />{g}</li>)}
                    </ul>
                  ) : <p className="text-muted-foreground">No topic or dimension fell below 60.</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{scoring ? 'Analysing your answers…' : 'Not available.'}</p>
            )}
          </div>

          <div className="hq-results-panel">
            <div className="hq-results-panel__title"><ListChecks className="h-4 w-4 text-primary" /> Practise next</div>
            {evaluation?.nextTopics.length ? (
              <ol className="space-y-2 text-sm">
                {evaluation.nextTopics.map((t, i) => (
                  <li key={t} className="flex items-center gap-3 rounded-xl border border-border bg-[var(--background)] px-3 py-2">
                    <span className="text-xs font-bold text-muted-foreground">{i + 1}</span>
                    <span className="text-foreground">{t}</span>
                    <span className={`ml-auto text-xs font-semibold ${scoreTone(evaluation.byTopic[t] ?? null)}`}>{evaluation.byTopic[t]}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted-foreground">
                {evaluation ? 'Every topic scored 60 or above — keep going.' : scoring ? 'Recommendations follow the scores.' : 'Not available.'}
              </p>
            )}
          </div>
        </section>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-5">
          <button
            type="button"
            onClick={() => setShowAnswers((v) => !v)}
            className="hq-btn-outline flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left btn-micro"
            aria-expanded={showAnswers}
          >
            <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
              <ListChecks className="h-4 w-4 text-primary" />
              {showAnswers ? 'Hide question breakdown' : 'Question breakdown'}
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
                const entry = answerByIndex.get(i)
                const ans = entry?.answer
                const hasAnswer = Boolean(ans?.trim())
                const ev = evaluationStatus === 'ready' ? entry?.evaluation ?? null : null
                const rubric = q.rubric ?? (q.kind === 'coding' ? 'coding' : null)
                // Without an AI observation there are no real dimension scores or
                // missed points to show — only the flag explaining why.
                const aiFailed = Boolean(ev?.flags.includes('ai_grading_failed'))
                const showDetail = Boolean(ev) && !aiFailed && ev?.contentScore !== null
                const missed = showDetail ? ev?.keyPointsMissed.map((k) => q.keyPoints?.[k]?.text).filter(Boolean) ?? [] : []
                const partial = showDetail ? ev?.keyPointsPartial.map((k) => q.keyPoints?.[k]?.text).filter(Boolean) ?? [] : []
                const unansweredScore = evaluationStatus === 'ready' && !hasAnswer
                return (
                  <div
                    key={`${i}-${q.question.slice(0, 24)}`}
                    className="rounded-2xl border border-border bg-[var(--background)] p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="text-xs font-semibold text-muted-foreground">
                        Q{i + 1} · {q.topic} · {rubric ? RUBRIC_LABELS[rubric] : formatQuestionTypeLabel(q.type)} · {q.difficulty}
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {flagged.has(i) ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-muted px-2 py-0.5 text-[10px] font-semibold text-warning">
                            <Flag className="h-3 w-3" /> Flagged
                          </span>
                        ) : null}
                        {entry?.inputMode === 'spoken' ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            <Mic className="h-3 w-3" /> Spoken
                          </span>
                        ) : null}
                        {ev ? (
                          <>
                            <span className={`hq-results-chip ${scoreTone(ev.contentScore)}`}>
                              Content {ev.contentScore ?? '—'}
                            </span>
                            {ev.deliveryScore !== null ? (
                              <span className={`hq-results-chip ${scoreTone(ev.deliveryScore)}`}>
                                Delivery {ev.deliveryScore}
                              </span>
                            ) : null}
                          </>
                        ) : unansweredScore ? (
                          <span className="hq-results-chip text-destructive">Content 0</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <InterviewQuestionMarkdown
                        markdown={formatGeneratedQuestion(q.question)}
                      />
                    </div>
                    <div className="mt-3 rounded-xl border border-border bg-card p-3 text-sm text-foreground whitespace-pre-wrap">
                      {hasAnswer ? (
                        ans
                      ) : (
                        <span className="text-muted-foreground">Not answered</span>
                      )}
                    </div>

                    {ev ? (
                      <div className="mt-3 space-y-3 text-sm">
                        {showDetail && Object.keys(ev.scores).length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(ev.scores).map(([dim, score]) => (
                              <span key={dim} className="rounded-md border border-border bg-[var(--background)] px-2 py-0.5 text-[11px] text-muted-foreground">
                                {DIMENSION_LABELS[dim] ?? dim}: <strong className={scoreTone(score)}>{Math.round(score)}</strong>
                              </span>
                            ))}
                            {ev.tests ? (
                              <span className="rounded-md border border-border bg-[var(--background)] px-2 py-0.5 text-[11px] text-muted-foreground">
                                Tests: <strong>{ev.tests.publicPassed}/{ev.tests.publicTotal} public · {ev.tests.hiddenPassed}/{ev.tests.hiddenTotal} hidden</strong>
                              </span>
                            ) : null}
                          </div>
                        ) : null}

                        {ev.flags.length ? (
                          <ul className="space-y-1">
                            {ev.flags.map((f) => (
                              <li key={f} className="flex gap-2 text-xs text-warning">
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                {FLAG_LABELS[f] ?? f}
                              </li>
                            ))}
                          </ul>
                        ) : null}

                        {missed.length || partial.length ? (
                          <div className="rounded-xl border border-warning/30 bg-warning-muted/40 p-3">
                            {missed.length ? (
                              <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-warning">You missed</div>
                                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-foreground">
                                  {missed.map((m) => <li key={m}>{m}</li>)}
                                </ul>
                              </div>
                            ) : null}
                            {partial.length ? (
                              <div className={missed.length ? 'mt-2' : ''}>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Partly covered</div>
                                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-foreground">
                                  {partial.map((m) => <li key={m}>{m}</li>)}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        {ev.tips.length ? (
                          <div className="rounded-xl border border-primary/25 bg-primary/5 p-3">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">Coaching</div>
                            <ul className="mt-1 space-y-1 text-foreground">
                              {ev.tips.map((t) => <li key={t} className="flex gap-2"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />{t}</li>)}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
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
