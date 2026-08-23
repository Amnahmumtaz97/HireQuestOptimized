'use client'

import { useState, useEffect } from 'react'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { AlertBanner } from '@/components/ui/alert-banner'
import { KpiGrid } from '@/components/app/analytics/KpiGrid'
import { PerformanceTrend } from '@/components/app/analytics/PerformanceTrend'
import { SkillBreakdown } from '@/components/app/analytics/SkillBreakdown'
import { ActivityCalendar } from '@/components/app/analytics/ActivityCalendar'
import { LearningPathProgress } from '@/components/app/analytics/LearningPathProgress'
import { NextActionsPanel } from '@/components/app/analytics/NextActionsPanel'


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

const TIME_RANGES = ['7 days', '30 days', 'All time'] as const
type TimeRange = (typeof TIME_RANGES)[number]

export function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [range, setRange] = useState<TimeRange>('All time')

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
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <BounceLoader label="Loading analytics…" />
      </div>
    )
  }

  if (error || !data) {
    return <AlertBanner variant="error">{error || 'No analytics data available.'}</AlertBanner>
  }

  const { gamification: gam, analytics: an } = data

  return (
    <div className="space-y-5">
      {/* ── Time-range tab bar ── */}
      <div className="flex items-center gap-1 rounded-xl border border-border bg-card/60 p-1 w-fit">
        {TIME_RANGES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={[
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
              range === r
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {r}
          </button>
        ))}
      </div>

      {/* ── KPI Grid ── */}
      <KpiGrid
        interviewsCompleted={an.interviewsCompleted}
        questionsAnswered={an.questionsAnswered}
        timeSpentMinutes={an.timeSpentMinutes}
        currentStreak={gam.currentStreak}
        longestStreak={gam.longestStreak}
        xp={gam.xp}
        confidenceScore={an.interviewConfidenceScore}
      />

      {/* ── Trend + Skill row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PerformanceTrend feedbackTrend={an.feedbackTrend ?? []} />
        </div>
        <div className="lg:col-span-1">
          <SkillBreakdown
            questionsAnswered={an.questionsAnswered}
            interviewsCompleted={an.interviewsCompleted}
            confidenceScore={an.interviewConfidenceScore}
          />
        </div>
      </div>

      {/* ── Activity heatmap ── */}
      <ActivityCalendar interviewsCompleted={an.interviewsCompleted} />

      {/* ── Paths + Next Actions row ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LearningPathProgress
            pathsEnrolled={an.pathsEnrolled}
            pathsCompleted={an.pathsCompleted}
          />
        </div>
        <div className="lg:col-span-1">
          <NextActionsPanel
            interviewsCompleted={an.interviewsCompleted}
            currentStreak={gam.currentStreak}
            confidenceScore={an.interviewConfidenceScore}
            pathsEnrolled={an.pathsEnrolled}
          />
        </div>
      </div>
    </div>
  )
}
