'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useInterviewSession } from '@/hooks/interview/useInterviewSession'
import { InterviewActions } from '@/components/app/interview/InterviewActions'
import {
  InterviewAnswerEditor,
  type AnswerSaveState,
} from '@/components/app/interview/InterviewAnswerEditor'
import { CodingAnswerEditor } from '@/components/app/interview/CodingAnswerEditor'
import { InterviewQuestionCard } from '@/components/app/interview/InterviewQuestionCard'
import { InterviewQuestionMeta } from '@/components/app/interview/InterviewQuestionMeta'
import {
  InterviewQuestionRail,
  type QuestionRailFilter,
} from '@/components/app/interview/InterviewQuestionRail'
import { InterviewProgressBar } from '@/components/app/interview/InterviewProgressBar'
import { InterviewSessionTimer } from '@/components/app/interview/InterviewSessionTimer'
import { InterviewTopBar } from '@/components/app/interview/InterviewTopBar'
import { interviewExitHref, interviewExitLabel } from '@/lib/learning-paths/interview-exit'
import { useOnceGuidance } from '@/hooks/useOnceGuidance'
import { GUIDANCE_TIPS } from '@/lib/guidance/tips'
import {
  formatDifficultyLabel,
  formatInterviewSessionTitle,
  formatInterviewTypeLabel,
} from '@/utils/dashboard/interview-labels'

/** Quiet enough not to fight the typist, short enough that "Autosaved" feels true. */
const AUTOSAVE_DELAY_MS = 1200

export function InterviewSessionPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const {
    session,
    isLoading,
    error,
    setError,
    isSaving,
    questions,
    index,
    answerMap,
    flaggedSet,
    canShowFinish,
    saveAnswer,
    goToQuestion,
    setFlagged,
    finishInterview,
    regenerateQuestions,
  } = useInterviewSession(id)

  const [answerDraft, setAnswerDraft] = useState('')
  const [railCollapsed, setRailCollapsed] = useState(false)
  const [railFilter, setRailFilter] = useState<QuestionRailFilter>('all')
  const [justSaved, setJustSaved] = useState(false)
  const autoFinishStarted = useRef(false)

  const current = questions[index]
  const busy = isSaving
  const savedAnswer = answerMap.get(index) ?? ''
  const isDirty = answerDraft.trim() !== savedAnswer.trim()

  const sessionGuidance = useMemo(() => {
    if (isLoading || !session || session.status === 'completed') return null
    if (!current) {
      return { key: 'interview-generate', message: GUIDANCE_TIPS['interview-generate'] } as const
    }
    if (current.kind === 'coding') {
      return { key: 'interview-coding', message: GUIDANCE_TIPS['interview-coding'] } as const
    }
    return { key: 'interview-session', message: GUIDANCE_TIPS['interview-session'] } as const
  }, [current, isLoading, session])

  useOnceGuidance(sessionGuidance?.key ?? null, sessionGuidance?.message ?? '', {
    delayMs: 700,
  })

  useEffect(() => {
    if (!session || session.status !== 'completed' || !id) return
    router.replace(`/app/interviews/${id}/results`)
  }, [id, router, session])

  useEffect(() => {
    if (!session) return
    setAnswerDraft(answerMap.get(index) ?? '')
    setJustSaved(false)
  }, [answerMap, index, session])

  /** Debounced background save. Coding answers are saved by the code editor itself. */
  useEffect(() => {
    if (!session || busy || !isDirty) return
    if (!answerDraft.trim()) return
    if (current?.kind === 'coding') return

    const timer = window.setTimeout(() => {
      void saveAnswer(answerDraft, { silent: true }).then((next) => {
        if (next) setJustSaved(true)
      })
    }, AUTOSAVE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [answerDraft, busy, current?.kind, isDirty, saveAnswer, session])

  const isFlagged = flaggedSet.has(index)
  const isLastQuestion = questions.length > 0 && index >= questions.length - 1
  const answeredIndexes = useMemo(() => {
    const set = new Set<number>()
    questions.forEach((_, i) => {
      if (answerMap.get(i)?.trim()) set.add(i)
    })
    return set
  }, [answerMap, questions])
  const unansweredCount = questions.length - answeredIndexes.size

  const saveState: AnswerSaveState = isSaving
    ? 'saving'
    : isDirty
      ? 'dirty'
      : justSaved
        ? 'saved'
        : 'idle'

  const handleSaveAnswer = async () => {
    setError('')
    const next = await saveAnswer(answerDraft)
    if (next) setJustSaved(true)
  }

  const handleToggleFlag = async () => {
    setError('')
    await setFlagged(index, !isFlagged)
  }

  const saveDraftIfAny = useCallback(async (): Promise<boolean> => {
    const trimmed = answerDraft.trim()
    if (!trimmed || trimmed === savedAnswer.trim()) return true
    const next = await saveAnswer(answerDraft)
    return next !== null
  }, [answerDraft, saveAnswer, savedAnswer])

  const handlePrevious = useCallback(async () => {
    if (index <= 0) return
    setError('')
    if (!(await saveDraftIfAny())) return
    await goToQuestion(index - 1)
  }, [goToQuestion, index, saveDraftIfAny, setError])

  const handleNext = useCallback(async () => {
    if (isLastQuestion) return
    setError('')
    if (!(await saveDraftIfAny())) return
    await goToQuestion(index + 1)
  }, [goToQuestion, index, isLastQuestion, saveDraftIfAny, setError])

  const handleFinish = useCallback(async () => {
    if (autoFinishStarted.current) return
    autoFinishStarted.current = true
    setError('')
    try {
      if (!(await saveDraftIfAny())) return
      const next = await finishInterview()
      if (next && id) {
        router.replace(`/app/interviews/${id}/results`)
      }
    } finally {
      autoFinishStarted.current = false
    }
  }, [finishInterview, id, router, saveDraftIfAny, setError])

  const handleQuestionSelect = useCallback(
    async (nextIndex: number) => {
      if (nextIndex === index || busy) return
      setError('')
      if (!(await saveDraftIfAny())) return
      await goToQuestion(nextIndex)
    },
    [busy, goToQuestion, index, saveDraftIfAny, setError],
  )

  /** Alt+arrows move between questions without stealing normal text editing keys. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        void handleNext()
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault()
        void handlePrevious()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handleNext, handlePrevious])

  if (isLoading) {
    return (
      <div className="hq-interview-session hq-iv" aria-busy="true">
        <div className="hq-iv-loading" role="status">
          <span className="hq-iv-loading__bar" aria-hidden="true" />
          Loading interview workspace
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-sm font-medium text-destructive">{error}</div>
        <Link href="/app/learning-paths" className="hq-btn-outline px-4 py-2 text-sm btn-micro">
          <ArrowLeft className="h-4 w-4" /> Learning paths
        </Link>
      </div>
    )
  }

  if (!session) {
    return <div className="p-6 text-sm text-muted-foreground">No interview found.</div>
  }

  const exitHref = interviewExitHref(session)
  const exitLabel = interviewExitLabel(session)

  if (session.status === 'completed') {
    return <div className="p-6 text-sm text-muted-foreground">Redirecting to results…</div>
  }

  if (!current) {
    return (
      <div className="space-y-4 p-6">
        <div className="text-sm text-muted-foreground">No questions yet for this interview.</div>
        <button
          type="button"
          onClick={() => void regenerateQuestions()}
          className="hq-btn-primary px-4 py-2 text-sm btn-micro disabled:opacity-60"
          disabled={busy}
        >
          {busy ? 'Generating…' : 'Generate Questions'}
        </button>
        <Link href={exitHref} className="hq-btn-outline inline-flex px-4 py-2 text-sm btn-micro">
          <ArrowLeft className="h-4 w-4" /> {exitLabel}
        </Link>
      </div>
    )
  }

  const isCoding = current.kind === 'coding' && Boolean(id)

  const title = formatInterviewSessionTitle({
    interviewType: session.interviewType,
    industryKey: session.industryKey,
    roleCategoryKey: session.roleCategoryKey,
    topics: session.topics,
    codingCategories: session.codingCategories,
    behavioralCompetencies: session.behavioralCompetencies,
    systemDesignTopics: session.systemDesignTopics,
    hrSections: session.hrSections,
  })

  const topBarTags = [
    formatInterviewTypeLabel(session.interviewType),
    session.difficulty ? formatDifficultyLabel(session.difficulty) : '',
    `${questions.length} questions`,
  ].filter(Boolean)

  return (
    <div
      className={[
        'hq-interview-session hq-iv',
        isCoding ? 'hq-interview-session--coding hq-iv--coding' : '',
        railCollapsed ? 'hq-iv--rail-collapsed' : '',
      ].join(' ')}
    >
      <InterviewTopBar
        title={title}
        tags={topBarTags}
        exitHref={exitHref}
        exitLabel={exitLabel}
        unansweredCount={unansweredCount}
        flaggedCount={flaggedSet.size}
        onConfirmExit={handleFinish}
        timer={
          <InterviewSessionTimer
            durationMinutes={session.durationMinutes ?? null}
            interviewStartedAt={session.interviewStartedAt ?? undefined}
            status={session.status}
            onTimeExpired={() => void handleFinish()}
          />
        }
      />

      <InterviewProgressBar
        current={index + 1}
        total={questions.length}
        answeredIndexes={answeredIndexes}
        flaggedIndexes={flaggedSet}
        onSelect={(i) => void handleQuestionSelect(i)}
        disabled={busy}
      />

      <div className="hq-iv-body">
        <InterviewQuestionRail
          questions={questions}
          index={index}
          answerMap={answerMap}
          flaggedSet={flaggedSet}
          filter={railFilter}
          onFilterChange={setRailFilter}
          collapsed={railCollapsed}
          onToggleCollapsed={() => setRailCollapsed((c) => !c)}
          onSelect={(i) => void handleQuestionSelect(i)}
          disabled={busy}
        />

        <main className="hq-iv-main hq-interview-session__main">
          {error ? <p className="hq-iv-error">{error}</p> : null}

          <InterviewQuestionMeta
            topic={current.topic}
            type={isCoding ? 'coding' : current.type}
            difficulty={current.difficulty}
            isFlagged={isFlagged}
            onToggleFlag={() => void handleToggleFlag()}
            disabled={busy}
          />

          {isCoding && id ? (
            <div className="hq-coding-workspace">
              <section className="hq-coding-workspace__problem" aria-label="Problem statement">
                <InterviewQuestionCard
                  variant="coding"
                  questionText={current.question}
                  illustrationDataUrl={current.illustrationDataUrl ?? undefined}
                  illustrationRequired={current.illustrationRequired}
                  topic={current.topic}
                  difficulty={current.difficulty}
                  functionName={current.functionName || 'solve'}
                />
              </section>
              <section className="hq-coding-workspace__editor" aria-label="Code editor">
                <CodingAnswerEditor
                  fillHeight
                  interviewId={id}
                  questionIndex={index}
                  starterCode={current.starterCode || 'function solve() {\n  // your code\n}\n'}
                  functionName={current.functionName || 'solve'}
                  language={current.language || 'javascript'}
                  value={answerDraft}
                  onChange={setAnswerDraft}
                  disabled={busy}
                />
              </section>
            </div>
          ) : (
            <div className="hq-iv-scroll">
              <InterviewQuestionCard
                questionText={current.question}
                illustrationDataUrl={current.illustrationDataUrl ?? undefined}
                illustrationRequired={current.illustrationRequired}
              />
              <InterviewAnswerEditor
                value={answerDraft}
                onChange={setAnswerDraft}
                disabled={busy}
                saveState={saveState}
                onSubmitShortcut={() =>
                  void (isLastQuestion && canShowFinish ? handleFinish() : handleNext())
                }
              />
            </div>
          )}
        </main>
      </div>

      <InterviewActions
        isSaving={busy}
        isFlagged={isFlagged}
        isFirstQuestion={index === 0}
        isLastQuestion={isLastQuestion}
        canShowFinish={canShowFinish}
        onSaveAnswer={() => void handleSaveAnswer()}
        onToggleFlag={() => void handleToggleFlag()}
        onPrevious={() => void handlePrevious()}
        onNext={() => void handleNext()}
        onFinish={() => void handleFinish()}
      />
    </div>
  )
}
