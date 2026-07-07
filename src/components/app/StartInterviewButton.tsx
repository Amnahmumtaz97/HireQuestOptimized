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
      <div className="mt-5 rounded-2xl border border-border bg-input/10 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Session Summary
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-primary font-medium">
                {interviewType ? labelForInterviewType(interviewType) : 'Pick interview type'}
              </span>
              <span className="rounded-full border border-border bg-input/30 px-2.5 py-1 text-foreground">
                {topicCount} topic{topicCount === 1 ? '' : 's'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-input/30 px-4 text-sm font-semibold text-foreground hover:bg-input/50 disabled:opacity-60 btn-micro"
            >
              <BookmarkCheck className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={onStart}
              disabled={!canStart || isCreating}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-white disabled:opacity-50 btn-micro shadow-glow-sm"
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
    case 'both': return 'Mixed Interview'
  }
}
