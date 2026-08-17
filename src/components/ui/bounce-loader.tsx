type BounceLoaderProps = {
  className?: string
  /** sm = buttons / inline; md = page sections */
  size?: 'sm' | 'md'
  label?: string
}

export function BounceLoader({ className = '', size = 'md', label = 'Loading' }: BounceLoaderProps) {
  const isSmall = size === 'sm'
  return (
    <div
      className={['flex items-center', isSmall ? 'gap-2' : 'gap-3', className].join(' ')}
      role="status"
      aria-label={label}
    >
      <span
        className={['hq-loader', isSmall ? 'hq-loader--sm' : 'hq-loader--md'].join(' ')}
        aria-hidden
      >
        <span className="hq-loader-ring" />
        <span className="hq-loader-mark">{isSmall ? '' : 'HQ'}</span>
      </span>
      {isSmall ? (
        <span className="sr-only">{label}</span>
      ) : (
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      )}
    </div>
  )
}
