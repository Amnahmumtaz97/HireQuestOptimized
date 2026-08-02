'use client'

import React from 'react'
import { Plus, BookmarkCheck, Sparkles } from 'lucide-react'
import type { InterviewType } from '@/components/app/InterviewTypeSelector'

export function StartInterviewButton({
  canStart, isCreating, isSaving, onSaveDraft, onStart, interviewType, topicCount,
}: {
  canStart: boolean; isCreating: boolean; isSaving: boolean
  onSaveDraft: () => void; onStart: () => void
  interviewType: InterviewType | null; topicCount: number
}) {
  return (
    <div className="pt-2 animate-fade-up">
      <div className="h-px w-full bg-border/40" />
      <div className="mt-5 rounded-2xl border border-border bg-card p-4 sm:p-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Session Summary
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-medium text-primary">
                {interviewType ? labelForInterviewType(interviewType) : 'Pick interview type'}
              </span>
              <span className="rounded-full border border-border bg-input/30 px-2.5 py-1 text-foreground">
                {topicCount} topic{topicCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="hq-btn-outline btn-micro h-10 w-full px-4 text-sm disabled:opacity-60 sm:w-auto"
            >
              <BookmarkCheck className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart || isCreating}
              className="hq-btn-primary btn-micro h-10 w-full px-5 text-sm disabled:opacity-50 sm:w-auto"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {isCreating ? 'Creating...' : 'Create Interview'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function labelForInterviewType(type: InterviewType): string {
  switch (type) {
    case 'technical': return 'Technical'
    case 'behavioral': return 'Behavioral'
    case 'hr': return 'Screening HR'
    case 'coding': return 'Coding'
    case 'system_design': return 'System Design'
    case 'mixed':
    case 'both': return 'Mixed'
  }
}
