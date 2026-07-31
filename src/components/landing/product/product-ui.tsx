'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

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

export function useInViewOnce(threshold = 0.35) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, inView }
}

export function ScoreRing({
  value,
  animate = true,
}: {
  value: number
  animate?: boolean
}) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = animate
    ? circumference - (value / 100) * circumference
    : circumference

  return (
    <div className="relative mx-auto h-36 w-36">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" aria-hidden>
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-border/70"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-[var(--hq-display-blue)] transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
          {animate ? value : 0}
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Overall
        </span>
      </div>
    </div>
  )
}

export function SkillMeter({
  label,
  value,
  animate = true,
}: {
  label: string
  value: number
  animate?: boolean
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">{label}</span>
        <span className="font-semibold tabular-nums text-[var(--hq-display-blue)]">
          {animate ? value : 0}%
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border/60">
        <div
          className="h-full rounded-full bg-[var(--hq-display-blue)] transition-[width] duration-1000 ease-out"
          style={{ width: animate ? `${value}%` : '0%' }}
        />
      </div>
    </div>
  )
}
