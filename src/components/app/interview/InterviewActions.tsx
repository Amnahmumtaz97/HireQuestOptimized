'use client'

import { ArrowLeft, ArrowRight, CheckCircle2, Flag, Save } from 'lucide-react'

type InterviewActionsProps = {
  isSaving: boolean
  isFlagged: boolean
  isFirstQuestion: boolean
  isLastQuestion: boolean
  canShowFinish: boolean
  onSaveAnswer: () => void
  onToggleFlag: () => void
  onPrevious: () => void
  onNext: () => void
  onFinish: () => void
}

export function InterviewActions({
  isSaving,
  isFlagged,
  isFirstQuestion,
  isLastQuestion,
  canShowFinish,
  onSaveAnswer,
  onToggleFlag,
  onPrevious,
  onNext,
  onFinish,
}: InterviewActionsProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSaving || isFirstQuestion}
          className="hq-btn-outline h-10 px-5 text-sm btn-micro disabled:pointer-events-none disabled:opacity-45"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={onSaveAnswer}
          disabled={isSaving}
          className="hq-btn-primary h-10 px-5 text-sm btn-micro disabled:pointer-events-none disabled:opacity-45"
        >
          <Save className="h-4 w-4" /> {isSaving ? 'Saving…' : 'Save Answer'}
        </button>
        <button
          type="button"
          onClick={onToggleFlag}
          disabled={isSaving}
          className={[
            'h-10 px-5 text-sm btn-micro disabled:opacity-60',
            isFlagged ? 'hq-btn-warning' : 'hq-btn-outline',
          ].join(' ')}
        >
          <Flag className="h-4 w-4" />
          {isFlagged ? 'Unflag' : 'Flag for review'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isSaving || isLastQuestion}
          className="hq-btn-outline h-10 px-5 text-sm btn-micro disabled:pointer-events-none disabled:opacity-45"
        >
          Next Question <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {canShowFinish ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={isSaving}
          className="hq-btn-success h-10 px-5 text-sm btn-micro disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" /> Finish Interview
        </button>
      ) : null}
    </div>
  )
}
