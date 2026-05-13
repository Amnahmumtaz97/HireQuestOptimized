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

  return (
    <div className="w-full min-w-0 space-y-2 card-enhanced p-4">
      <div className="text-left text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
        Your answer
      </div>
      <textarea
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="min-h-[120px] w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground outline-none transition-shadow focus:border-ring focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
        placeholder="Type your answer…"
      />
    </div>
  )
}
