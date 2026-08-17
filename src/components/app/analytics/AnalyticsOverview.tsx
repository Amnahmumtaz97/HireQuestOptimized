'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { AlertBanner } from '@/components/ui/alert-banner'

type AnalyticsPayload = {
  gamification: {
    xp: number
    currentStreak: number
    longestStreak: number
    interviewsCompleted: number
    questionsAnswered: number
  }
  analytics: {
    interviewsCompleted: number
    questionsAnswered: number
    timeSpentMinutes: number
    pathsEnrolled: number
    pathsCompleted: number
    interviewConfidenceScore: number | null
    feedbackTrend: number[]
  }
}

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/users/me/learning-analytics')
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Failed to load analytics')
        if (!cancelled) setData(json as AnalyticsPayload)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load analytics')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <BounceLoader label="Loading analytics" />
      </div>
    )
  }

  if (error || !data) {
    return <AlertBanner variant="error">{error || 'No analytics yet.'}</AlertBanner>
  }

  const confidence = data.analytics.interviewConfidenceScore ?? 0
  const completed = data.analytics.interviewsCompleted

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="dashboard-card p-6 lg:col-span-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
              Performance overview
            </div>
            <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              Your practice at a glance
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Built from completed interviews and learning-path progress.
            </div>
          </div>
          <div className="hidden sm:block">
            <ProgressRing size={72} progress={confidence / 100} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Interviews completed" value={String(completed)} hint="All time" />
          <Stat
            label="Questions answered"
            value={String(data.analytics.questionsAnswered)}
            hint={`${data.gamification.xp} XP earned`}
          />
          <Stat
            label="Current streak"
            value={`${data.gamification.currentStreak}d`}
            hint={`Best ${data.gamification.longestStreak}d`}
          />
        </div>
      </div>

      <div className="dashboard-card p-6">
        <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">
          Keep going
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          {completed === 0
            ? 'Complete an interview to unlock trends here.'
            : `${data.analytics.pathsEnrolled} paths enrolled · ${data.analytics.pathsCompleted} completed.`}
        </div>
        <ul className="mt-3 space-y-2 text-sm text-foreground">
          <li>
            <Link href="/app/question-bank" className="text-primary hover:underline">
              Practice a topic from the question bank
            </Link>
          </li>
          <li>
            <Link href="/app/mocks" className="text-primary hover:underline">
              Start a mock interview
            </Link>
          </li>
          <li>
            <Link href="/app/learning-paths" className="text-primary hover:underline">
              Continue a learning path
            </Link>
          </li>
        </ul>
      </div>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-[var(--hq-stat-surface)] p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  )
}
