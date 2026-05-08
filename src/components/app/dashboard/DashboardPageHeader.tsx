type DashboardPageHeaderProps = {
  title: string
  description: string
  /** `accent` = solid brand blue (dashboard reference); `gradient` = legacy gradient */
  titleHighlight?: 'gradient' | 'accent'
  /** Use compact HireQuest dashboard typography */
  variant?: 'default' | 'dashboard'
}

export function DashboardPageHeader({
  title,
  description,
  titleHighlight = 'gradient',
  variant = 'default',
}: DashboardPageHeaderProps) {
  const words = title.trim().split(/\s+/)
  const first = words[0] ?? title
  const rest = words.slice(1).join(' ')

  const highlightClass =
    titleHighlight === 'accent' ? 'hq-page-title-accent' : 'text-gradient'

  if (variant === 'dashboard') {
    return (
      <div className="mb-7">
        <h1 className="hq-page-title">
          {first}
          {rest ? (
            <>
              {' '}
              <span className={highlightClass}>{rest}</span>
            </>
          ) : null}
        </h1>
        <p className="hq-page-sub">{description}</p>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-foreground">
        {first}{' '}
        {rest ? <span className={highlightClass}>{rest}</span> : null}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
