type BounceLoaderProps = {
  className?: string
  /** sm = buttons / inline; md = page sections */
  size?: 'sm' | 'md'
  label?: string
}

const sizeClass = {
  sm: 'h-1.5 w-1.5',
  md: 'h-4 w-4',
} as const

export function BounceLoader({ className = '', size = 'md', label = 'Loading' }: BounceLoaderProps) {
  const dot = sizeClass[size]
  return (
    <div
      className={['inline-flex flex-row items-center justify-center gap-2', className].join(' ')}
      role="status"
      aria-label={label}
    >
      <span className={`${dot} rounded-full bg-blue-700 animate-bounce [animation-delay:.7s]`} />
      <span className={`${dot} rounded-full bg-blue-700 animate-bounce [animation-delay:.3s]`} />
      <span className={`${dot} rounded-full bg-blue-700 animate-bounce [animation-delay:.7s]`} />
      <span className="sr-only">{label}</span>
    </div>
  )
}
