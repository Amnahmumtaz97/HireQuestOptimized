'use client'

import { useEffect, useRef } from 'react'

type InterviewAnswerEditorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function InterviewAnswerEditor({ value, onChange, disabled }: InterviewAnswerEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    const max = 320
    el.style.height = `${Math.min(el.scrollHeight, max)}px`
  }, [value])

  useEffect(() => {
    if (!disabled) return
    ref.current?.blur()
  }, [disabled])

  return (
    <div className="hq-interview-answer w-full min-w-0 space-y-2 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Your answer
      </div>
      <textarea
        ref={ref}
        value={value}
        readOnly={disabled}
        aria-disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        data-lpignore="true"
        data-form-type="other"
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="interview-answer-textarea min-h-[120px] w-full resize-none rounded-xl border border-border bg-[var(--background)] px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none transition-[border-color,box-shadow] focus:border-primary/50 focus:ring-2 focus:ring-primary/20 read-only:cursor-default read-only:pointer-events-none autofill:bg-card autofill:text-foreground"
        placeholder="Type your answer…"
      />
    </div>
  )
}
