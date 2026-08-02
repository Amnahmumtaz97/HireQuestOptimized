'use client'

import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { formatQuestionTypeLabel } from '@/utils/dashboard/interview-labels'

type InterviewQuestionHeaderProps = {
  questionNumber: number
  totalQuestions: number
  topic: string
  type: string
  difficulty: string
  extraActions?: ReactNode
  exitHref?: string
  exitLabel?: string
}

export function InterviewQuestionHeader({
  questionNumber,
  totalQuestions,
  topic,
  type,
  difficulty,
  extraActions,
  exitHref = '/app/interviews',
  exitLabel = 'Exit',
}: InterviewQuestionHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="max-w-full truncate rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
              {topic}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              {formatQuestionTypeLabel(type)}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
              {difficulty}
            </span>
          </div>
        </div>
        <div className="flex w-full max-w-[11rem] shrink-0 flex-col items-stretch gap-2 sm:max-w-none sm:w-auto sm:flex-row sm:items-center">
          {extraActions}
          <Link
            href={exitHref}
            className="hq-btn-outline inline-flex h-10 min-h-[40px] items-center justify-center gap-1.5 px-3 text-sm btn-micro"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">{exitLabel}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
