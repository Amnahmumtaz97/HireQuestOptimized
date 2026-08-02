'use client'

import { useSession } from 'next-auth/react'
import type { ReactNode } from 'react'

export function SectionBand({
  children,
  className = '',
  tint = false,
  id,
}: {
  children: ReactNode
  className?: string
  tint?: boolean
  id?: string
}) {
  return (
    <section
      id={id}
      className={[
        'relative overflow-hidden py-20 sm:py-24 lg:py-28 scroll-mt-24',
        tint
          ? 'bg-[color-mix(in_oklab,var(--hq-display-blue)_6%,var(--background))]'
          : '',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: ReactNode
  description?: string
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className="reveal inline-flex items-center rounded-full border border-border/70 bg-card/50 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {eyebrow}
      </span>
      <h2 className="reveal mt-4 text-3xl font-extrabold tracking-[-0.02em] text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
        {title}
      </h2>
      {description ? (
        <p className="reveal mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>
      ) : null}
    </div>
  )
}

export function useAuthHrefs() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isAdmin = session?.user?.role === 'admin'
  return {
    getStartedHref: isAuthenticated ? (isAdmin ? '/dashboard' : '/app/dashboard') : '/auth',
    practiceHref: isAuthenticated
      ? isAdmin
        ? '/dashboard'
        : '/app/new-interview'
      : '/auth',
  }
}
