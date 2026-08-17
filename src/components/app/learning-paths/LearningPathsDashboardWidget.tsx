'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Route, BookOpen, TrendingUp, AlertCircle, Plus } from 'lucide-react'
import type { LearningPath, UserPathProgress } from '@/components/app/learning-paths/types'

type HomePayload = {
  continueLearning: Array<{ path: LearningPath; progress: UserPathProgress | null }>
  recommended: Array<{ path: LearningPath; reason: string }>
  weakTopics: Array<{ topic: string; avgScore: number }>
}

function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full bg-primary transition-all duration-500"
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  )
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
    return () => { cancelled = true }
  }, [])

  const current = data?.continueLearning[0] ?? null
  const recommended = data?.recommended[0] ?? null
  const weakTopics = data?.weakTopics ?? []

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-primary/30 bg-primary/10">
            <Route className="h-3.5 w-3.5 text-primary" />
          </span>
          <span className="text-sm font-bold tracking-tight text-foreground">Learning Paths</span>
        </div>
        <Link
          href="/app/learning-paths"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Browse all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Current path */}
      <div className="rounded-lg border border-border bg-card/60 p-4">
        <div className="mb-3 flex items-center gap-1.5">
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-primary" />
          <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            Current path
          </span>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-muted" />
            <div className="h-1.5 w-full animate-pulse rounded-full bg-muted" />
          </div>
        ) : current ? (
          <>
            <div className="mb-2.5 text-sm font-semibold text-foreground">{current.path.title}</div>
            <ProgressBar pct={current.progress?.analytics?.completionPercent ?? 0} />
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
              <span>{current.progress?.analytics?.completionPercent ?? 0}% complete</span>
              <Link
                href={`/app/learning-paths/${current.path.id}`}
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                Resume <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="mb-2 text-xs text-muted-foreground">No active path yet.</p>
            <Link
              href="/app/learning-paths"
              className="inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20"
            >
              <Plus className="h-3 w-3" /> Enroll now
            </Link>
          </div>
        )}
      </div>

      {/* Recommended next */}
      {!loading && recommended ? (
        <div className="rounded-lg border border-border bg-card/60 p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Recommended next
            </span>
          </div>
          <Link
            href={`/app/learning-paths/${recommended.path.id}`}
            className="block text-sm font-semibold text-foreground hover:text-primary"
          >
            {recommended.path.title}
          </Link>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{recommended.reason}</p>
          <Link
            href={`/app/learning-paths/${recommended.path.id}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-input/20 px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-input/40"
          >
            View path <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : null}

      {/* Weak topics */}
      {!loading && weakTopics.length > 0 ? (
        <div className="rounded-lg border border-border bg-card/60 p-4">
          <div className="mb-3 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Weak topics
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {weakTopics.slice(0, 8).map((t) => (
              <span
                key={t.topic}
                className="inline-flex items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/8 px-2 py-0.5 text-[10px] font-medium text-amber-400"
              >
                {t.topic}
                <span className="opacity-60">({t.avgScore}%)</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Quick action */}
      <Link
        href="/app/new-interview"
        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/18"
      >
        <Plus className="h-4 w-4" />
        Start new interview
      </Link>
    </div>
  )
}
