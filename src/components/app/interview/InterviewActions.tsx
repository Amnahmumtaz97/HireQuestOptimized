'use client'

import { ArrowLeft, ArrowRight, CheckCircle2, Flag } from 'lucide-react'

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
  // Finish takes the primary slot on the last question; otherwise Next does.
  const showFinishAsPrimary = canShowFinish && isLastQuestion

  return (
    <div className="hq-iv-actions">
      <div className="hq-iv-actions__left">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSaving || isFirstQuestion}
          className="hq-iv-btn hq-iv-btn--quiet btn-micro"
        >
          <ArrowLeft aria-hidden="true" />
          <span>Previous</span>
        </button>

        <button
          type="button"
          onClick={onToggleFlag}
          disabled={isSaving}
          aria-pressed={isFlagged}
          className={`hq-iv-btn hq-iv-btn--quiet btn-micro${isFlagged ? ' hq-iv-btn--flagged' : ''}`}
        >
          <Flag aria-hidden="true" />
          <span>{isFlagged ? 'Unflag' : 'Flag for review'}</span>
        </button>
      </div>

      <div className="hq-iv-actions__right">
        <button
          type="button"
          onClick={onSaveAnswer}
          disabled={isSaving}
          className="hq-iv-btn hq-iv-btn--quiet btn-micro hq-iv-actions__save"
        >
          <span>{isSaving ? 'Saving…' : 'Save'}</span>
        </button>

        {canShowFinish && !isLastQuestion ? (
          <button
            type="button"
            onClick={onFinish}
            disabled={isSaving}
            className="hq-iv-btn hq-iv-btn--finish btn-micro"
          >
            <CheckCircle2 aria-hidden="true" />
            <span>Finish</span>
          </button>
        ) : null}

        {showFinishAsPrimary ? (
          <button
            type="button"
            onClick={onFinish}
            disabled={isSaving}
            className="hq-iv-btn hq-iv-btn--primary btn-micro"
          >
            <CheckCircle2 aria-hidden="true" />
            <span>Finish interview</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            disabled={isSaving || isLastQuestion}
            className="hq-iv-btn hq-iv-btn--primary btn-micro"
          >
            <span>Next question</span>
            <ArrowRight aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  )
}
