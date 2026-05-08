'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { DifficultySelector, type Difficulty } from '@/components/app/DifficultySelector'
import { InterviewTypeSelector, type InterviewType } from '@/components/app/InterviewTypeSelector'
import { StartInterviewButton } from '@/components/app/StartInterviewButton'
import { TopicSelector, type TopicMode } from '@/components/app/TopicSelector'
import {
  MessageSquare, BarChart2, User,
  Plus, RotateCcw, Activity, CheckCircle2,
  Clock, Sparkles, CreditCard,
  Briefcase, Tag, AlarmClock, ArrowLeft, ArrowRight,
  Trash2, Lightbulb, ListChecks,
} from 'lucide-react'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { AIAssistantCard } from '@/components/dashboard/AIAssistantCard'
import { defaultMonthToDateRange } from '@/utils/dashboard/date'
import { formatDifficultyLabel, formatInterviewTypeLabel } from '@/utils/dashboard/interview-labels'
import { InterviewDeleteModal } from '@/components/app/InterviewDeleteModal'
import { DashboardDateCalendarButton } from '@/components/app/dashboard/DashboardDateCalendarButton'
import { useToast } from '@/components/ui/toast'
import { IconCard, IconGrid } from '@/components/ui/icon-card'
import { getIndustryIcon, getRoleIcon } from '@/lib/icon-mapping'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'
import type { InterviewConfig, InterviewSession } from '@/components/app/dashboard/types'

// Types moved to `src/components/app/dashboard/types.ts`.

export type WizardStepKey = 'role' | 'topics' | 'difficulty' | 'interviewType' | 'generate'

const WIZARD_STEP_ORDER: WizardStepKey[] = ['role', 'topics', 'difficulty', 'interviewType', 'generate']

function WizardStepper({
  steps,
  active,
  onSelect,
}: {
  steps: Array<{ key: WizardStepKey; label: string; isComplete: boolean }>
  active: WizardStepKey
  onSelect: (key: WizardStepKey) => void
}) {
  return (
    <div className="w-full rounded-2xl border border-border bg-input/10 p-4 sm:p-5">
      <div className="flex w-full min-w-0 justify-between gap-1.5 overflow-x-auto pb-0.5 sm:gap-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {steps.map((s, idx) => {
          const isActive = s.key === active
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect(s.key)}
              className={[
                'hq-wiz-step-btn hq-btn-lg',
                isActive
                  ? 'hq-wiz-step-btn--active'
                  : s.isComplete
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/15'
                    : 'border-border bg-input/20 text-muted-foreground hover:text-foreground hover:bg-input/30',
              ].join(' ')}
            >
              <span
                className={[
                  'hq-wiz-step-num',
                  isActive
                    ? 'hq-wiz-step-num--active'
                    : s.isComplete
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : 'border-border bg-input/10',
                ].join(' ')}
                aria-hidden
              >
                {s.isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <span className="truncate sm:whitespace-nowrap">{s.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SelectCard({
  title, subtitle, selected, onClick,
}: {
  title: string; subtitle?: string; selected: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full rounded-2xl border p-4 text-left btn-micro',
        selected
          ? 'border-[var(--hq-display-blue)] bg-input/50 shadow-glow-sm'
          : 'border-border bg-input/30 hover:bg-input/50',
      ].join(' ')}
    >
      <div className="text-sm font-semibold text-foreground">{title}</div>
      {subtitle ? <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div> : null}
    </button>
  )
}

// ---- App Dashboard Panel ----
export function AppDashboardPanel() {
  const router = useRouter()
  const defaultRange = useMemo(() => defaultMonthToDateRange(), [])
  const [startDate, setStartDate] = useState(defaultRange.start)
  const [endDate, setEndDate] = useState(defaultRange.end)
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/interviews')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions ?? [])
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  const displayedSessions = useMemo(() => {
    const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY
    const endMs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY

    return [...sessions]
      .filter((s) => {
        if (!s.createdAt) return true
        const t = new Date(s.createdAt).getTime()
        return t >= startMs && t <= endMs
      })
      .sort((a, b) => {
        const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return tb - ta // newest first
      })
  }, [endDate, sessions, startDate])

  const totalInterviews = displayedSessions.length
  const completed = displayedSessions.filter((s) => s.status === 'completed').length
  const inProgress = displayedSessions.filter((s) => s.status === 'in_progress').length
  const completionRate = totalInterviews > 0 ? ((completed / totalInterviews) * 100).toFixed(2) : '0.00'
  const completionPct = totalInterviews > 0 ? Math.min(100, (completed / totalInterviews) * 100) : 0

  const difficultyTagClass = (d: string) => {
    if (d === 'Easy') return 'hq-tag hq-tag--easy'
    if (d === 'Medium') return 'hq-tag hq-tag--medium'
    return 'hq-tag hq-tag--hard'
  }

  const interviewTypeTagClass = (t: string) => {
    if (t === 'behavioral') return 'hq-tag hq-tag--accent'
    return 'hq-tag hq-tag--purple'
  }

  const statusTagClass = (status: InterviewSession['status']) => {
    if (status === 'completed') return 'hq-tag hq-tag--easy'
    if (status === 'in_progress') return 'hq-tag hq-tag--medium'
    return 'hq-tag hq-tag--accent'
  }

  return (
    <div className="animate-fade-up space-y-6 sm:space-y-7">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="xl:col-span-2">
          <Card className="relative overflow-hidden p-6">
            <div className="pointer-events-none absolute inset-0 bg-mesh opacity-25" aria-hidden />
            <div className="pointer-events-none absolute -inset-8 bg-gradient-to-r from-primary/18 via-purple-500/10 to-cyan-400/10 blur-2xl" aria-hidden />

            <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button variant="primary" size="sm" onClick={() => router.push('/app/new-interview')}>
                  <Plus className="h-4 w-4" aria-hidden /> <span className="hidden sm:inline">New</span>
                </Button>
                <Button variant="secondary" size="sm" onClick={() => router.push('/app/interviews')}>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden /> <span className="hidden sm:inline">Manage</span>
                </Button>
              </div>

              <div className="shrink-0">
                <div className="relative w-full max-w-[280px] overflow-hidden rounded-3xl border border-glass-strong bg-input/8 p-4 ring-neon lottie-wrapper">
                  <div
                    className="pointer-events-none absolute -inset-10 opacity-35 blur-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(79,110,247,0.35), rgba(124,58,237,0.18), rgba(34,211,238,0.14))' }}
                    aria-hidden
                  />
                  <div className="relative">
                    <div className="overflow-hidden rounded-2xl border border-glass bg-black/10">
                      <DotLottieReact src="/Robot%20Automation%20Gif.lottie" autoplay loop className="lottie-illustration" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/75">Total interviews</div>
              <div className="mt-2 font-mono text-3xl font-semibold tracking-tight text-gradient">
                {isLoading ? '—' : totalInterviews}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">In selected range</div>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-glass bg-input/10 ring-neon">
              <User className="h-5 w-5 text-primary-glow" aria-hidden />
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/75">Completion rate</div>
              <div className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">
                {isLoading ? '—' : `${completionRate}%`}
              </div>
              {!isLoading && totalInterviews > 0 ? (
                <div className="mt-3 h-2 rounded-full bg-input/12 overflow-hidden border border-glass">
                  <div
                    className="h-full rounded-full bg-gradient-primary"
                    style={{ width: `${completionPct}%` }}
                    aria-hidden
                  />
                </div>
              ) : (
                <div className="mt-3 text-xs text-muted-foreground">No sessions yet</div>
              )}
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-glass bg-input/10">
              <Activity className="h-5 w-5 text-amber-400" aria-hidden />
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/75">In progress</div>
              <div className="mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">
                {isLoading ? '—' : inProgress}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Live now</div>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-glass bg-input/10">
              <Clock className="h-5 w-5 text-emerald-400" aria-hidden />
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/75">Subscription</div>
              <div className="mt-2 text-lg font-semibold tracking-tight text-foreground">Active</div>
              <div className="mt-1 text-xs text-muted-foreground">$9.99 / month</div>
            </div>
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-glass bg-input/10">
              <CreditCard className="h-5 w-5 text-purple-300" aria-hidden />
            </span>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Interviews</h2>
            <p className="mt-1 text-xs text-muted-foreground">Sessions for the selected date range.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <DashboardDateCalendarButton
              id="dash-start-date"
              label="Start date"
              value={startDate}
              maxDate={endDate}
              onChange={(iso) => {
                setStartDate(iso)
                if (endDate && iso > endDate) setEndDate(iso)
              }}
            />
            <span className="text-muted-foreground" aria-hidden>
              —
            </span>
            <DashboardDateCalendarButton
              id="dash-end-date"
              label="End date"
              value={endDate}
              minDate={startDate}
              onChange={(iso) => {
                setEndDate(iso)
                if (startDate && iso < startDate) setStartDate(iso)
              }}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">Loading…</div>
        ) : displayedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--hq-row-elevated)]">
              <BarChart2 className="h-7 w-7 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">No interviews in this date range.</p>
          </div>
        ) : (
          <div className="flex max-h-[min(28rem,60vh)] flex-col gap-2 overflow-y-auto pr-1">
            {displayedSessions.map((s) => (
              <div key={s._id} className="hq-interview-row">
                <div className="hq-int-icon">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="hq-int-name capitalize">{s.roleCategoryKey.replace(/_/g, ' ')}</div>
                  <div className="hq-int-meta">
                    <span>
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
                        : '—'}
                    </span>
                    <span className="hq-dot" aria-hidden />
                    <span className={interviewTypeTagClass(s.interviewType)}>
                      {formatInterviewTypeLabel(s.interviewType)}
                    </span>
                    <span className={difficultyTagClass(s.difficulty)}>{formatDifficultyLabel(s.difficulty)}</span>
                    <span>
                      {s.totalQuestions}Q
                      {typeof s.questions?.length === 'number' ? ` · ${s.questions.length} generated` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className={`${statusTagClass(s.status)} capitalize`}>{s.status.replace('_', ' ')}</span>
                  <button
                    type="button"
                    title="Delete session"
                    onClick={() => setDeleteTargetId(s._id)}
                    className="hq-action-btn hq-action-btn--danger btn-micro hover:bg-red-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <InterviewDeleteModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        interviewId={deleteTargetId}
        onDeleted={(id) => setSessions((prev) => prev.filter((s) => s._id !== id))}
      />
    </div>
  )
}

// ---- Interviews Panel ----
export function InterviewsPanel() {
  const router = useRouter()
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'created' | 'in_progress' | 'completed'>('all')
  const [query, setQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard'>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const loadSessions = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/interviews')
      if (res.ok) {
        const data = await res.json()
        setSessions(data.sessions ?? [])
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSessions()
  }, [loadSessions])

  useEffect(() => {
    setPage(1)
  }, [filter, query, difficultyFilter, startDate, endDate])

  const filtered = useMemo(
    () => {
      const q = query.trim().toLowerCase()
      const startMs = startDate ? new Date(`${startDate}T00:00:00`).getTime() : Number.NEGATIVE_INFINITY
      const endMs = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Number.POSITIVE_INFINITY

      return sessions
        .filter((s) => (filter === 'all' ? true : s.status === filter))
        .filter((s) => (difficultyFilter === 'all' ? true : s.difficulty === difficultyFilter))
        .filter((s) => {
          if (!s.createdAt) return true
          const t = new Date(s.createdAt).getTime()
          return t >= startMs && t <= endMs
        })
        .filter((s) => {
          if (!q) return true
          const role = s.roleCategoryKey?.replace(/_/g, ' ') ?? ''
          const industry = s.industryKey ?? ''
          return `${role} ${industry}`.toLowerCase().includes(q)
        })
    },
    [sessions, filter, query, difficultyFilter, startDate, endDate],
  )

  const sorted = useMemo(() => (
    [...filtered].sort((a, b) => {
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return tb - ta // newest first
    })
  ), [filtered])

  const statusLabel: Record<string, string> = { created: 'Created', in_progress: 'In Progress', completed: 'Completed' }
  const difficultyColor: Record<string, string> = {
    Easy: 'text-emerald-400', Medium: 'text-amber-400', Hard: 'text-red-400',
  }

  const pageSize = 9
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [safePage, sorted])

  const pageNumbers = useMemo(() => {
    const out: number[] = []
    const radius = 2
    const start = Math.max(1, safePage - radius)
    const end = Math.min(totalPages, safePage + radius)
    for (let p = start; p <= end; p++) out.push(p)
    return out
  }, [safePage, totalPages])

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(['all', 'created', 'in_progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                'hq-panel-btn btn-micro',
                filter === f ? 'hq-panel-btn--active' : '',
              ].join(' ')}
            >
              {f === 'all' ? 'All' : statusLabel[f]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => router.push('/app/new-interview')}
          className="hq-btn-primary hq-btn-lg inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> New Interview
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-border bg-input/10 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Role, industry…"
            className="h-10 w-full rounded-xl border border-border bg-input/15 px-3 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">Difficulty</span>
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value as typeof difficultyFilter)}
            className="h-10 w-full rounded-xl border border-border bg-input/15 px-3 text-sm"
          >
            <option value="all">All</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              const v = e.target.value
              setStartDate(v)
              if (endDate && v && v > endDate) setEndDate(v)
            }}
            className="h-10 w-full rounded-xl border border-border bg-input/15 px-3 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              const v = e.target.value
              setEndDate(v)
              if (startDate && v && v < startDate) setStartDate(v)
            }}
            className="h-10 w-full rounded-xl border border-border bg-input/15 px-3 text-sm"
          />
        </label>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 rounded-2xl border border-border bg-input/20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 rounded-xl border border-border bg-input/10">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            {filter === 'all' ? 'No interviews yet.' : `No ${statusLabel[filter]?.toLowerCase()} interviews.`}
          </p>
          <button type="button" onClick={() => router.push('/app/new-interview')} className="hq-btn-primary hq-btn-lg">
            Create your first interview
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((s) => (
              <div
                key={s._id}
                className="dashboard-card p-5 flex flex-col justify-between gap-4 group min-h-[150px]"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-input/40 stat-icon-blue">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="hq-int-name font-semibold truncate capitalize">
                      {s.roleCategoryKey.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">{s.industryKey}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" aria-hidden />
                        {formatInterviewTypeLabel(s.interviewType)}
                      </span>
                      <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" />{s.questions?.length ?? 0}/{s.totalQuestions} Qs</span>
                      <span className={`font-medium ${difficultyColor[s.difficulty] ?? ''}`}>
                        {formatDifficultyLabel(s.difficulty)}
                      </span>
                      {s.durationMinutes && (
                        <span className="flex items-center gap-1"><AlarmClock className="h-3 w-3" />{s.durationMinutes}m</span>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold badge-${s.status.replace('_', '-')}`}>
                    {statusLabel[s.status]}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2">
                  {s.status === 'created' ? (
                    <button type="button" onClick={() => router.push(`/app/interviews/${s._id}`)} className="hq-btn-primary hq-btn-lg">
                      Start Interview
                    </button>
                  ) : null}
                  {s.status === 'in_progress' ? (
                    <button type="button" onClick={() => router.push(`/app/interviews/${s._id}`)} className="hq-btn-outline-accent btn-micro">
                      Resume
                    </button>
                  ) : null}
                  {s.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/app/interviews/${s._id}/results`)}
                      className="hq-panel-btn min-h-9 px-4 py-2 text-xs font-semibold"
                    >
                      View Results
                    </button>
                  ) : null}
                  <button
                    type="button"
                    title="Delete session"
                    onClick={() => setDeleteTargetId(s._id)}
                    className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-border bg-input/30 text-muted-foreground btn-micro hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Page <strong className="text-foreground">{safePage}</strong> of{' '}
              <strong className="text-foreground">{totalPages}</strong>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold disabled:pointer-events-none disabled:opacity-45"
              >
                Prev
              </button>

              {pageNumbers[0] && pageNumbers[0] > 1 ? (
                <>
                  <button type="button" onClick={() => setPage(1)} className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold">
                    1
                  </button>
                  {pageNumbers[0] > 2 ? <span className="px-1 text-xs text-muted-foreground">…</span> : null}
                </>
              ) : null}

              {pageNumbers.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={['hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold', p === safePage ? 'hq-panel-btn--active' : ''].join(' ')}
                >
                  {p}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] && pageNumbers[pageNumbers.length - 1] < totalPages ? (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 ? <span className="px-1 text-xs text-muted-foreground">…</span> : null}
                  <button type="button" onClick={() => setPage(totalPages)} className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold">
                    {totalPages}
                  </button>
                </>
              ) : null}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold disabled:pointer-events-none disabled:opacity-45"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <InterviewDeleteModal
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTargetId(null)
        }}
        interviewId={deleteTargetId}
        onDeleted={(id) => setSessions((prev) => prev.filter((s) => s._id !== id))}
      />
    </div>
  )
}

export function CreateInterviewWizard() {
  const router = useRouter()
  const toast = useToast()
  const [configs, setConfigs] = useState<InterviewConfig[]>([])
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState('')

  const [industryKey, setIndustryKey] = useState('')
  const [roleCategoryKey, setRoleCategoryKey] = useState('')
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [technicalRatio, setTechnicalRatio] = useState(70)
  const [duration, setDuration] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium')
  const [totalQuestions, setTotalQuestions] = useState(20)
  const [topicSearch, setTopicSearch] = useState('')
  const [topicMode, setTopicMode] = useState<TopicMode>('all')
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isCreatingInterview, setIsCreatingInterview] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [wizardStep, setWizardStep] = useState<WizardStepKey>('role')
  const [wizardError, setWizardError] = useState('')
  /** Prevents skipping ahead to Type/Generate before continuing past the Difficulty step */
  const [pastDifficulty, setPastDifficulty] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      setIsLoadingConfig(true)
      setConfigError('')
      try {
        const response = await fetch('/api/interview-config')
        const data = await response.json()
        if (!response.ok) { setConfigError(data.message ?? 'Failed to load interview options'); return }
        setConfigs((data.configs ?? []) as InterviewConfig[])
      } catch {
        setConfigError('Failed to load interview options')
      } finally {
        setIsLoadingConfig(false)
      }
    }
    void loadConfig()
  }, [])

  const selectedIndustry = useMemo(() => configs.find((c) => c.industryKey === industryKey) ?? null, [configs, industryKey])
  const roleCategoryOptions = selectedIndustry?.roleCategories ?? []
  const selectedRoleCategory = useMemo(() => roleCategoryOptions.find((c) => c.key === roleCategoryKey) ?? null, [roleCategoryOptions, roleCategoryKey])
  const technicalTopicOptions = selectedRoleCategory?.technicalTopics ?? []
  const behavioralTopicOptions = selectedRoleCategory?.behavioralTopics ?? []
  const durationOptions = selectedRoleCategory?.durations ?? []
  const isDurationEnabled = selectedRoleCategory?.durationEnabled ?? false

  const canShowRoleCategories = Boolean(selectedIndustry)

  const canCreateInterview =
    Boolean(selectedIndustry) && Boolean(selectedRoleCategory) &&
    topics.length > 0 && Boolean(interviewType) &&
    (isDurationEnabled ? Boolean(duration) : true)

  const stepStates = useMemo(() => {
    const roleDone = Boolean(selectedIndustry) && Boolean(selectedRoleCategory)
    const topicsDone = roleDone && topics.length > 0
    const typeDone = topicsDone && Boolean(interviewType)
    const generateReady =
      typeDone &&
      Boolean(totalQuestions) &&
      (isDurationEnabled ? Boolean(duration) : true)

    return {
      roleDone,
      topicsDone,
      typeDone,
      generateReady,
    }
  }, [
    duration,
    interviewType,
    isDurationEnabled,
    selectedIndustry,
    selectedRoleCategory,
    topics.length,
    totalQuestions,
  ])

  const firstIncompleteStepIndex = useMemo(() => {
    if (!stepStates.roleDone) return 0
    if (!stepStates.topicsDone) return 1
    if (!pastDifficulty) return 2
    if (!stepStates.typeDone) return 3
    if (!stepStates.generateReady) return 4
    return 5
  }, [pastDifficulty, stepStates])

  const wizardSteps = useMemo(() => ([
    { key: 'role' as const, label: 'Role', isComplete: stepStates.roleDone },
    { key: 'topics' as const, label: 'Topics', isComplete: stepStates.topicsDone },
    { key: 'difficulty' as const, label: 'Difficulty', isComplete: pastDifficulty },
    { key: 'interviewType' as const, label: 'Type', isComplete: stepStates.typeDone },
    { key: 'generate' as const, label: 'Generate', isComplete: stepStates.generateReady },
  ]), [pastDifficulty, stepStates])

  const summaryTopicsPreview = useMemo(() => {
    if (topics.length === 0) return '—'
    const head = topics.slice(0, 4).join(', ')
    const extra = topics.length > 4 ? ` +${topics.length - 4} more` : ''
    return head + extra
  }, [topics])

  const stepsCompleteCount = useMemo(
    () => wizardSteps.filter((s) => s.isComplete).length,
    [wizardSteps],
  )
  const progressPct = Math.round((stepsCompleteCount / wizardSteps.length) * 100)

  const canContinueFromStep = useMemo(() => {
    switch (wizardStep) {
      case 'role':
        return stepStates.roleDone
      case 'topics':
        return stepStates.topicsDone
      case 'difficulty':
        return stepStates.topicsDone
      case 'interviewType':
        return Boolean(interviewType)
      default:
        return false
    }
  }, [interviewType, stepStates.roleDone, stepStates.topicsDone, wizardStep])

  const draftPayload = useMemo(() => ({
    industryKey, roleCategoryKey, interviewType, topics, difficulty, totalQuestions,
    technicalQuestionRatio: technicalRatio,
    durationMinutes: isDurationEnabled ? Number(duration) || null : null,
  }), [industryKey, roleCategoryKey, interviewType, topics, difficulty, totalQuestions, technicalRatio, isDurationEnabled, duration])

  const saveDraft = async () => {
    setActionError(''); setActionMessage(''); setIsSavingDraft(true)
    try {
      window.localStorage.setItem('hirequest.newInterviewDraft', JSON.stringify(draftPayload))
      setActionMessage('Draft saved')
      toast.success('Draft saved locally')
    } catch {
      setActionError('Failed to save draft')
      toast.error('Could not save draft')
    }
    finally { setIsSavingDraft(false) }
  }

  const createInterview = async () => {
    if (!canCreateInterview) {
      if (!selectedIndustry || !selectedRoleCategory) {
        setActionError('Select an industry and role category.')
      } else if (topics.length === 0) {
        setActionError('Choose at least one topic.')
      } else if (!interviewType) {
        setActionError('Select an interview type.')
      } else if (isDurationEnabled && !duration) {
        setActionError('Select a session duration for this role.')
      } else if (!totalQuestions || totalQuestions < 1) {
        setActionError('Choose how many questions to generate.')
      } else {
        setActionError('Complete all required fields before creating the interview.')
      }
      return
    }
    setActionError(''); setActionMessage(''); setIsCreatingInterview(true)
    try {
      const response = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload),
      })
      const data = await response.json()
      if (!response.ok) {
        const msg = data.message ?? 'Failed to create interview'
        setActionError(msg)
        toast.error(msg)
        return
      }

      const sessionId = data.session?._id as string | undefined
      if (!sessionId) {
        setActionError('Interview created but missing session id')
        toast.error('Interview created but missing session id')
        router.push('/app/interviews')
        return
      }

      const genRes = await fetch(`/api/interviews/${sessionId}/generate-questions`, { method: 'POST' })
      const genData = await genRes.json()
      if (!genRes.ok) {
        const msg = genData.message ?? 'Interview saved, but question generation failed'
        setActionError(msg)
        toast.error(msg)
        router.push('/app/interviews')
        return
      }

      const warnings: string[] = Array.isArray(genData.warnings) ? genData.warnings : []
      const source = genData.source === 'gemini' ? 'Gemini' : 'templates'
      const qCount = genData.session?.questions?.length ?? draftPayload.totalQuestions
      if (warnings.length > 0) {
        setActionMessage(`Interview ready (${qCount} questions via ${source}). Note: ${warnings.join(' ')}`)
        toast.showToast(
          `Interview created — ${qCount} questions (${source}). ${warnings.join(' ')}`,
          'info',
        )
      } else {
        setActionMessage(`Interview ready — ${qCount} questions generated via ${source}.`)
        toast.success(`Interview ready — ${qCount} questions generated via ${source}.`)
      }
      router.push('/app/interviews')
    } catch {
      setActionError('Failed to create interview')
      toast.error('Failed to create interview')
    }
    finally { setIsCreatingInterview(false) }
  }

  const technicalTopicSet = useMemo(() => new Set(technicalTopicOptions), [technicalTopicOptions])
  const behavioralTopicSet = useMemo(() => new Set(behavioralTopicOptions), [behavioralTopicOptions])

  useEffect(() => {
    if (!interviewType || interviewType === 'both') return
    const allowedSet = interviewType === 'technical' ? technicalTopicSet : behavioralTopicSet
    setTopics((prev) => prev.filter((t) => allowedSet.has(t)))
  }, [behavioralTopicSet, interviewType, technicalTopicSet])

  const resetInterviewForm = useCallback(() => {
    setIndustryKey(''); setRoleCategoryKey(''); setInterviewType(null); setTopics([])
    setTechnicalRatio(70); setDuration(''); setDifficulty('Medium'); setTotalQuestions(20)
    setTopicSearch(''); setTopicMode('all'); setActionMessage(''); setActionError('')
    setWizardStep('role'); setWizardError(''); setPastDifficulty(false)
  }, [])

  const handleIndustryChange = useCallback((key: string) => {
    setIndustryKey(key); setRoleCategoryKey(''); setInterviewType(null); setTopics([])
    setTechnicalRatio(70); setDuration(''); setTopicSearch(''); setTopicMode('all'); setPastDifficulty(false)
  }, [])

  const handleRoleCategoryChange = useCallback((key: string) => {
    const cat = roleCategoryOptions.find((c) => c.key === key) ?? null
    setRoleCategoryKey(key); setInterviewType(null); setTopics([])
    setTechnicalRatio(cat?.technicalQuestionRatio ?? 70); setDuration('')
    setTopicSearch(''); setTopicMode('all'); setPastDifficulty(false)
  }, [roleCategoryOptions])

  const goBack = () => {
    setWizardError('')
    if (wizardStep === 'topics') { setPastDifficulty(false); setWizardStep('role') }
    else if (wizardStep === 'difficulty') setWizardStep('topics')
    else if (wizardStep === 'interviewType') setWizardStep('difficulty')
    else if (wizardStep === 'generate') setWizardStep('interviewType')
  }

  const goNext = () => {
    setWizardError('')
    if (wizardStep === 'role') {
      if (!stepStates.roleDone) { setWizardError('Select an industry and role category to continue.'); return }
      setWizardStep('topics'); return
    }
    if (wizardStep === 'topics') {
      if (!stepStates.topicsDone) { setWizardError('Choose at least one topic to continue.'); return }
      setWizardStep('difficulty'); return
    }
    if (wizardStep === 'difficulty') {
      if (!stepStates.topicsDone) { setWizardError('Complete topics first.'); return }
      setPastDifficulty(true)
      setWizardStep('interviewType'); return
    }
    if (wizardStep === 'interviewType') {
      if (!interviewType) { setWizardError('Select an interview type to continue.'); return }
      setWizardStep('generate'); return
    }
  }

  return (
    <div className="w-full">
      {configError ? <p className="mb-4 text-sm text-red-400">{configError}</p> : null}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 lg:col-span-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-foreground">Create New Interview</div>
              <button
                type="button"
                onClick={resetInterviewForm}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-border bg-input/20 px-4 text-sm font-medium text-foreground hover:bg-input/40 btn-micro"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
            {actionError ? <p className="text-sm text-red-400">{actionError}</p> : null}
            {actionMessage ? <p className="text-sm text-emerald-400">{actionMessage}</p> : null}
            {wizardError ? <p className="text-sm text-amber-300">{wizardError}</p> : null}

            <WizardStepper
              steps={wizardSteps}
              active={wizardStep}
              onSelect={(key) => {
                setWizardError('')
                const idx = WIZARD_STEP_ORDER.indexOf(key)
                if (idx === -1) return
                if (idx <= firstIncompleteStepIndex) setWizardStep(key)
              }}
            />

            <div className="rounded-2xl border border-border bg-input/10 p-4 sm:p-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wizardStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  {wizardStep === 'role' ? (
                    <>
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Choose an Industry</div>
                        <IconGrid columns={3} gap="md">
                          {isLoadingConfig ? (
                            <div className="rounded-2xl border border-border bg-input/20 p-4 text-sm text-muted-foreground animate-pulse">Loading industries...</div>
                          ) : configs.map((config) => (
                            <IconCard
                              key={config.industryKey}
                              icon={getIndustryIcon(config.industryKey)}
                              title={config.industryLabel}
                              subtitle={`${config.roleCategories?.length ?? 0} role categories`}
                              selected={industryKey === config.industryKey}
                              onClick={() => handleIndustryChange(config.industryKey)}
                              size="md"
                            />
                          ))}
                        </IconGrid>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Choose a Role Category</div>
                        {canShowRoleCategories ? (
                          <IconGrid columns={3} gap="md">
                            {roleCategoryOptions.map((cat) => (
                              <IconCard
                                key={cat.key}
                                icon={getRoleIcon(cat.key)}
                                title={cat.label}
                                subtitle={`${cat.technicalTopics?.length ?? 0} technical · ${cat.behavioralTopics?.length ?? 0} behavioral`}
                                selected={roleCategoryKey === cat.key}
                                onClick={() => handleRoleCategoryChange(cat.key)}
                                size="md"
                              />
                            ))}
                          </IconGrid>
                        ) : (
                          <div className="rounded-2xl border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                            Select an industry to see role categories.
                          </div>
                        )}
                      </div>
                    </>
                  ) : null}

                  {wizardStep === 'topics' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Topics</div>
                      {selectedRoleCategory ? (
                        <TopicSelector
                          technicalTopics={technicalTopicOptions}
                          behavioralTopics={behavioralTopicOptions}
                          selectedTopics={topics}
                          onChange={setTopics}
                          search={topicSearch}
                          onSearchChange={setTopicSearch}
                          mode={topicMode}
                          onModeChange={setTopicMode}
                          allowedKind="both"
                        />
                      ) : (
                        <div className="rounded-2xl border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                          Choose a role category first.
                        </div>
                      )}
                    </div>
                  ) : null}

                  {wizardStep === 'difficulty' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Difficulty</div>
                      {stepStates.topicsDone ? (
                        <DifficultySelector value={difficulty} onChange={setDifficulty} />
                      ) : (
                        <div className="rounded-2xl border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                          Complete topics first.
                        </div>
                      )}
                    </div>
                  ) : null}

                  {wizardStep === 'interviewType' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Interview type</div>
                      {selectedRoleCategory ? (
                        <InterviewTypeSelector value={interviewType} onChange={setInterviewType} />
                      ) : (
                        <div className="rounded-2xl border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                          Choose a role category first.
                        </div>
                      )}
                    </div>
                  ) : null}

                  {wizardStep === 'generate' ? (
                    <>
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Question count</div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <SelectCard title="10" subtitle="Quick (~5 min)" selected={totalQuestions === 10} onClick={() => setTotalQuestions(10)} />
                          <SelectCard title="20" subtitle="Standard (~10 min)" selected={totalQuestions === 20} onClick={() => setTotalQuestions(20)} />
                          <SelectCard title="30" subtitle="Thorough (~15 min)" selected={totalQuestions === 30} onClick={() => setTotalQuestions(30)} />
                        </div>
                        <div className="rounded-2xl border border-border bg-input/20 p-4">
                          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Technical: <strong className="text-foreground">{technicalRatio}%</strong></span>
                            <span>Behavioral: <strong className="text-foreground">{100 - technicalRatio}%</strong></span>
                          </div>
                          <input type="range" min={0} max={100} value={technicalRatio} onChange={(e) => setTechnicalRatio(Number(e.target.value))} className="w-full accent-primary" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Duration</div>
                        {isDurationEnabled ? (
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {durationOptions.map((opt) => (
                              <SelectCard key={opt} title={`${opt} min`} selected={duration === opt.toString()} onClick={() => setDuration(opt.toString())} />
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 rounded-2xl border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" /> No time limit for this role category
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-border bg-input/20 p-4 sm:p-5">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Review</div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="text-sm text-muted-foreground">Industry</div>
                          <div className="text-sm font-semibold text-foreground">{selectedIndustry?.industryLabel ?? '—'}</div>
                          <div className="text-sm text-muted-foreground">Role category</div>
                          <div className="text-sm font-semibold text-foreground">{selectedRoleCategory?.label ?? '—'}</div>
                          <div className="text-sm text-muted-foreground">Type</div>
                          <div className="text-sm font-semibold text-foreground">
                            {interviewType ? formatInterviewTypeLabel(interviewType) : '—'}
                          </div>
                          <div className="text-sm text-muted-foreground">Topics</div>
                          <div className="text-sm font-semibold text-foreground">{topics.length > 0 ? topics.join(', ') : '—'}</div>
                          <div className="text-sm text-muted-foreground">Difficulty</div>
                          <div className="text-sm font-semibold text-foreground">{formatDifficultyLabel(difficulty)}</div>
                          <div className="text-sm text-muted-foreground">Questions</div>
                          <div className="text-sm font-semibold text-foreground">{totalQuestions} (Tech {technicalRatio}% / Beh {100 - technicalRatio}%)</div>
                          <div className="text-sm text-muted-foreground">Duration</div>
                          <div className="text-sm font-semibold text-foreground">{isDurationEnabled ? (duration ? `${duration} min` : '—') : 'No limit'}</div>
                        </div>
                      </div>

                      <StartInterviewButton
                        canStart={canCreateInterview}
                        isCreating={isCreatingInterview}
                        isSaving={isSavingDraft}
                        onSaveDraft={saveDraft}
                        onStart={createInterview}
                        interviewType={interviewType}
                        topics={topics}
                      />
                    </>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                disabled={wizardStep === 'role'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-input/20 px-4 text-sm font-semibold text-foreground hover:bg-input/40 btn-micro disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {wizardStep !== 'generate' ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinueFromStep || isCreatingInterview}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-white btn-micro shadow-glow-sm disabled:pointer-events-none disabled:opacity-45"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="text-xs text-muted-foreground">
                  {isCreatingInterview ? 'Generating questions…' : 'Review details below, then generate your interview.'}
                </div>
              )}
            </div>
        </div>

        <aside className="col-span-12 lg:col-span-4">
          <div className="space-y-4 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-border bg-input/10 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5 text-[var(--hq-display-blue)]" aria-hidden />
                Interview summary
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Industry</dt>
                  <dd className="font-medium text-foreground">{selectedIndustry?.industryLabel ?? '—'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Role</dt>
                  <dd className="font-medium text-foreground">{selectedRoleCategory?.label ?? '—'}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Topics</dt>
                  <dd className="break-words font-medium text-foreground">{summaryTopicsPreview}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Difficulty</dt>
                  <dd className="font-medium text-foreground">{formatDifficultyLabel(difficulty)}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Type</dt>
                  <dd className="font-medium text-foreground">
                    {interviewType ? formatInterviewTypeLabel(interviewType) : '—'}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-border bg-input/10 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <ListChecks className="h-3.5 w-3.5 text-[var(--hq-display-blue)]" aria-hidden />
                Progress
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 h-2 overflow-hidden rounded-full bg-input/40">
                    <div
                      className="h-full rounded-full bg-gradient-primary transition-[width] duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stepsCompleteCount} of {wizardSteps.length} steps complete
                  </p>
                </div>
                <div className="shrink-0">
                  <ProgressRing size={76} progress={progressPct / 100} />
                </div>
              </div>
              <ol className="mt-3 space-y-2 text-xs">
                {wizardSteps.map((s) => (
                  <li key={s.key} className="flex items-center gap-2">
                    {s.isComplete ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden />
                    ) : (
                      <span className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border border-border text-[9px] text-muted-foreground">
                        ·
                      </span>
                    )}
                    <span className={s.key === wizardStep ? 'font-semibold text-foreground' : 'text-muted-foreground'}>
                      {s.label}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <AIAssistantCard />

            <div className="rounded-2xl border border-border bg-input/10 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-[var(--hq-display-blue)]" aria-hidden />
                Preview
              </div>
              <ul className="space-y-2 text-sm text-foreground">
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Questions</span>
                  <span className="font-medium">{totalQuestions}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="text-right font-medium">
                    {interviewType ? formatInterviewTypeLabel(interviewType) : '—'}
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Topic mix</span>
                  <span className="text-right font-medium">
                    {topics.length > 0 ? `${technicalRatio}% tech` : '—'}
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-right font-medium">
                    {isDurationEnabled ? (duration ? `${duration} min` : '—') : 'No limit'}
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-border bg-input/5 p-4 sm:p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500/90" aria-hidden />
                Tips
              </div>
              <ul className="list-disc space-y-2 pl-4 text-xs leading-relaxed text-muted-foreground">
                <li>Choose topics that match the role you are interviewing for.</li>
                <li>Adjust technical vs behavioral mix to mirror the job description.</li>
                <li>You can save a draft locally before generating questions.</li>
                <li>More questions give deeper practice; shorter sets are great for warm-ups.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
