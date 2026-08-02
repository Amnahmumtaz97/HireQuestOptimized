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
  const btn =
    'btn-micro inline-flex h-11 min-h-[44px] items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-45'

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSaving || isFirstQuestion}
          className={['hq-btn-outline', btn, 'sm:px-5'].join(' ')}
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          <span className="truncate">Previous</span>
        </button>
        <button
          type="button"
          onClick={onSaveAnswer}
          disabled={isSaving}
          className={['hq-btn-primary', btn, 'sm:px-5'].join(' ')}
        >
          <Save className="h-4 w-4 shrink-0" />
          <span className="truncate">{isSaving ? 'Saving…' : 'Save'}</span>
        </button>
        <button
          type="button"
          onClick={onToggleFlag}
          disabled={isSaving}
          className={[
            btn,
            'sm:px-5',
            isFlagged ? 'hq-btn-warning' : 'hq-btn-outline',
          ].join(' ')}
        >
          <Flag className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {isFlagged ? 'Unflag' : (
              <>
                Flag<span className="hidden sm:inline"> for review</span>
              </>
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={isSaving || isLastQuestion}
          className={['hq-btn-outline', btn, 'sm:px-5'].join(' ')}
        >
          <span className="truncate">
            Next<span className="hidden sm:inline"> Question</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>
      </div>

      {canShowFinish ? (
        <button
          type="button"
          onClick={onFinish}
          disabled={isSaving}
          className={['hq-btn-success w-full sm:w-auto sm:min-w-[12rem]', btn, 'px-5'].join(' ')}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Finish Interview
        </button>
      ) : null}
    </div>
  )
}
