'use client'

import { useMemo } from 'react'
import { Check, Flag, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export type QuestionRailFilter = 'all' | 'unanswered' | 'flagged'

type RailQuestion = {
  question: string
  topic?: string
}

type InterviewQuestionRailProps = {
  questions: RailQuestion[]
  index: number
  answerMap: Map<number, string>
  flaggedSet: Set<number>
  filter: QuestionRailFilter
  onFilterChange: (filter: QuestionRailFilter) => void
  collapsed: boolean
  onToggleCollapsed: () => void
  onSelect: (index: number) => void
  disabled?: boolean
}

const FILTERS: Array<{ value: QuestionRailFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'unanswered', label: 'Unanswered' },
  { value: 'flagged', label: 'Flagged' },
]

export function InterviewQuestionRail({
  questions,
  index,
  answerMap,
  flaggedSet,
  filter,
  onFilterChange,
  collapsed,
  onToggleCollapsed,
  onSelect,
  disabled,
}: InterviewQuestionRailProps) {
  const answeredCount = useMemo(
    () => questions.reduce((n, _, i) => n + (answerMap.get(i)?.trim() ? 1 : 0), 0),
    [answerMap, questions],
  )
  const remaining = questions.length - answeredCount

  const visible = useMemo(() => {
    return questions
      .map((q, i) => ({ q, i }))
      .filter(({ i }) => {
        if (filter === 'unanswered') return !answerMap.get(i)?.trim()
        if (filter === 'flagged') return flaggedSet.has(i)
        return true
      })
  }, [answerMap, filter, flaggedSet, questions])

  return (
    <aside
      className={`hq-iv-rail${collapsed ? ' hq-iv-rail--collapsed' : ''}`}
      aria-label="Interview questions"
    >
      <div className="hq-iv-rail__head">
        {!collapsed ? <h2 className="hq-iv-rail__title">Questions</h2> : null}
        {!collapsed ? (
          <span className="hq-iv-rail__count">
            {answeredCount} / {questions.length}
          </span>
        ) : null}
        <button
          type="button"
          className="hq-iv-rail__toggle"
          aria-label={collapsed ? 'Expand question list' : 'Collapse question list'}
          title={collapsed ? 'Expand question list' : 'Collapse question list'}
          onClick={onToggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
      </div>

      {!collapsed ? (
        <div className="hq-iv-rail__filters" role="tablist" aria-label="Filter questions">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="tab"
              aria-selected={filter === f.value}
              className={`hq-iv-rail__filter${filter === f.value ? ' hq-iv-rail__filter--on' : ''}`}
              onClick={() => onFilterChange(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}

      <nav className="hq-iv-rail__list">
        {visible.length === 0 ? (
          <p className="hq-iv-rail__empty">
            {filter === 'flagged' ? 'Nothing flagged yet.' : 'Every question has an answer.'}
          </p>
        ) : null}

        {visible.map(({ q, i }) => {
          const answered = Boolean(answerMap.get(i)?.trim())
          const flagged = flaggedSet.has(i)
          const selected = i === index

          return (
            <button
              key={`${i}-${q.question.slice(0, 24)}`}
              type="button"
              className={[
                'hq-iv-rail__item',
                selected ? 'hq-iv-rail__item--current' : '',
                answered ? 'hq-iv-rail__item--done' : '',
              ].join(' ')}
              aria-current={selected ? 'step' : undefined}
              onClick={() => onSelect(i)}
              disabled={disabled}
              title={q.question}
            >
              <span className="hq-iv-rail__num">{i + 1}</span>
              {!collapsed ? (
                <>
                  <span className="hq-iv-rail__preview">{q.topic?.trim() || q.question}</span>
                  <span className="hq-iv-rail__state" aria-hidden="true">
                    {flagged ? (
                      <Flag className="hq-iv-rail__ico hq-iv-rail__ico--flag" />
                    ) : answered ? (
                      <Check className="hq-iv-rail__ico hq-iv-rail__ico--done" />
                    ) : (
                      <span className="hq-iv-rail__pip" />
                    )}
                  </span>
                </>
              ) : null}
            </button>
          )
        })}
      </nav>

      {!collapsed ? (
        <dl className="hq-iv-stats">
          <div className="hq-iv-stats__cell">
            <dt>Answered</dt>
            <dd className="hq-iv-stats__val hq-iv-stats__val--done">{answeredCount}</dd>
          </div>
          <div className="hq-iv-stats__cell">
            <dt>Remaining</dt>
            <dd className="hq-iv-stats__val">{remaining}</dd>
          </div>
          <div className="hq-iv-stats__cell">
            <dt>Flagged</dt>
            <dd className="hq-iv-stats__val hq-iv-stats__val--flag">{flaggedSet.size}</dd>
          </div>
        </dl>
      ) : null}
    </aside>
  )
}
