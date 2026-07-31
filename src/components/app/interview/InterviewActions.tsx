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
          className="hq-btn-outline btn-micro h-10 w-full px-5 text-sm disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={onSaveAnswer}
          disabled={isSaving}
          className="hq-btn-primary btn-micro h-10 w-full px-5 text-sm disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
        >
          <Save className="h-4 w-4" /> {isSaving ? 'Saving…' : 'Save Answer'}
        </button>
        <button
          type="button"
          onClick={onToggleFlag}
          disabled={isSaving}
          className={[
            'btn-micro h-10 w-full px-5 text-sm disabled:opacity-60 sm:w-auto',
            isFlagged ? 'hq-btn-warning' : 'hq-btn-outline',
          ].join(' ')}
        >
          <Flag className="h-4 w-4" />
          {isFlagged ? 'Unflag' : <>Flag<span className="hidden sm:inline"> for review</span></>}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isSaving || isLastQuestion}
          className="hq-btn-outline btn-micro h-10 w-full px-5 text-sm disabled:pointer-events-none disabled:opacity-45 sm:w-auto"
        >
          Next<span className="hidden sm:inline"> Question</span> <ArrowRight className="h-4 w-4" />
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
