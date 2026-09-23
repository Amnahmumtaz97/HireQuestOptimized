'use client'

type InterviewProgressBarProps = {
  /** 1-based position, kept for callers that only track the cursor. */
  current: number
  total: number
  /** Question indexes (0-based) that already have a saved answer. */
  answeredIndexes?: Set<number>
  flaggedIndexes?: Set<number>
  onSelect?: (index: number) => void
  disabled?: boolean
}

export function InterviewProgressBar({
  current,
  total,
  answeredIndexes,
  flaggedIndexes,
  onSelect,
  disabled,
}: InterviewProgressBarProps) {
  const count = Math.max(1, total)
  const activeIndex = Math.min(Math.max(current - 1, 0), count - 1)
  const answered = answeredIndexes?.size ?? 0
  const pct = Math.round((answered / count) * 100)

  return (
    <div className="hq-iv-progress">
      <ol className="hq-iv-progress__track" aria-label="Question progress">
        {Array.from({ length: count }, (_, i) => {
          const isAnswered = answeredIndexes?.has(i) ?? false
          const isFlagged = flaggedIndexes?.has(i) ?? false
          const isCurrent = i === activeIndex
          const state = isCurrent ? 'current' : isFlagged ? 'flagged' : isAnswered ? 'done' : 'todo'

          return (
            <li key={i} className="hq-iv-progress__cell">
              <button
                type="button"
                className={`hq-iv-progress__seg hq-iv-progress__seg--${state}`}
                aria-label={`Question ${i + 1}${isAnswered ? ', answered' : ''}${isFlagged ? ', flagged for review' : ''}`}
                aria-current={isCurrent ? 'step' : undefined}
                disabled={disabled || !onSelect}
                onClick={() => onSelect?.(i)}
              />
            </li>
          )
        })}
      </ol>
      <p className="hq-iv-progress__meta">
        <span className="hq-iv-progress__position">
          Question {activeIndex + 1} of {count}
        </span>
        <span className="hq-iv-progress__sep" aria-hidden="true" />
        <span className="hq-iv-progress__pct">{pct}% answered</span>
      </p>
    </div>
  )
}
