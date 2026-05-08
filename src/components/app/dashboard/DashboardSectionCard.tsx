import type { ReactNode } from 'react'

type DashboardSectionCardProps = {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function DashboardSectionCard({
  title,
  description,
  children,
  className = '',
}: DashboardSectionCardProps) {
  return (
    <section className={`dashboard-card border-border p-6 transition-shadow hover:shadow-md ${className}`}>
      {(title ?? description) ? (
        <header className="mb-4">
          {title ? (
            <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </header>
      ) : null}
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
