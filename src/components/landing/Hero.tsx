'use client'

import { useEffect, useState } from 'react'
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Check,
  Clock,
  FileText,
  Flame,
  LayoutDashboard,
  Mic,
  Plus,
  Route,
  Search,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useReveal } from '@/hooks/use-reveal'
import { ConstellationBackground } from '@/components/landing/ConstellationBackground'

const NAV = [
  { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'interviews', label: 'My interviews', icon: Mic },
  { id: 'paths', label: 'Learning paths', icon: Route },
  { id: 'results', label: 'Results', icon: FileText },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

const INTERVIEWS = [
  {
    id: 'api',
    name: 'API Rate Limiter',
    idLabel: 'HQ-2214',
    progress: '02 / 06',
    subtitle: 'Redis · token bucket',
    status: 'In progress',
    type: 'System design',
    difficulty: 'Medium',
    score: '9.1',
    duration: '14 min left',
    labels: ['APIs', 'Redis'],
    continuePath: 'Backend Foundations',
    action: 'Resume',
    tipGood: 'Fairness is covered',
    tipNext: 'Name the request-path hop',
  },
  {
    id: 'sql',
    name: 'SQL Indexing',
    idLabel: 'HQ-2088',
    progress: '03 / 05',
    subtitle: 'EXPLAIN ANALYZE · covering index',
    status: 'In progress',
    type: 'Technical',
    difficulty: 'Medium',
    score: '8.6',
    duration: '11 min left',
    labels: ['SQL', 'Databases'],
    continuePath: 'Data Foundations',
    action: 'Resume',
    tipGood: 'Started from the plan',
    tipNext: 'Cover the heap lookup',
  },
  {
    id: 'behavior',
    name: 'Incident review',
    idLabel: 'HQ-1964',
    progress: '04 / 06',
    subtitle: 'STAR · blameless postmortem',
    status: 'In progress',
    type: 'Behavioral',
    difficulty: 'Medium',
    score: '8.3',
    duration: '7 min left',
    labels: ['Behavioral', 'STAR'],
    continuePath: 'Career stories',
    action: 'Resume',
    tipGood: 'Timeline is crisp',
    tipNext: 'Add the outcome metric',
  },
  {
    id: 'react',
    name: 'React Technical',
    idLabel: 'HQ-1847',
    progress: '08 / 08',
    subtitle: 'Reconciliation · list keys',
    status: 'Completed',
    type: 'Technical',
    difficulty: 'Medium',
    score: '8.9',
    duration: 'Done',
    labels: ['React', 'Frontend'],
    continuePath: 'Frontend Foundations',
    action: 'Results',
    tipGood: 'Keys were covered',
    tipNext: 'Review list reordering',
  },
  {
    id: 'inbox',
    name: 'Notification Inbox',
    idLabel: 'HQ-2301',
    progress: '00 / 06',
    subtitle: 'Fan-out · unread counts',
    status: 'Not started',
    type: 'System design',
    difficulty: 'Hard',
    score: '—',
    duration: '42 min',
    labels: ['Scale', 'Queues'],
    continuePath: 'System design path',
    action: 'Start',
    tipGood: 'Scope is ready',
    tipNext: 'Start with write path',
  },
]

const FAVORITE_IDS = ['api', 'sql', 'behavior']

const STATS = [
  { label: 'Sessions', value: '24', delta: '+5 this week', icon: Mic },
  { label: 'Avg score', value: '8.7', delta: '+0.6', icon: TrendingUp },
  { label: 'Streak', value: '6 days', delta: 'Personal best', icon: Flame },
  { label: 'Practice', value: '12.4h', delta: '+2.1h', icon: Clock },
]

function TypedPhrase({ text }: { text: string }) {
  const [shown, setShown] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setShown(text)
      return
    }

    let timer: ReturnType<typeof setTimeout>

    if (!deleting && shown.length < text.length) {
      timer = setTimeout(() => setShown(text.slice(0, shown.length + 1)), 90)
    } else if (!deleting && shown.length === text.length) {
      timer = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && shown.length > 0) {
      timer = setTimeout(() => setShown(text.slice(0, shown.length - 1)), 45)
    } else {
      timer = setTimeout(() => setDeleting(false), 400)
    }

    return () => clearTimeout(timer)
  }, [shown, deleting, text])

  return (
    <span className="hq-typed relative inline-grid justify-items-center">
      <span className="invisible col-start-1 row-start-1 whitespace-pre" aria-hidden>
        {text}
      </span>
      <span className="col-start-1 row-start-1 inline-flex items-center justify-center whitespace-pre">
        <span className="sr-only">{text}</span>
        <span aria-hidden>{shown || '\u00A0'}</span>
        <span className="hq-typed-caret" aria-hidden />
      </span>
    </span>
  )
}

function statusDot(status: string) {
  if (status === 'Completed') return 'bg-[var(--success)]'
  if (status === 'Not started') return 'bg-border'
  return 'bg-[var(--hq-amber)]'
}

function HeroPreview() {
  const [activeId, setActiveId] = useState('api')
  const active = INTERVIEWS.find((item) => item.id === activeId) ?? INTERVIEWS[0]
  const favorites = INTERVIEWS.filter((item) => FAVORITE_IDS.includes(item.id))

  return (
    <div className="hq-hero-dash">
      <aside className="hq-hero-dash-nav">
        <div className="flex items-center gap-2 px-3 pt-4 pb-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary text-[9px] font-extrabold text-primary-foreground">
            HQ
          </span>
          <span className="text-[13px] font-semibold text-foreground">HireQuest</span>
        </div>

        <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px] text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          Search sessions
        </div>

        <div className="px-2">
          {NAV.map((item) => {
            const Icon = item.icon
            const selected = item.id === 'interviews'
            return (
              <div
                key={item.id}
                className={['hq-hero-dash-link', selected ? 'is-active' : ''].join(' ')}
              >
                <Icon className="h-3.5 w-3.5 opacity-70" />
                {item.label}
              </div>
            )
          })}
        </div>

        <div className="hq-hero-pane-label mt-3">Continue</div>
        <div className="px-2 text-[12px] text-muted-foreground">
          <div className="hq-hero-dash-link">
            <Route className="h-3.5 w-3.5 opacity-70" />
            {active.continuePath}
          </div>
        </div>

        <div className="hq-hero-pane-label mt-2">Favorites</div>
        <div className="px-2 pb-3">
          {favorites.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={['hq-hero-dash-link w-full text-left', activeId === item.id ? 'is-active' : ''].join(' ')}
            >
              <Bookmark className="h-3.5 w-3.5 opacity-70" />
              <span className="min-w-0 truncate">{item.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto border-t border-border px-3 py-3">
          <div className="hq-hero-dash-link is-active">
            <Plus className="h-3.5 w-3.5" />
            New interview
          </div>
        </div>
      </aside>

      <section className="hq-hero-dash-main">
        <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-foreground">My interviews</div>
            <div className="text-[11px] text-muted-foreground">{INTERVIEWS.length} sessions</div>
          </div>
          <span className="shrink-0 rounded-full border border-border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-foreground">
            Dashboard
          </span>
        </header>

        <div className="grid grid-cols-2 gap-1.5 px-3 pt-3 sm:grid-cols-4">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="hq-hero-stat">
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                  <Icon className="h-3 w-3 text-primary" />
                  {stat.label}
                </span>
                <span className="mt-1 block text-[0.95rem] font-bold leading-none tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="mt-0.5 block text-[10px] font-medium text-[var(--success)]">{stat.delta}</span>
              </div>
            )
          })}
        </div>

        <div className="mt-2 px-3">
          <div className="hq-hero-panel">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Up next
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                <Clock className="h-3 w-3" />
                {active.duration}
              </span>
            </div>
            <div className="mt-2 flex items-start gap-3">
              <span className="hq-hero-ilist-icon mt-0.5">
                <Mic className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-foreground">{active.name}</div>
                <div className="mt-0.5 truncate text-[11px] text-muted-foreground">
                  {active.idLabel} · {active.subtitle}
                </div>
                <div className="mt-2.5">
                  <div className="mb-1 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                    <span>Progress</span>
                    <span>{active.progress}</span>
                  </div>
                  <div className="hq-hero-progress">
                    <div
                      className="hq-hero-progress-fill"
                      style={{
                        width: `${Math.round(
                          (Number(active.progress.split('/')[0]) /
                            Math.max(Number(active.progress.split('/')[1]), 1)) *
                            100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
              <span className="hq-hero-ilist-action shrink-0">{active.action}</span>
            </div>
          </div>
        </div>

        <div className="hq-hero-pane-label mt-0.5 px-3">Recent sessions</div>

        <div className="hq-hero-dash-list">
          {INTERVIEWS.slice(0, 3).map((item) => {
            const selected = item.id === activeId
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={['hq-hero-ilist-row', selected ? 'is-active' : ''].join(' ')}
              >
                <span className="hq-hero-ilist-icon">
                  <Mic className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate text-[13px] font-semibold text-foreground">{item.name}</span>
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {item.idLabel} · {item.subtitle}
                  </span>
                </span>
                <span className="hidden shrink-0 items-center gap-2 sm:flex">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
                    <span className={['h-1.5 w-1.5 rounded-full', statusDot(item.status)].join(' ')} />
                    {item.status}
                  </span>
                  <span className="w-8 text-right text-[12px] font-semibold tabular-nums text-foreground">
                    {item.score}
                  </span>
                </span>
                <span className="hq-hero-ilist-action">{item.action}</span>
              </button>
            )
          })}
        </div>
      </section>

      <aside className="hq-hero-dash-meta">
        <div className="px-4 pt-4 text-[13px] font-semibold text-foreground">{active.idLabel}</div>
        <dl className="mt-3 space-y-2.5 px-4 text-[12px]">
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="mt-0.5 flex items-center gap-2 font-medium text-foreground">
              <span className={['h-2 w-2 rounded-full', statusDot(active.status)].join(' ')} />
              {active.status}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Type</dt>
            <dd className="mt-0.5 font-medium text-foreground">{active.type}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Difficulty</dt>
            <dd className="mt-0.5 font-medium text-foreground">{active.difficulty}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Progress</dt>
            <dd className="mt-0.5 font-medium text-foreground">{active.progress}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Time</dt>
            <dd className="mt-0.5 font-medium text-foreground">{active.duration}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Score</dt>
            <dd className="mt-0.5 font-semibold text-[var(--success)]">{active.score}</dd>
          </div>
        </dl>
        <div className="mt-auto border-t border-border px-4 py-3 text-[12px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-[var(--success)]" />
            {active.tipGood}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {active.tipNext}
          </div>
        </div>
      </aside>
    </div>
  )
}

export function Hero() {
  const ref = useReveal<HTMLElement>()
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const isAdmin = session?.user?.role === 'admin'
  const authedEntryHref = isAdmin ? '/dashboard' : '/app/new-interview'
  const primaryHref = isAuthenticated ? authedEntryHref : '/auth'
  const primaryLabel = isAuthenticated ? 'Get started' : 'Get started — free'

  return (
    <section
      id="home"
      ref={ref}
      className="relative isolate overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <Image
          src="/hero-interview-ambient.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="hq-hero-photo object-cover object-center"
        />
        <ConstellationBackground
          className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
          intensity={0.22}
        />
        <div className="hq-hero-atmosphere" />
        <div className="hq-hero-grid" />
        <div className="hq-hero-glow hq-hero-glow--top" />
        <div className="hq-hero-glow hq-hero-glow--stage" />
        <div className="hq-hero-vignette" />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-4 text-center sm:px-6">
        <Link
          href="/auth"
          className="reveal inline-flex items-center gap-2 rounded-full border border-primary/35 bg-primary/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary backdrop-blur-md"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI interview prep
          <ArrowRight className="h-3 w-3" />
        </Link>

        <h1 className="reveal mt-7 max-w-4xl text-[2.75rem] font-bold leading-[1.08] tracking-[-0.03em] text-foreground sm:text-6xl lg:text-[4.5rem] lg:leading-[1.05]">
          Your Shortcut to
          <span className="mt-1 block text-primary sm:mt-2">
            <TypedPhrase text="Interview Success" />
          </span>
        </h1>

        <p
          className="reveal mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-[1.2rem] lg:leading-[1.55]"
          style={{ transitionDelay: '80ms' }}
        >
          Practice realistic mock interviews, get instant AI feedback, and walk in ready.
        </p>

        <div
          className="reveal mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          style={{ transitionDelay: '160ms' }}
        >
          <Link
            href={primaryHref}
            className="hq-btn-primary inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-semibold"
          >
            {primaryLabel}
          </Link>
          <Link
            href="/features"
            className="hq-btn-outline inline-flex h-12 items-center justify-center rounded-full px-7 text-[15px] font-semibold"
          >
            Get a demo
          </Link>
        </div>
      </div>

      <div
        className="reveal relative mx-auto mt-14 w-full max-w-5xl px-4 sm:mt-16 sm:px-6"
        style={{ transitionDelay: '240ms' }}
      >
        <HeroPreview />
      </div>
    </section>
  )
}
