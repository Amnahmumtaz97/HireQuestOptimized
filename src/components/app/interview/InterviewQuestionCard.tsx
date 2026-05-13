'use client'

import { formatGeneratedQuestion } from '@/lib/interview-questions/clean-question-text'
import { InterviewQuestionMarkdown } from '@/components/app/interview/InterviewQuestionMarkdown'

type InterviewQuestionCardProps = {
  questionText: string
  illustrationDataUrl?: string | null
  /** True when a figure was requested from the platform (candidate is never asked to draw). */
  illustrationRequired?: boolean
}

export function InterviewQuestionCard({
  questionText,
  illustrationDataUrl,
  illustrationRequired,
}: InterviewQuestionCardProps) {
  const formatted = formatGeneratedQuestion(questionText)

  return (
    <div className="card-enhanced glass-panel p-6 md:p-6">
      <InterviewQuestionMarkdown markdown={formatted} />
    </div>
  )
}
