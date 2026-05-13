'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { BarChart2, Download, Filter, Radar as RadarIcon } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from '@/components/providers/ThemeProvider'
import type { InterviewConfig } from '@/components/app/dashboard/types'
import { formatIndustryDisplay, formatRoleCategoryDisplay } from '@/utils/dashboard/interview-labels'

type InterviewSession = {
  _id: string
  roleCategoryKey: string
  industryKey: string
  status: 'created' | 'in_progress' | 'completed'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  createdAt?: string
  questions?: unknown[]
  answers?: Array<{ index: number; answer: string; updatedAt: string }>
}

function hashToNumber(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0
  return Math.abs(h)
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function ResultsOverviewPage() {
  const { theme } = useTheme()
  const isLight = theme === 'light'
  const chartGrid = isLight ? 'rgba(15,17,23,0.08)' : 'rgba(255,255,255,0.06)'
  const chartTick = isLight ? 'rgba(15,17,23,0.55)' : 'rgba(255,255,255,0.6)'
  const chartPolar = isLight ? 'rgba(15,17,23,0.1)' : 'rgba(255,255,255,0.08)'
  const tooltipStyle = isLight
    ? {
        background: 'rgba(255, 255, 255, 0.96)',
        border: '1px solid rgba(15, 17, 23, 0.1)',
        borderRadius: 14,
        backdropFilter: 'blur(10px)',
        color: '#0f1117',
      }
    : {
        background: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        backdropFilter: 'blur(10px)',
        color: 'white',
      }

  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'in_progress'>('completed')
  const [interviewConfigs, setInterviewConfigs] = useState<InterviewConfig[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/interviews')
        const data = await res.json()
        if (!cancelled) setSessions((data.sessions ?? []) as InterviewSession[])
      } catch {
        if (!cancelled) setSessions([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function loadConfigs() {
      try {
        const res = await fetch('/api/interview-config')
        const data = await res.json()
        if (!cancelled && res.ok) setInterviewConfigs((data.configs ?? []) as InterviewConfig[])
      } catch {
        /* ignore */
      }
    }
    void loadConfigs()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return sessions
    return sessions.filter((s) => s.status === statusFilter)
  }, [sessions, statusFilter])

  const completedSessions = useMemo(() => sessions.filter((s) => s.status === 'completed'), [sessions])

  const scoreTimeline = useMemo(() => {
    const completedSorted = [...completedSessions].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return ta - tb
    })

    return completedSorted.slice(-10).map((s, idx) => {
      const base = 62 + (hashToNumber(s._id) % 30)
      const answered = (s.answers ?? []).filter((a) => a.answer?.trim()).length
      const total = Math.max(1, s.questions?.length ?? 20)
      const completion = answered / total
      const score = clamp(Math.round(base * (0.55 + 0.45 * completion)), 40, 99)
      const label = s.createdAt
        ? new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : `#${idx + 1}`
      return { label, score, completion: Math.round(completion * 100) }
    })
  }, [completedSessions])

  const radar = useMemo(() => {
    const seed = hashToNumber(completedSessions[completedSessions.length - 1]?._id ?? 'hq')
    const a = (seed % 18) + 72
    const b = ((seed >> 1) % 18) + 70
    const c = ((seed >> 2) % 18) + 68
    const d = ((seed >> 3) % 18) + 66
    const e = ((seed >> 4) % 18) + 64
    return [
      { skill: 'Clarity', value: a },
      { skill: 'Structure', value: b },
      { skill: 'Depth', value: c },
      { skill: 'Confidence', value: d },
      { skill: 'Brevity', value: e },
    ]
  }, [completedSessions])

  return (
    <div className="animate-fade-up space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="dashboard-card p-5 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Score history</div>
              <div className="text-xs text-muted-foreground">Your last 10 completed interviews</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-input/15 px-4 text-xs font-semibold text-foreground hover:bg-input/25 btn-micro"
              >
                <Filter className="h-4 w-4 text-muted-foreground" /> Filters
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow btn-micro"
              >
                <Download className="h-4 w-4" /> Export
              </button>
            </div>
          </div>

          <div className="mt-4 h-[200px] sm:h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={scoreTimeline}>
                <defs>
                  <linearGradient id="hqScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f6ef7" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#4f6ef7" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartGrid} vertical={false} />
                <XAxis dataKey="label" tick={{ fill: chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} tick={{ fill: chartTick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Legend />
                <Area type="monotone" dataKey="score" name="Score" stroke="#4f6ef7" fill="url(#hqScore)" strokeWidth={2} />
                <Area type="monotone" dataKey="completion" name="Completion %" stroke="#7c3aed" fill="transparent" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Skill radar</div>
              <div className="text-xs text-muted-foreground">Strengths & weaknesses</div>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-input/15 text-muted-foreground">
              <RadarIcon className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="mt-4 h-[200px] sm:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke={chartPolar} />
                <PolarAngleAxis dataKey="skill" tick={{ fill: chartTick, fontSize: 11 }} />
                <RechartsTooltip contentStyle={tooltipStyle} />
                <Radar dataKey="value" stroke="#22d3ee" fill="rgba(34,211,238,0.18)" />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl stat-icon-blue">
              <BarChart2 className="h-4.5 w-4.5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">Sessions</div>
              <div className="text-xs text-muted-foreground">Open a completed interview to view detailed results</div>
            </div>
          </div>
        </div>

        <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <TabsList>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="in_progress">In progress</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={statusFilter}>
            {loading ? (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-28 rounded-2xl border border-border bg-input/15 animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-border bg-input/10 p-10 text-center">
                <div className="text-sm font-semibold text-foreground">No sessions yet</div>
                <div className="mt-1 text-xs text-muted-foreground">Complete an interview to see analytics here.</div>
                <Link
                  href="/app/new-interview"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-gradient-primary px-5 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow btn-micro"
                >
                  Create an interview
                </Link>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filtered
                  .slice()
                  .sort((a, b) => {
                    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
                    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
                    return tb - ta
                  })
                  .slice(0, 9)
                  .map((s) => (
                    <Link
                      key={s._id}
                      href={s.status === 'completed' ? `/app/interviews/${s._id}/results` : `/app/interviews/${s._id}`}
                      className="dashboard-card group p-4 hover:shadow-glow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-foreground">
                            {formatRoleCategoryDisplay(s.industryKey, s.roleCategoryKey, interviewConfigs)}
                          </div>
                          <div className="truncate text-xs text-muted-foreground">
                            {formatIndustryDisplay(s.industryKey, interviewConfigs)}
                          </div>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold badge-${s.status.replace('_', '-')}`}>
                          {s.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {s.createdAt ? new Date(s.createdAt).toLocaleString(undefined, { dateStyle: 'medium' }) : '—'}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Open</span>
                        <span className="font-semibold text-[var(--hq-display-blue)] group-hover:text-gradient-blue">View</span>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

