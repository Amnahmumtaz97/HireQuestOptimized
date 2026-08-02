'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Flame, Sparkles } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { ListPagination } from '@/components/ui/list-pagination'
import { useToast } from '@/components/ui/toast'
import { useClientPagination } from '@/hooks/useClientPagination'

type AnalyticsPayload = {
  gamification: {
    xp: number
    currentStreak: number
    longestStreak: number
    interviewsCompleted: number
    questionsAnswered: number
  }
  analytics: {
    timeSpentMinutes: number
    pathsEnrolled: number
    pathsCompleted: number
    interviewConfidenceScore: number | null
  }
  achievements: Array<{
    id: string
    key: string
    title: string
    description: string
  }>
}

export function LearningPathsProgressPanel() {
  const toast = useToast()
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [creatingResumePath, setCreatingResumePath] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/users/me/learning-analytics')
        const json = await res.json()
        if (!res.ok) throw new Error(json.message || 'Failed to load')
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

  async function createResumePath() {
    setCreatingResumePath(true)
    try {
      let skills: string[] = []
      try {
        const raw = localStorage.getItem('hirequest.profile.v1')
        if (raw) {
          const parsed = JSON.parse(raw) as { skills?: string[] }
          skills = (parsed.skills || []).filter(Boolean).slice(0, 12)
        }
      } catch {
        /* ignore */
      }
      if (skills.length === 0) {
        toast.error('Add skills on your Profile page first, then create a resume path.')
        return
      }
      const res = await fetch('/api/paths/from-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Could not create path')
      toast.success('Personalized resume path created')
      window.location.href = `/app/learning-paths/${json.path.id}`
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not create path')
    } finally {
      setCreatingResumePath(false)
    }
  }

  if (loading) {
    return null
  }

  if (!data) return null

  const g = data.gamification
  const a = data.analytics

  return (
    <AchievementsBlock data={data} g={g} a={a} creatingResumePath={creatingResumePath} onCreateResumePath={() => void createResumePath()} />
  )
}

function AchievementsBlock({
  data,
  g,
  a,
  creatingResumePath,
  onCreateResumePath,
}: {
  data: AnalyticsPayload
  g: AnalyticsPayload['gamification']
  a: AnalyticsPayload['analytics']
  creatingResumePath: boolean
  onCreateResumePath: () => void
}) {
  const {
    page: achPage,
    setPage: setAchPage,
    pageItems: pagedAchievements,
    totalPages: achTotalPages,
  } = useClientPagination(data.achievements, 8)

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dashboard-card flex items-center gap-3 p-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">XP</div>
            <div className="text-lg font-semibold">{g.xp}</div>
          </div>
        </div>
        <div className="dashboard-card flex items-center gap-3 p-4">
          <Flame className="h-5 w-5 text-orange-400" />
          <div>
            <div className="text-[11px] uppercase text-muted-foreground">Streak</div>
            <div className="text-lg font-semibold">
              {g.currentStreak}d
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (best {g.longestStreak})
              </span>
            </div>
          </div>
        </div>
        <div className="dashboard-card p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Practice</div>
          <div className="mt-1 text-sm text-foreground">
            {g.interviewsCompleted} interviews · {g.questionsAnswered} answers
          </div>
          <div className="text-xs text-muted-foreground">
            ~{a.timeSpentMinutes} min · confidence{' '}
            {a.interviewConfidenceScore != null ? `${a.interviewConfidenceScore}%` : '—'}
          </div>
        </div>
        <div className="dashboard-card p-4">
          <div className="text-[11px] uppercase text-muted-foreground">Paths</div>
          <div className="mt-1 text-sm text-foreground">
            {a.pathsEnrolled} enrolled · {a.pathsCompleted} completed
          </div>
          <LoadingButton
            type="button"
            loading={creatingResumePath}
            loadingLabel="Creating…"
            onClick={onCreateResumePath}
            className="hq-btn-outline mt-2 h-8 rounded-lg px-3 text-[11px]"
          >
            Create resume path
          </LoadingButton>
        </div>
      </div>

      {data.achievements.length > 0 ? (
        <div className="dashboard-card space-y-3 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Trophy className="h-4 w-4 text-primary" /> Achievements
          </div>
          <div className="flex flex-wrap gap-2">
            {pagedAchievements.map((ach) => (
              <span
                key={ach.id}
                title={ach.description}
                className="rounded-full border border-border bg-input/20 px-3 py-1 text-xs text-foreground"
              >
                {ach.title}
              </span>
            ))}
          </div>
          <ListPagination page={achPage} totalPages={achTotalPages} onPageChange={setAchPage} />
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Complete interviews to earn XP, streaks, and achievements.{' '}
          <Link href="/app/new-interview" className="text-primary underline-offset-2 hover:underline">
            Start practicing
          </Link>
        </p>
      )}
    </div>
  )
}
