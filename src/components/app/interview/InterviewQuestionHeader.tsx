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
}

export function InterviewQuestionHeader({
  questionNumber,
  totalQuestions,
  topic,
  type,
  difficulty,
  extraActions,
}: InterviewQuestionHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="break-words text-sm font-semibold text-foreground md:text-base">
            <span className="text-muted-foreground">{topic}</span>
            <span className="mx-2 text-border">·</span>
            <span>{formatQuestionTypeLabel(type)}</span>
            <span className="mx-2 text-border">·</span>
            {difficulty}
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          {extraActions}
          <Link
            href="/app/interviews"
            className="hq-btn-outline h-9 px-3 text-sm btn-micro"
          >
            <ArrowLeft className="h-4 w-4" /> Exit
          </Link>
        </div>
      </div>
    </div>
  )
}
