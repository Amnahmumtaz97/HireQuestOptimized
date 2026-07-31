'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useInterviewSession } from '@/hooks/interview/useInterviewSession'
import { InterviewActions } from '@/components/app/interview/InterviewActions'
import { InterviewAnswerEditor } from '@/components/app/interview/InterviewAnswerEditor'
import { InterviewQuestionCard } from '@/components/app/interview/InterviewQuestionCard'
import { InterviewQuestionHeader } from '@/components/app/interview/InterviewQuestionHeader'
import { InterviewProgressBar } from '@/components/app/interview/InterviewProgressBar'
import { InterviewSessionTimer } from '@/components/app/interview/InterviewSessionTimer'
import { BounceLoader } from '@/components/ui/bounce-loader'

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
      router.push(`/app/interviews/${id}/results`)
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
        <div className="text-sm font-medium text-red-600 dark:text-red-400">{error}</div>
        <Link
          href="/app/interviews"
          className="hq-btn-outline px-4 py-2 text-sm btn-micro"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </div>
    )
  }

  if (!session) {
    return <div className="text-sm text-muted-foreground">No interview found.</div>
  }

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
      </div>
    )
  }

  return (
    <div className="hq-interview-session flex min-h-[52vh] flex-col gap-8">
      {error ? <div className="text-sm font-medium text-red-600 dark:text-red-400">{error}</div> : null}

      <InterviewQuestionHeader
        key={headerKey}
        questionNumber={index + 1}
        totalQuestions={questions.length}
        topic={current.topic}
        type={current.type}
        difficulty={current.difficulty}
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
