'use client'

import { useState, type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { formatQuestionTypeLabel } from '@/utils/dashboard/interview-labels'

type InterviewQuestionHeaderProps = {
  questionNumber: number
  totalQuestions: number
  topic: string
  type: string
  difficulty: string
  extraActions?: ReactNode
  exitHref?: string
  exitLabel?: string
  unansweredCount?: number
  flaggedCount?: number
  onConfirmExit?: () => void | Promise<void>
}

export function InterviewQuestionHeader({
  questionNumber,
  totalQuestions,
  topic,
  type,
  difficulty,
  extraActions,
  exitHref = '/app/interviews',
  exitLabel = 'Exit',
  unansweredCount = 0,
  flaggedCount = 0,
  onConfirmExit,
}: InterviewQuestionHeaderProps) {
  const router = useRouter()
  const [confirmExitOpen, setConfirmExitOpen] = useState(false)
  const hasOpenItems = unansweredCount > 0 || flaggedCount > 0

  const exitDescription = hasOpenItems
    ? `You still have ${unansweredCount} unanswered question${unansweredCount === 1 ? '' : 's'}${flaggedCount > 0 ? ` and ${flaggedCount} flagged for review` : ''}. Your saved answers will be kept and this session will be completed.`
    : 'All questions have answers and none are flagged. This session will be completed and moved to your results.'

  return (
    <>
      <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="max-w-full truncate rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
              {topic}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              {formatQuestionTypeLabel(type)}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              {difficulty}
            </span>
          </div>
        </div>
        <div className="flex w-full max-w-[11rem] shrink-0 flex-col items-stretch gap-2 sm:max-w-none sm:w-auto sm:flex-row sm:items-center">
          {extraActions}
          <button
            type="button"
            onClick={() => setConfirmExitOpen(true)}
            className="hq-btn-outline inline-flex h-10 min-h-[40px] items-center justify-center gap-1.5 px-3 text-sm btn-micro"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{exitLabel}</span>
          </button>
        </div>
      </div>
      </div>
      <ConfirmModal
        open={confirmExitOpen}
        onOpenChange={setConfirmExitOpen}
        title="Leave interview?"
        description={exitDescription}
        cancelLabel="Keep answering"
        confirmLabel="Exit interview"
        confirmVariant="primary"
        onConfirm={onConfirmExit ?? (() => router.push(exitHref))}
      />
    </>
  )
}
