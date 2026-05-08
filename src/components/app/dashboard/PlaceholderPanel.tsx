import type { LucideIcon } from 'lucide-react'

type PlaceholderPanelProps = {
  title: string
  description: string
  icon: LucideIcon
  body?: string
}

export function PlaceholderPanel({ title, description, icon: Icon, body }: PlaceholderPanelProps) {
  return (
    <div className="dashboard-card mt-6 animate-fade-up border-border p-6 transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-input/40 text-muted-foreground ring-1 ring-border/60">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-base font-semibold tracking-tight text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {body ?? 'This section is coming soon. Structured layout will host your content here.'}
      </p>
    </div>
  )
}
