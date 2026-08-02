'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Route } from 'lucide-react'
import type { LearningPath, UserPathProgress } from '@/components/app/learning-paths/types'

type HomePayload = {
  continueLearning: Array<{ path: LearningPath; progress: UserPathProgress | null }>
  recommended: Array<{ path: LearningPath; reason: string }>
  weakTopics: Array<{ topic: string; avgScore: number }>
}

export function LearningPathsDashboardWidget() {
  const [data, setData] = useState<HomePayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/paths/home')
        const json = await res.json()
        if (!res.ok) throw new Error(json.message)
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setData(null)
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
    return null
  }

  if (!data) return null

  const current = data.continueLearning[0]
  const recommended = data.recommended[0]

  return (
    <div className="dashboard-card space-y-4 p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Route className="h-4 w-4 text-primary" />
          Learning Paths
        </div>
        <Link href="/app/learning-paths" className="text-xs text-primary hover:underline">
          Browse all
        </Link>
      </div>

      {current ? (
        <div className="rounded-xl border border-border bg-input/10 p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Current path
          </div>
          <div className="mt-1 text-sm font-medium text-foreground">{current.path.title}</div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-input/40">
            <div
              className="h-full rounded-full bg-primary"
              style={{
                width: `${current.progress?.analytics?.completionPercent ?? 0}%`,
              }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{current.progress?.analytics?.completionPercent ?? 0}% complete</span>
            <Link
              href={`/app/learning-paths/${current.path.id}`}
              className="inline-flex items-center gap-1 font-medium text-primary"
            >
              Resume <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          No active path yet.{' '}
          <Link href="/app/learning-paths" className="text-primary hover:underline">
            Enroll to get started
          </Link>
        </p>
      )}

      {recommended ? (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Recommended next
          </div>
          <Link
            href={`/app/learning-paths/${recommended.path.id}`}
            className="mt-1 block text-sm font-medium text-foreground hover:text-primary"
          >
            {recommended.path.title}
          </Link>
          <p className="text-xs text-muted-foreground">{recommended.reason}</p>
        </div>
      ) : null}

      {data.weakTopics.length > 0 ? (
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Weak topics
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.weakTopics.slice(0, 6).map((t) => (
              <span
                key={t.topic}
                className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {t.topic} ({t.avgScore}%)
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
