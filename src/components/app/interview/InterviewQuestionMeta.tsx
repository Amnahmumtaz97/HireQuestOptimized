'use client'

import { Flag } from 'lucide-react'
import { formatQuestionTypeLabel } from '@/utils/dashboard/interview-labels'

type InterviewQuestionMetaProps = {
  topic: string
  type: string
  difficulty: string
  isFlagged: boolean
  onToggleFlag: () => void
  disabled?: boolean
}

function difficultyClass(difficulty: string) {
  const d = difficulty.trim().toLowerCase()
  if (d === 'easy') return 'hq-coding-diff hq-coding-diff--easy'
  if (d === 'medium') return 'hq-coding-diff hq-coding-diff--medium'
  if (d === 'hard') return 'hq-coding-diff hq-coding-diff--hard'
  return 'hq-coding-diff'
}

export function InterviewQuestionMeta({
  topic,
  type,
  difficulty,
  isFlagged,
  onToggleFlag,
  disabled,
}: InterviewQuestionMetaProps) {
  return (
    <div className="hq-iv-meta">
      <div className="hq-iv-meta__chips">
        <span className="hq-iv-chip hq-iv-chip--topic" title={topic}>
          {topic}
        </span>
        <span className="hq-iv-chip">{formatQuestionTypeLabel(type)}</span>
        <span className={difficultyClass(difficulty)}>{difficulty}</span>
      </div>

      <button
        type="button"
        onClick={onToggleFlag}
        disabled={disabled}
        aria-pressed={isFlagged}
        className={`hq-iv-meta__flag btn-micro${isFlagged ? ' hq-iv-meta__flag--on' : ''}`}
        title={isFlagged ? 'Remove review flag' : 'Flag this question for review'}
      >
        <Flag aria-hidden="true" />
        <span>{isFlagged ? 'Flagged' : 'Flag'}</span>
      </button>
    </div>
  )
}
