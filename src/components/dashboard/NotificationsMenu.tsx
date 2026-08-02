'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Lightbulb,
  Sparkles,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type NotificationType = 'good' | 'warn' | 'tip'

type AppNotification = {
  id: string
  type: NotificationType
  title: string
  body: string
  time: string
  href?: string
}

const STORAGE_KEY = 'hirequest.notifications.read'

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'good',
    title: 'Results ready',
    body: 'Your Frontend mock interview scorecard is ready to review.',
    time: '2h ago',
    href: '/app/results',
  },
  {
    id: 'n2',
    type: 'good',
    title: 'Confidence up',
    body: 'Your confidence score rose 14% this week. Keep the streak going.',
    time: 'Yesterday',
    href: '/app/analytics',
  },
  {
    id: 'n3',
    type: 'warn',
    title: 'Practice reminder',
    body: 'You have an in-progress interview waiting. Finish it while it is fresh.',
    time: 'Yesterday',
    href: '/app/interviews',
  },
  {
    id: 'n4',
    type: 'tip',
    title: 'Tip: STAR structure',
    body: 'Lead behavioral answers with Situation → Task → Action → Result.',
    time: '3d ago',
    href: '/app/new-interview',
  },
  {
    id: 'n5',
    type: 'warn',
    title: 'Mention trade-offs',
    body: 'Interviewers score higher when you explain why you chose an approach.',
    time: '4d ago',
  },
]

function NotificationIcon({ type }: { type: NotificationType }) {
  if (type === 'good') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
        <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
    )
  }
  if (type === 'warn') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-warning-muted text-warning">
        <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2.4} />
      </span>
    )
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-info-muted text-info">
      <Lightbulb className="h-3.5 w-3.5" strokeWidth={2.4} />
    </span>
  )
}

function readStoredIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function NotificationsMenu() {
  const [readIds, setReadIds] = useState<string[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReadIds(readStoredIds())
    setReady(true)
  }, [])

  const persist = useCallback((ids: string[]) => {
    setReadIds(ids)
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    } catch {
      // ignore
    }
  }, [])

  const unreadCount = useMemo(() => {
    if (!ready) return 0
    return SEED_NOTIFICATIONS.filter((n) => !readIds.includes(n.id)).length
  }, [ready, readIds])

  const markAllRead = useCallback(() => {
    persist(SEED_NOTIFICATIONS.map((n) => n.id))
  }, [persist])

  const markRead = useCallback(
    (id: string) => {
      if (readIds.includes(id)) return
      persist([...readIds, id])
    },
    [persist, readIds],
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          suppressHydrationWarning
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        >
          <Bell className="h-4.5 w-4.5" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-500 px-1 text-[9px] font-bold leading-none text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[min(92vw,360px)] p-0 overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-border/70 px-3 py-2.5">
          <DropdownMenuLabel className="flex items-center gap-1.5 p-0 text-[13px] font-bold">
            <Sparkles className="h-3.5 w-3.5 text-primary" strokeWidth={2} />
            Live updates
          </DropdownMenuLabel>
          <div className="flex items-center gap-2">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="text-[11px] font-semibold text-muted-foreground hover:text-foreground"
              >
                Mark all read
              </button>
            ) : null}
            <span className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-input/20 px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
              <Lightbulb className="h-3 w-3 text-amber-500" strokeWidth={2} />
              Tips
            </span>
          </div>
        </div>

        <ul className="max-h-[min(70vh,380px)] space-y-1.5 overflow-y-auto p-2.5">
          {SEED_NOTIFICATIONS.map((n) => {
            const unread = ready && !readIds.includes(n.id)
            const rowClass = [
              'flex w-full items-start gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors',
              n.type === 'good'
                ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
                : n.type === 'warn'
                  ? 'border-amber-500/25 bg-amber-500/[0.06]'
                  : 'border-border/60 bg-input/15',
              unread ? 'ring-1 ring-primary/20' : 'opacity-90',
            ].join(' ')

            const inner = (
              <>
                <NotificationIcon type={n.type} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[12px] font-bold text-foreground">{n.title}</span>
                    <span className="shrink-0 text-[10px] font-medium text-muted-foreground">{n.time}</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{n.body}</span>
                </span>
                {unread ? (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                ) : (
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0" aria-hidden />
                )}
              </>
            )

            return (
              <li key={n.id}>
                {n.href ? (
                  <Link href={n.href} className={rowClass} onClick={() => markRead(n.id)}>
                    {inner}
                  </Link>
                ) : (
                  <button type="button" className={rowClass} onClick={() => markRead(n.id)}>
                    {inner}
                  </button>
                )}
              </li>
            )
          })}
        </ul>

        <DropdownMenuSeparator className="m-0" />
        <div className="px-3 py-2.5">
          <Link
            href="/app/settings?tab=notifications"
            className="block text-center text-[11px] font-semibold text-muted-foreground hover:text-foreground"
          >
            Notification preferences
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
