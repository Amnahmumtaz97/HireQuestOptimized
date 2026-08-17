'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

function pickFirstName(value?: string | null) {
  const trimmed = value?.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0] || ''
}

export function DashboardWelcomeHeader() {
  const { data: session, status } = useSession()
  const [accountFirstName, setAccountFirstName] = useState('')

  useEffect(() => {
    const fromSession =
      pickFirstName(session?.user?.firstName) || pickFirstName(session?.user?.name)
    if (fromSession || status === 'loading') return

    let cancelled = false
    void (async () => {
      try {
        const res = await fetch('/api/account')
        if (!res.ok) return
        const data = (await res.json()) as { firstName?: string }
        if (!cancelled) setAccountFirstName(pickFirstName(data.firstName))
      } catch {
        // ignore — keep empty until session has a name
      }
    })()

    return () => {
      cancelled = true
    }
  }, [session?.user?.firstName, session?.user?.name, status])

  const firstName =
    pickFirstName(session?.user?.firstName) ||
    pickFirstName(session?.user?.name) ||
    accountFirstName

  return (
    <header className="min-w-0">
      <h1 className="hq-dash-welcome-title">
        Welcome back
        {firstName ? (
          <>
            , <span className="hq-page-title-accent">{firstName}</span>
          </>
        ) : status === 'loading' ? (
          <span className="hq-page-title-accent">…</span>
        ) : null}
      </h1>
      <p className="hq-dash-welcome-sub mt-1.5">
        Activity snapshot, upcoming interviews &amp; progress.
      </p>
    </header>
  )
}
