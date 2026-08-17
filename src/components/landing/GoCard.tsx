import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

type GoCardProps = {
  children: ReactNode
  className?: string
  href?: string
  wide?: boolean
  tall?: boolean
  style?: CSSProperties
}

export function GoCard({ children, className = '', href, wide, tall, style }: GoCardProps) {
  const classes = ['hq-go-card', wide ? 'hq-go-card--wide' : '', tall ? 'hq-go-card--tall' : '']
    .filter(Boolean)
    .join(' ')
  const inner = (
    <>
      <div className={['hq-go-card-body', className].filter(Boolean).join(' ')}>{children}</div>
      <span className="hq-go-corner" aria-hidden>
        <span className="hq-go-arrow">→</span>
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={classes} style={style}>
      {inner}
    </div>
  )
}
