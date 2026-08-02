'use client'

import { formatGeneratedQuestion } from '@/lib/interview-questions/clean-question-text'
import { InterviewQuestionMarkdown } from '@/components/app/interview/InterviewQuestionMarkdown'

type InterviewQuestionCardProps = {
  questionText: string
  illustrationDataUrl?: string | null
  /** True when a figure was requested from the platform (candidate is never asked to draw). */
  illustrationRequired?: boolean
  /** Coding problems use a LeetCode-style problem panel. */
  variant?: 'default' | 'coding'
  topic?: string
  difficulty?: string
  functionName?: string
}

function difficultyClass(difficulty?: string) {
  const d = (difficulty || '').toLowerCase()
  if (d === 'easy') return 'hq-coding-diff hq-coding-diff--easy'
  if (d === 'hard') return 'hq-coding-diff hq-coding-diff--hard'
  if (d === 'medium') return 'hq-coding-diff hq-coding-diff--medium'
  return 'hq-coding-diff'
}

export function InterviewQuestionCard({
  questionText,
  illustrationDataUrl,
  illustrationRequired,
  variant = 'default',
  topic,
  difficulty,
  functionName,
}: InterviewQuestionCardProps) {
  const formatted = formatGeneratedQuestion(questionText)
  const coding = variant === 'coding'

  if (coding) {
    return (
      <article className="hq-interview-question hq-coding-problem flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-transparent shadow-none">
        <header className="hq-coding-problem-meta shrink-0 border-b border-border/70 px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            {difficulty ? (
              <span className={difficultyClass(difficulty)}>{difficulty}</span>
            ) : null}
            {topic ? (
              <span className="rounded-md border border-border/80 bg-input/20 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                {topic}
              </span>
            ) : null}
            {functionName ? (
              <span className="font-mono text-[11px] text-muted-foreground">
                fn <span className="text-foreground">{functionName}</span>
              </span>
            ) : null}
          </div>
        </header>
        <div className="hq-coding-problem-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          <InterviewQuestionMarkdown markdown={formatted} variant="coding" />
          {illustrationDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={illustrationDataUrl}
              alt=""
              className="mt-5 max-h-64 w-full rounded-lg border border-border object-contain"
            />
          ) : null}
          {illustrationRequired && !illustrationDataUrl ? (
            <p className="mt-4 text-xs text-muted-foreground">Figure pending for this prompt.</p>
          ) : null}
        </div>
      </article>
    )
  }

  return (
    <div className="hq-interview-question rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] sm:p-6">
      <InterviewQuestionMarkdown markdown={formatted} />
    </div>
  )
}
