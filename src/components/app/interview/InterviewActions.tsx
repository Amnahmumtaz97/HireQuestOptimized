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
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-input/25 px-5 text-sm font-semibold text-foreground transition-colors hover:bg-input/45 btn-micro disabled:pointer-events-none disabled:opacity-45"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>
        <button
          type="button"
          onClick={onSaveAnswer}
          disabled={isSaving}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-white btn-micro shadow-glow-sm transition-opacity disabled:pointer-events-none disabled:opacity-45"
        >
          <Save className="h-4 w-4" /> {isSaving ? 'Saving…' : 'Save Answer'}
        </button>
        <button
          type="button"
          onClick={onToggleFlag}
          disabled={isSaving}
          className={[
            'inline-flex h-10 items-center gap-2 rounded-xl border px-5 text-sm font-semibold btn-micro disabled:opacity-60',
            isFlagged
              ? 'border-amber-500/40 bg-amber-500/15 text-amber-200'
              : 'border-border bg-input/20 text-foreground hover:bg-input/40',
          ].join(' ')}
        >
          <Flag className="h-4 w-4" />
          {isFlagged ? 'Unflag' : 'Flag for review'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isSaving || isLastQuestion}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-input/25 px-5 text-sm font-semibold text-foreground transition-colors hover:bg-input/45 btn-micro disabled:pointer-events-none disabled:opacity-45"
        >
          Next Question <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      {canShowFinish ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={isSaving}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 text-sm font-semibold text-emerald-200 hover:bg-emerald-500/15 btn-micro disabled:opacity-60"
        >
          <CheckCircle2 className="h-4 w-4" /> Finish Interview
        </button>
      ) : null}
    </div>
  )
}
