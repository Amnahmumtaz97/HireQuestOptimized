'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useInterviewSession } from '@/hooks/interview/useInterviewSession'
import { InterviewActions } from '@/components/app/interview/InterviewActions'
import { InterviewAnswerEditor } from '@/components/app/interview/InterviewAnswerEditor'
import { CodingAnswerEditor } from '@/components/app/interview/CodingAnswerEditor'
import { InterviewQuestionCard } from '@/components/app/interview/InterviewQuestionCard'
import { InterviewQuestionHeader } from '@/components/app/interview/InterviewQuestionHeader'
import { InterviewProgressBar } from '@/components/app/interview/InterviewProgressBar'
import { InterviewSessionTimer } from '@/components/app/interview/InterviewSessionTimer'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { interviewExitHref, interviewExitLabel } from '@/lib/learning-paths/interview-exit'
import { useOnceGuidance } from '@/hooks/useOnceGuidance'
import { GUIDANCE_TIPS } from '@/lib/guidance/tips'

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

  const current = questions[index]
  const busy = isSaving

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
    const existing = answerMap.get(index) ?? ''
    setAnswerDraft(existing)
  }, [answerMap, index, session])

  const isFlagged = flaggedSet.has(index)
  const isLastQuestion = questions.length > 0 && index >= questions.length - 1

  const handleSaveAnswer = async () => {
    setError('')
    await saveAnswer(answerDraft)
  }

  const handleToggleFlag = async () => {
    setError('')
    await setFlagged(index, !isFlagged)
  }

  const saveDraftIfAny = async (): Promise<boolean> => {
    const trimmed = answerDraft.trim()
    if (!trimmed) return true
    const next = await saveAnswer(answerDraft)
    return next !== null
  }

  const handlePrevious = async () => {
    if (index <= 0) return
    setError('')
    if (!(await saveDraftIfAny())) return
    await goToQuestion(index - 1)
  }

  const handleNext = async () => {
    if (isLastQuestion) return
    setError('')
    if (!(await saveDraftIfAny())) return
    await goToQuestion(index + 1)
  }

  const handleFinish = async () => {
    setError('')
    if (!(await saveDraftIfAny())) return
    const next = await finishInterview()
    if (next && id) {
      router.replace(`/app/interviews/${id}/results`)
    }
  }

  const headerKey = useMemo(() => `${index}-${current?.question ?? ''}`, [current?.question, index])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <BounceLoader label="Loading interview" />
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="space-y-4">
        <div className="text-sm font-medium text-destructive">{error}</div>
        <Link
          href="/app/learning-paths"
          className="hq-btn-outline px-4 py-2 text-sm btn-micro"
        >
          <ArrowLeft className="h-4 w-4" /> Learning paths
        </Link>
      </div>
    )
  }

  if (!session) {
    return <div className="text-sm text-muted-foreground">No interview found.</div>
  }

  const exitHref = interviewExitHref(session)
  const exitLabel = interviewExitLabel(session)

  if (session.status === 'completed') {
    return (
      <div className="text-sm text-muted-foreground">
        Redirecting to results…
      </div>
    )
  }

  if (!current) {
    return (
      <div className="space-y-4">
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

  return (
    <div
      className={[
        'hq-interview-session flex flex-col',
        isCoding ? 'hq-interview-session--coding gap-4' : 'min-h-[52vh] gap-8',
      ].join(' ')}
    >
      {error ? <div className="text-sm font-medium text-destructive">{error}</div> : null}

      <InterviewQuestionHeader
        key={headerKey}
        questionNumber={index + 1}
        totalQuestions={questions.length}
        topic={current.topic}
        type={isCoding ? 'coding' : current.type}
        difficulty={current.difficulty}
        exitHref={exitHref}
        exitLabel={exitLabel}
        extraActions={
          <InterviewSessionTimer
            durationMinutes={session.durationMinutes ?? null}
            interviewStartedAt={session.interviewStartedAt ?? undefined}
            status={session.status}
            onTimeExpired={() =>
              setError("Time's up. Wrap up and tap Finish when you're ready — your answers are still saved.")
            }
          />
        }
      />

      <InterviewProgressBar current={index + 1} total={questions.length} />

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
        <div className="flex flex-1 flex-col justify-center gap-6">
          <InterviewQuestionCard
            questionText={current.question}
            illustrationDataUrl={current.illustrationDataUrl ?? undefined}
            illustrationRequired={current.illustrationRequired}
          />
          <InterviewAnswerEditor
            value={answerDraft}
            onChange={setAnswerDraft}
            disabled={busy}
          />
        </div>
      )}

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
