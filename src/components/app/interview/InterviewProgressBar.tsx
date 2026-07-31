'use client'

type InterviewProgressBarProps = {
  current: number
  total: number
}

export function InterviewProgressBar({ current, total }: InterviewProgressBarProps) {
  const t = Math.max(1, total)
  const pct = Math.min(100, Math.round((current / t) * 100))

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>Progress</span>
        <span className="tabular-nums text-foreground">
          {current} / {total}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full hq-interview-progress-track">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
