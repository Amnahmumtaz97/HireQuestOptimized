'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { DifficultySelector, type Difficulty } from '@/components/app/DifficultySelector'
import { InterviewTypeSelector, type InterviewType } from '@/components/app/InterviewTypeSelector'
import { StartInterviewButton } from '@/components/app/StartInterviewButton'
import { TopicSelector, type TopicMode } from '@/components/app/TopicSelector'
import { IndustrySelector } from '@/components/app/IndustrySelector'
import { RoleCategorySelector } from '@/components/app/RoleCategorySelector'
import {
  MessageSquare, BarChart2, User,
  Plus, RotateCcw, Activity, CheckCircle2,
  Clock, Sparkles, CreditCard,
  Briefcase, Tag, AlarmClock, ArrowLeft, ArrowRight,
  Trash2, Lightbulb, ListChecks, Check, ChevronDown, Leaf, Mountain,
} from 'lucide-react'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { AIAssistantCard } from '@/components/dashboard/AIAssistantCard'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { defaultMonthToDateRange } from '@/utils/dashboard/date'
import { rowRevealDelay, useResponsiveColumns } from '@/hooks/use-reveal'
import {
  formatDifficultyLabel,
  formatInterviewTypeLabel,
  formatDepartmentsDisplay,
  formatSpecializationsDisplay,
  formatTopicsDisplay,
  formatIndustryDisplay,
  formatRoleCategoryDisplay,
} from '@/utils/dashboard/interview-labels'
import {
  anyRoleHasDuration,
  averageTechnicalRatio,
  buildScopedRoleOptions,
  filterDepartmentsBySearch,
  filterScopedSpecializationsBySearch,
  mergeTopicsFromRoles,
  resolveIndustryKeys,
  resolveRoleRefs,
  resolveRolesFromRefs,
  unionDurationOptions,
} from '@/lib/interview-scope'
import { resolveAvailableInterviewTypes } from '@/lib/interview-catalog/hr-topics'
import { InterviewDeleteModal } from '@/components/app/InterviewDeleteModal'
import { DashboardDateCalendarButton } from '@/components/app/dashboard/DashboardDateCalendarButton'
import { useToast } from '@/components/ui/toast'
import { IconCard, IconGrid } from '@/components/ui/icon-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { DepartmentConfig, InterviewConfig, InterviewSession } from '@/components/app/dashboard/types'

// Types moved to `src/components/app/dashboard/types.ts`.

export type WizardStepKey =
  | 'interviewType'
  | 'department'
  | 'specialization'
  | 'topics'
  | 'difficulty'
  | 'generate'

const WIZARD_STEP_ORDER: WizardStepKey[] = [
  'interviewType',
  'department',
  'specialization',
  'topics',
  'difficulty',
  'generate',
]

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
    <div className="hq-wiz-stepper w-full rounded-2xl border border-border px-3 py-4 sm:px-5 sm:py-5">
      <div className="grid grid-cols-3 gap-x-2 gap-y-4 sm:grid-cols-6 sm:gap-x-3">
        {steps.map((s, idx) => {
          const isActive = s.key === active
          const isComplete = s.isComplete
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect(s.key)}
              className={[
                'group relative flex min-w-0 flex-col items-center gap-2 text-center transition-colors',
                'sm:before:absolute sm:before:left-[calc(50%+18px)] sm:before:top-[18px] sm:before:h-px sm:before:w-[calc(100%-36px)] sm:before:bg-border/70',
                idx === steps.length - 1 ? 'sm:before:hidden' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all sm:h-8 sm:w-8',
                  isActive
                    ? 'hq-wiz-step-num--active'
                    : isComplete
                      ? 'hq-wiz-step-num--done'
                      : 'hq-wiz-step-num--todo',
                ].join(' ')}
                aria-hidden
              >
                {isComplete ? <CheckCircle2 className="h-3.5 w-3.5" /> : idx + 1}
              </span>
              <span
                className={[
                  'block max-w-full text-[10px] font-semibold uppercase tracking-[0.14em] sm:text-[11px]',
                  isActive
                    ? 'hq-wiz-step-label--active'
                    : isComplete
                      ? 'hq-wiz-step-label--done'
                      : 'hq-wiz-step-label--todo',
                ].join(' ')}
              >
                {s.label}
              </span>
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
          ? 'border-primary bg-primary/5 shadow-[var(--shadow-card)]'
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
  const [interviewConfigs, setInterviewConfigs] = useState<InterviewConfig[]>([])
  const [listPage, setListPage] = useState(1)

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

  useEffect(() => {
    setListPage(1)
  }, [startDate, endDate])

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

  const listPageSize = 6
  const listTotalPages = Math.max(1, Math.ceil(displayedSessions.length / listPageSize))
  const safeListPage = Math.min(Math.max(listPage, 1), listTotalPages)
  const pagedSessions = useMemo(() => {
    const start = (safeListPage - 1) * listPageSize
    return displayedSessions.slice(start, start + listPageSize)
  }, [displayedSessions, safeListPage])
  const listPageNumbers = useMemo(() => {
    const out: number[] = []
    const radius = 2
    const start = Math.max(1, safeListPage - radius)
    const end = Math.min(listTotalPages, safeListPage + radius)
    for (let p = start; p <= end; p++) out.push(p)
    return out
  }, [safeListPage, listTotalPages])

  const totalInterviews = displayedSessions.length
  const completed = displayedSessions.filter((s) => s.status === 'completed').length
  const inProgress = displayedSessions.filter((s) => s.status === 'in_progress').length
  const completionRate = totalInterviews > 0 ? ((completed / totalInterviews) * 100).toFixed(2) : '0.00'
  const completionPct = totalInterviews > 0 ? Math.min(100, (completed / totalInterviews) * 100) : 0

  const difficultyTagClass = (d: string) => {
    if (d === 'Easy') return 'hq-tag hq-tag--easy'
    if (d === 'Medium') return 'hq-tag hq-tag--medium'
    if (d === 'Adaptive') return 'hq-tag hq-tag--accent'
    return 'hq-tag hq-tag--hard'
  }

  const interviewTypeTagClass = (t: string) => {
    if (t === 'behavioral') return 'hq-tag hq-tag--accent'
    if (t === 'hr') return 'hq-tag hq-tag--accent'
    return 'hq-tag hq-tag--accent'
  }

  const statusTagClass = (status: InterviewSession['status']) => {
    if (status === 'completed') return 'hq-tag hq-tag--easy'
    if (status === 'in_progress') return 'hq-tag hq-tag--medium'
    return 'hq-tag hq-tag--accent'
  }

  return (
    <div className="animate-fade-up space-y-6 sm:space-y-7">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="hq-stat-card hq-stat-card--blue">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="hq-stat-label">Total interviews</div>
              <div className="hq-stat-value hq-stat-value--blue">
                {isLoading ? '—' : totalInterviews}
              </div>
              <div className="hq-stat-sub">In selected range</div>
            </div>
            <span className="hq-stat-icon-wrap hq-stat-icon-wrap--blue">
              <User className="h-5 w-5 text-primary-glow" aria-hidden />
            </span>
          </div>
        </Card>

        <Card className="hq-stat-card hq-stat-card--green">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="hq-stat-label">Completion rate</div>
              <div className="hq-stat-value hq-stat-value--green">
                {isLoading ? '—' : `${completionRate}%`}
              </div>
              {!isLoading && totalInterviews > 0 ? (
                <div className="hq-stat-progress">
                  <div
                    className="hq-stat-progress-bar"
                    style={{ width: `${completionPct}%` }}
                    aria-hidden
                  />
                </div>
              ) : (
                <div className="hq-stat-sub">No sessions yet</div>
              )}
            </div>
            <span className="hq-stat-icon-wrap hq-stat-icon-wrap--green">
              <Activity className="h-5 w-5 text-amber-400" aria-hidden />
            </span>
          </div>
        </Card>

        <Card className="hq-stat-card hq-stat-card--amber">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="hq-stat-label">In progress</div>
              <div className="hq-stat-value hq-stat-value--amber">
                {isLoading ? '—' : inProgress}
              </div>
              <div className="hq-stat-sub">Live now</div>
            </div>
            <span className="hq-stat-icon-wrap hq-stat-icon-wrap--amber">
              <Clock className="h-5 w-5 text-emerald-400" aria-hidden />
            </span>
          </div>
        </Card>

        <Card className="hq-stat-card hq-stat-card--blue">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="hq-stat-label">Subscription</div>
              <div className="hq-stat-value hq-stat-value--blue hq-stat-value--text">Active</div>
              <div className="hq-stat-sub">$9.99 / month</div>
            </div>
            <span className="hq-stat-icon-wrap hq-stat-icon-wrap--blue">
              <CreditCard className="h-5 w-5 text-primary" aria-hidden />
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
          <div className="flex h-32 items-center justify-center">
            <BounceLoader label="Loading" />
          </div>
        ) : displayedSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-12">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--hq-row-elevated)]">
              <BarChart2 className="h-7 w-7 text-muted-foreground" />
            </span>
            <p className="text-sm text-muted-foreground">No interviews in this date range.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              {pagedSessions.map((s) => (
                <div key={s._id} className="hq-interview-row flex-wrap items-start sm:flex-nowrap sm:items-center">
                  <div className="hq-int-icon">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="hq-int-name">
                      {formatRoleCategoryDisplay(s.industryKey, s.roleCategoryKey, interviewConfigs)}
                    </div>
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
                  <div className="flex w-full flex-shrink-0 items-center justify-end gap-2 sm:w-auto sm:justify-start">
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

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
              <div className="text-xs text-muted-foreground">
                Page <strong className="text-foreground">{safeListPage}</strong> of{' '}
                <strong className="text-foreground">{listTotalPages}</strong>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setListPage((p) => Math.max(1, p - 1))}
                  disabled={safeListPage <= 1}
                  className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold disabled:pointer-events-none disabled:opacity-45"
                >
                  Prev
                </button>

                {listPageNumbers[0] && listPageNumbers[0] > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setListPage(1)}
                      className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold"
                    >
                      1
                    </button>
                    {listPageNumbers[0] > 2 ? <span className="px-1 text-xs text-muted-foreground">…</span> : null}
                  </>
                ) : null}

                {listPageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setListPage(p)}
                    className={[
                      'hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold',
                      p === safeListPage ? 'hq-panel-btn--active' : '',
                    ].join(' ')}
                  >
                    {p}
                  </button>
                ))}

                {listPageNumbers[listPageNumbers.length - 1] &&
                listPageNumbers[listPageNumbers.length - 1] < listTotalPages ? (
                  <>
                    {listPageNumbers[listPageNumbers.length - 1] < listTotalPages - 1 ? (
                      <span className="px-1 text-xs text-muted-foreground">…</span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setListPage(listTotalPages)}
                      className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold"
                    >
                      {listTotalPages}
                    </button>
                  </>
                ) : null}

                <button
                  type="button"
                  onClick={() => setListPage((p) => Math.min(listTotalPages, p + 1))}
                  disabled={safeListPage >= listTotalPages}
                  className="hq-panel-btn min-h-9 px-3 py-2 text-xs font-semibold disabled:pointer-events-none disabled:opacity-45"
                >
                  Next
                </button>
              </div>
            </div>
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
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Easy' | 'Medium' | 'Hard' | 'Adaptive'>('all')
  const [difficultyOpen, setDifficultyOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const difficultyMenuRef = useRef<HTMLDivElement | null>(null)
  const [interviewConfigs, setInterviewConfigs] = useState<InterviewConfig[]>([])

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

  useEffect(() => {
    setPage(1)
  }, [filter, query, difficultyFilter, startDate, endDate])

  useEffect(() => {
    if (!difficultyOpen) return
    const onDocClick = (e: MouseEvent) => {
      if (difficultyMenuRef.current && !difficultyMenuRef.current.contains(e.target as Node)) {
        setDifficultyOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [difficultyOpen])

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
          const role = formatRoleCategoryDisplay(s.industryKey, s.roleCategoryKey, interviewConfigs).toLowerCase()
          const industry = formatIndustryDisplay(s.industryKey, interviewConfigs).toLowerCase()
          return `${role} ${industry}`.includes(q)
        })
    },
    [sessions, filter, query, difficultyFilter, startDate, endDate, interviewConfigs],
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
    Easy: 'text-emerald-400',
    Medium: 'text-amber-400',
    Hard: 'text-red-400',
    Adaptive: 'text-primary',
  }
  const difficultyOptions: Array<{ key: 'all' | 'Easy' | 'Medium' | 'Hard' | 'Adaptive'; label: string; icon: React.ReactNode; iconClass: string }> = [
    { key: 'all', label: 'All', icon: <BarChart2 className="h-3.5 w-3.5" />, iconClass: 'text-[var(--hq-display-blue)]' },
    { key: 'Easy', label: 'Easy', icon: <Leaf className="h-3.5 w-3.5" />, iconClass: 'text-emerald-400' },
    { key: 'Medium', label: 'Medium', icon: <Activity className="h-3.5 w-3.5" />, iconClass: 'text-amber-400' },
    { key: 'Hard', label: 'Hard', icon: <Mountain className="h-3.5 w-3.5" />, iconClass: 'text-rose-400' },
    { key: 'Adaptive', label: 'Adaptive AI', icon: <Sparkles className="h-3.5 w-3.5" />, iconClass: 'text-primary' },
  ]
  const selectedDifficulty = difficultyOptions.find((o) => o.key === difficultyFilter) ?? difficultyOptions[0]

  const interviewCardActionClass =
    'btn-micro inline-flex min-h-9 min-w-[10.75rem] shrink-0 items-center justify-center rounded-xl px-3 py-2 text-xs font-semibold sm:min-h-10 sm:min-w-[11.5rem] sm:text-sm'

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

  const cardCols = useResponsiveColumns({ base: 1, sm: 2, xl: 3 })

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="hq-interviews-toolbar flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-input/10 p-2.5 sm:p-3">
        <div className="hq-segmented-tabs flex flex-wrap items-center gap-1.5">
          {(['all', 'created', 'in_progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={[
                'hq-panel-btn hq-segment-tab btn-micro',
                filter === f ? 'hq-segment-tab--active hq-panel-btn--active' : '',
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

      <div className="hq-filter-command grid grid-cols-1 gap-4 rounded-3xl border border-border bg-input/10 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">Search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Role, industry…"
            className="hq-filter-field"
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">Difficulty</span>
          <div ref={difficultyMenuRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={difficultyOpen}
              onClick={() => setDifficultyOpen((o) => !o)}
              className="hq-filter-field hq-difficulty-trigger inline-flex w-full items-center justify-between gap-2 border-[color-mix(in_oklab,var(--primary)_45%,var(--hq-border))]"
            >
              <span className="inline-flex min-w-0 items-center gap-2.5">
                <span
                  className={[
                    'inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-input/40',
                    selectedDifficulty.iconClass,
                  ].join(' ')}
                >
                  {selectedDifficulty.icon}
                </span>
                <span className="truncate text-sm text-foreground">{selectedDifficulty.label}</span>
              </span>
              <ChevronDown
                className={['h-4 w-4 shrink-0 text-muted-foreground transition-transform', difficultyOpen ? 'rotate-180' : ''].join(' ')}
              />
            </button>

            {difficultyOpen ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="hq-difficulty-menu absolute left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-border/80 backdrop-blur-md"
              >
                <div role="listbox" aria-label="Difficulty" className="p-1">
                  {difficultyOptions.map((opt) => {
                    const isSelected = difficultyFilter === opt.key
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => {
                          setDifficultyFilter(opt.key)
                          setDifficultyOpen(false)
                        }}
                        className={[
                          'hq-difficulty-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                          isSelected ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-muted/80',
                        ].join(' ')}
                      >
                        <span className="inline-flex items-center gap-2.5">
                          <span
                            className={[
                              'inline-flex h-6 w-6 items-center justify-center rounded-md border border-border/60 bg-input/40',
                              opt.iconClass,
                            ].join(' ')}
                          >
                            {opt.icon}
                          </span>
                          <span>{opt.label}</span>
                        </span>
                        {isSelected ? <Check className="h-4 w-4 text-primary" /> : null}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            ) : null}
          </div>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">From</span>
          <DashboardDateCalendarButton
            id="interviews-start-date"
            label="From"
            value={startDate}
            fullWidth
            maxDate={endDate || undefined}
            onChange={(iso) => {
              setStartDate(iso)
              if (endDate && iso > endDate) setEndDate(iso)
            }}
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">To</span>
          <DashboardDateCalendarButton
            id="interviews-end-date"
            label="To"
            value={endDate}
            fullWidth
            minDate={startDate || undefined}
            onChange={(iso) => {
              setEndDate(iso)
              if (startDate && iso < startDate) setStartDate(iso)
            }}
          />
        </label>
      </div>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <BounceLoader label="Loading interviews" />
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
            {pageItems.map((s, index) => (
              <div
                key={s._id}
                className="dashboard-card card-drop-in p-5 flex flex-col justify-between gap-4 group min-h-[150px]"
                style={{ animationDelay: `${rowRevealDelay(index, cardCols)}ms` }}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-input/40 stat-icon-blue">
                    <Briefcase className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="hq-int-name font-semibold truncate capitalize">
                      {formatRoleCategoryDisplay(s.industryKey, s.roleCategoryKey, interviewConfigs)}
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
                    <button
                      type="button"
                      onClick={() => router.push(`/app/interviews/${s._id}`)}
                      className={['hq-btn-primary', interviewCardActionClass].join(' ')}
                    >
                      Start Interview
                    </button>
                  ) : null}
                  {s.status === 'in_progress' ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/app/interviews/${s._id}`)}
                      className={['hq-btn-outline-accent', interviewCardActionClass].join(' ')}
                    >
                      Resume
                    </button>
                  ) : null}
                  {s.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/app/interviews/${s._id}/results`)}
                      className={['hq-panel-btn', interviewCardActionClass].join(' ')}
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
  const [departments, setDepartments] = useState<DepartmentConfig[]>([])
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const [configError, setConfigError] = useState('')

  const configShim = useMemo<InterviewConfig[]>(
    () =>
      departments.map((department) => ({
        _id: department.key,
        industryKey: department.key,
        industryLabel: department.label,
        roleCategories: (department.specializations ?? []).map((specialization) => ({
          key: specialization.key,
          label: specialization.label,
          interviewTypes: specialization.interviewTypes ?? ['Technical', 'Behavioral'],
          technicalTopics: specialization.technicalTopics,
          behavioralTopics: specialization.behavioralTopics,
          hrTopics: specialization.hrTopics ?? [],
          technicalQuestionRatio: specialization.technicalQuestionRatio,
          durationEnabled: specialization.durationEnabled,
          durations: specialization.durations,
        })),
      })),
    [departments],
  )

  const [departmentKeys, setDepartmentKeys] = useState<string[]>([])
  const [selectAllDepartments, setSelectAllDepartments] = useState(false)
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [specializationRefs, setSpecializationRefs] = useState<string[]>([])
  const [selectAllSpecializations, setSelectAllSpecializations] = useState(false)
  const [specializationSearch, setSpecializationSearch] = useState('')
  const [selectAllTopics, setSelectAllTopics] = useState(false)
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
  const [wizardStep, setWizardStep] = useState<WizardStepKey>('interviewType')
  const [wizardError, setWizardError] = useState('')
  const [pastDifficulty, setPastDifficulty] = useState(false)

  useEffect(() => {
    async function loadConfig() {
      setIsLoadingConfig(true)
      setConfigError('')
      try {
        const response = await fetch('/api/interview-config')
        const data = await response.json()
        if (!response.ok) {
          setConfigError(data.message ?? 'Failed to load interview options')
          return
        }
        setDepartments((data.departments ?? []) as DepartmentConfig[])
      } catch {
        setConfigError('Failed to load interview options')
      } finally {
        setIsLoadingConfig(false)
      }
    }
    void loadConfig()
  }, [])

  const filteredDepartments = useMemo(
    () => filterDepartmentsBySearch(departments, departmentSearch),
    [departmentSearch, departments],
  )

  const availableInterviewTypes = useMemo(() => {
    if (isLoadingConfig) return ['technical', 'behavioral', 'both'] as InterviewType[]
    return resolveAvailableInterviewTypes(
      departments.flatMap((department) =>
        (department.specializations ?? []).map((specialization) => specialization.interviewTypes),
      ),
    ).filter((type): type is InterviewType => type === 'technical' || type === 'behavioral' || type === 'both')
  }, [departments, isLoadingConfig])

  const resolvedDepartmentKeys = useMemo(
    () =>
      resolveIndustryKeys(departments, {
        selectAllDepartments: selectAllDepartments,
        departmentKeys,
      }),
    [departmentKeys, departments, selectAllDepartments],
  )

  const scopedSpecializationOptions = useMemo(
    () => buildScopedRoleOptions(departments, resolvedDepartmentKeys),
    [departments, resolvedDepartmentKeys],
  )

  const filteredSpecializationOptions = useMemo(
    () => filterScopedSpecializationsBySearch(scopedSpecializationOptions, specializationSearch),
    [scopedSpecializationOptions, specializationSearch],
  )

  const resolvedSpecializationRefs = useMemo(
    () =>
      resolveRoleRefs(scopedSpecializationOptions, {
        selectAllSpecializations: selectAllSpecializations,
        specializationRefs,
      }),
    [scopedSpecializationOptions, selectAllSpecializations, specializationRefs],
  )

  const selectedSpecializations = useMemo(
    () => resolveRolesFromRefs(scopedSpecializationOptions, resolvedSpecializationRefs),
    [resolvedSpecializationRefs, scopedSpecializationOptions],
  )

  const topicScope = useMemo(() => {
    if (!interviewType || selectedSpecializations.length === 0) {
      return {
        technicalTopics: [] as string[],
        behavioralTopics: [] as string[],
        hrTopics: [] as string[],
        topics: [] as string[],
      }
    }
    return mergeTopicsFromRoles(selectedSpecializations, interviewType)
  }, [interviewType, selectedSpecializations])

  const technicalTopicOptions = topicScope.technicalTopics
  const behavioralTopicOptions = topicScope.behavioralTopics
  const hrTopicOptions = topicScope.hrTopics
  const availableTopicOptions = topicScope.topics
  const durationOptions = useMemo(() => unionDurationOptions(selectedSpecializations), [selectedSpecializations])
  const isDurationEnabled = useMemo(() => anyRoleHasDuration(selectedSpecializations), [selectedSpecializations])

  const topicAllowedKind = useMemo((): 'technical' | 'behavioral' | 'both' | 'hr' => {
    if (interviewType === 'technical') return 'technical'
    if (interviewType === 'behavioral') return 'behavioral'
    if (interviewType === 'hr') return 'hr'
    return 'both'
  }, [interviewType])

  const hasDepartmentSelection = selectAllDepartments || departmentKeys.length > 0
  const hasSpecializationSelection = selectAllSpecializations || specializationRefs.length > 0
  const hasTopicSelection = selectAllTopics || topics.length > 0

  const canCreateInterview =
    hasDepartmentSelection &&
    hasSpecializationSelection &&
    hasTopicSelection &&
    Boolean(interviewType) &&
    (isDurationEnabled ? Boolean(duration) : true)

  const stepStates = useMemo(() => {
    const typeDone = Boolean(interviewType)
    const departmentDone = typeDone && hasDepartmentSelection
    const specializationDone = departmentDone && hasSpecializationSelection
    const topicsDone = specializationDone && hasTopicSelection
    const generateReady =
      topicsDone &&
      pastDifficulty &&
      Boolean(totalQuestions) &&
      (isDurationEnabled ? Boolean(duration) : true)

    return {
      typeDone,
      departmentDone,
      specializationDone,
      topicsDone,
      generateReady,
    }
  }, [
    duration,
    hasDepartmentSelection,
    hasSpecializationSelection,
    hasTopicSelection,
    interviewType,
    isDurationEnabled,
    pastDifficulty,
    totalQuestions,
  ])

  const firstIncompleteStepIndex = useMemo(() => {
    if (!stepStates.typeDone) return 0
    if (!stepStates.departmentDone) return 1
    if (!stepStates.specializationDone) return 2
    if (!stepStates.topicsDone) return 3
    if (!pastDifficulty) return 4
    if (!stepStates.generateReady) return 5
    return 6
  }, [pastDifficulty, stepStates])

  const wizardSteps = useMemo(
    () => [
      { key: 'interviewType' as const, label: 'Type', isComplete: stepStates.typeDone },
      { key: 'department' as const, label: 'Department', isComplete: stepStates.departmentDone },
      { key: 'specialization' as const, label: 'Specialization', isComplete: stepStates.specializationDone },
      { key: 'topics' as const, label: 'Topics', isComplete: stepStates.topicsDone },
      { key: 'difficulty' as const, label: 'Difficulty', isComplete: pastDifficulty },
      { key: 'generate' as const, label: 'Generate', isComplete: stepStates.generateReady },
    ],
    [pastDifficulty, stepStates],
  )

  const summaryTopicsPreview = useMemo(
    () =>
      formatTopicsDisplay(topics, {
        selectAll: selectAllTopics,
        totalAvailable: availableTopicOptions.length,
      }),
    [availableTopicOptions.length, selectAllTopics, topics],
  )

  const summaryDepartmentsPreview = useMemo(
    () =>
      formatDepartmentsDisplay(resolvedDepartmentKeys, configShim, {
        selectAll: selectAllDepartments,
        totalAvailable: departments.length,
      }),
    [configShim, departments.length, resolvedDepartmentKeys, selectAllDepartments],
  )

  const summarySpecializationsPreview = useMemo(
    () =>
      formatSpecializationsDisplay(resolvedDepartmentKeys[0] ?? '', [], configShim, {
        selectAll: selectAllSpecializations,
        totalAvailable: scopedSpecializationOptions.length,
        specializationRefs: resolvedSpecializationRefs,
      }),
    [
      configShim,
      resolvedDepartmentKeys,
      resolvedSpecializationRefs,
      scopedSpecializationOptions.length,
      selectAllSpecializations,
    ],
  )

  const stepsCompleteCount = useMemo(
    () => wizardSteps.filter((s) => s.isComplete).length,
    [wizardSteps],
  )
  const progressPct = Math.round((stepsCompleteCount / wizardSteps.length) * 100)

  const canContinueFromStep = useMemo(() => {
    switch (wizardStep) {
      case 'interviewType':
        return stepStates.typeDone
      case 'department':
        return stepStates.departmentDone
      case 'specialization':
        return stepStates.specializationDone
      case 'topics':
        return stepStates.topicsDone
      case 'difficulty':
        return stepStates.topicsDone
      default:
        return false
    }
  }, [
    stepStates.departmentDone,
    stepStates.specializationDone,
    stepStates.topicsDone,
    stepStates.typeDone,
    wizardStep,
  ])

  const technicalQuestionRatioForApi = useMemo(() => {
    if (interviewType === 'both') return technicalRatio
    if (interviewType === 'technical') return 100
    if (interviewType === 'behavioral' || interviewType === 'hr') return 0
    return technicalRatio
  }, [interviewType, technicalRatio])

  const draftPayload = useMemo(
    () => ({
      departmentKey: resolvedDepartmentKeys[0] ?? '',
      departmentKeys: resolvedDepartmentKeys,
      selectAllDepartments,
      specializationKey: selectedSpecializations[0]?.key ?? '',
      specializationRefs: resolvedSpecializationRefs,
      specializationKeys: selectedSpecializations.map((spec) => spec.key),
      selectAllSpecializations,
      industryKey: resolvedDepartmentKeys[0] ?? '',
      industryKeys: resolvedDepartmentKeys,
      selectAllIndustries: selectAllDepartments,
      roleCategoryKey: selectedSpecializations[0]?.key ?? '',
      roleRefs: resolvedSpecializationRefs,
      roleCategoryKeys: selectedSpecializations.map((spec) => spec.key),
      selectAllRoleCategories: selectAllSpecializations,
      selectAllTopics,
      interviewType,
      topics: selectAllTopics ? [] : topics,
      difficulty,
      totalQuestions,
      technicalQuestionRatio: technicalQuestionRatioForApi,
      durationMinutes: isDurationEnabled ? Number(duration) || null : null,
    }),
    [
      difficulty,
      duration,
      interviewType,
      isDurationEnabled,
      resolvedDepartmentKeys,
      resolvedSpecializationRefs,
      selectAllDepartments,
      selectAllSpecializations,
      selectAllTopics,
      selectedSpecializations,
      technicalQuestionRatioForApi,
      topics,
      totalQuestions,
    ],
  )

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
      if (!interviewType) {
        setActionError('Select an interview type.')
      } else if (!hasDepartmentSelection) {
        setActionError('Select at least one department.')
      } else if (!hasSpecializationSelection) {
        setActionError('Select at least one specialization.')
      } else if (!hasTopicSelection) {
        setActionError('Choose at least one topic.')
      } else if (isDurationEnabled && !duration) {
        setActionError('Select a session duration for this specialization.')
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

  useEffect(() => {
    if (!interviewType || interviewType === 'both') return
    const allowedSet = new Set(availableTopicOptions)
    setTopics((prev) => prev.filter((t) => allowedSet.has(t)))
    if (selectAllTopics && availableTopicOptions.length === 0) {
      setSelectAllTopics(false)
    }
  }, [availableTopicOptions, interviewType, selectAllTopics])

  useEffect(() => {
    if (!selectAllDepartments) return
    setDepartmentKeys(departments.map((department) => department.key))
  }, [departments, selectAllDepartments])

  useEffect(() => {
    if (!selectAllSpecializations) return
    setSpecializationRefs(scopedSpecializationOptions.map((option) => option.ref))
  }, [scopedSpecializationOptions, selectAllSpecializations])

  useEffect(() => {
    if (!selectAllTopics) return
    setTopics(availableTopicOptions)
  }, [availableTopicOptions, selectAllTopics])

  useEffect(() => {
    if (!interviewType || selectedSpecializations.length === 0) return
    if (interviewType === 'both') {
      setTechnicalRatio(averageTechnicalRatio(selectedSpecializations))
    }
  }, [interviewType, selectedSpecializations])

  const resetInterviewForm = useCallback(() => {
    setDepartmentKeys([])
    setSelectAllDepartments(false)
    setDepartmentSearch('')
    setSpecializationRefs([])
    setSelectAllSpecializations(false)
    setSpecializationSearch('')
    setSelectAllTopics(false)
    setInterviewType(null)
    setTopics([])
    setTechnicalRatio(70)
    setDuration('')
    setDifficulty('Medium')
    setTotalQuestions(20)
    setTopicSearch('')
    setTopicMode('all')
    setActionMessage('')
    setActionError('')
    setWizardStep('interviewType')
    setWizardError('')
    setPastDifficulty(false)
  }, [])

  const handleDepartmentsChange = useCallback((nextKeys: string[]) => {
    setDepartmentKeys(nextKeys)
    setSpecializationRefs([])
    setSelectAllSpecializations(false)
    setSelectAllTopics(false)
    setTopics([])
    setDuration('')
    setTopicSearch('')
    setTopicMode('all')
    setPastDifficulty(false)
  }, [])

  const handleSelectAllDepartmentsChange = useCallback((next: boolean) => {
    setSelectAllDepartments(next)
    if (!next) {
      setDepartmentKeys([])
      setSpecializationRefs([])
      setSelectAllSpecializations(false)
      setSelectAllTopics(false)
      setTopics([])
      setDuration('')
    }
  }, [])

  const handleSpecializationsChange = useCallback((nextRefs: string[]) => {
    setSpecializationRefs(nextRefs)
    setSelectAllTopics(false)
    setTopics([])
    setDuration('')
    setTopicSearch('')
    setTopicMode('all')
    setPastDifficulty(false)
  }, [])

  const handleSelectAllSpecializationsChange = useCallback((next: boolean) => {
    setSelectAllSpecializations(next)
    if (!next) {
      setSpecializationRefs([])
      setSelectAllTopics(false)
      setTopics([])
      setDuration('')
    }
  }, [])

  const handleInterviewTypeChange = useCallback((nextType: InterviewType) => {
    setInterviewType(nextType)
    setSelectAllTopics(false)
    setTopics([])
    setTopicMode('all')
    setPastDifficulty(false)
  }, [])

  const goBack = () => {
    setWizardError('')
    if (wizardStep === 'department') setWizardStep('interviewType')
    else if (wizardStep === 'specialization') setWizardStep('department')
    else if (wizardStep === 'topics') setWizardStep('specialization')
    else if (wizardStep === 'difficulty') setWizardStep('topics')
    else if (wizardStep === 'generate') setWizardStep('difficulty')
  }

  const goNext = () => {
    setWizardError('')
    if (wizardStep === 'interviewType') {
      if (!stepStates.typeDone) {
        setWizardError('Select an interview type to continue.')
        return
      }
      setWizardStep('department')
      return
    }
    if (wizardStep === 'department') {
      if (!stepStates.departmentDone) {
        setWizardError('Select at least one department to continue.')
        return
      }
      setWizardStep('specialization')
      return
    }
    if (wizardStep === 'specialization') {
      if (!stepStates.specializationDone) {
        setWizardError('Select at least one specialization to continue.')
        return
      }
      setWizardStep('topics')
      return
    }
    if (wizardStep === 'topics') {
      if (!stepStates.topicsDone) {
        setWizardError('Choose at least one topic to continue.')
        return
      }
      setWizardStep('difficulty')
      return
    }
    if (wizardStep === 'difficulty') {
      if (!stepStates.topicsDone) {
        setWizardError('Complete topics first.')
        return
      }
      setPastDifficulty(true)
      setWizardStep('generate')
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
            {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
            {actionMessage ? <p className="text-sm text-[var(--hq-green)]">{actionMessage}</p> : null}
            {wizardError ? <p className="text-sm text-[var(--hq-amber)]">{wizardError}</p> : null}

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

            <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={wizardStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-5"
                >
                  {wizardStep === 'interviewType' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">What type of interview do you want to practice?</div>
                      <InterviewTypeSelector
                        value={interviewType}
                        onChange={handleInterviewTypeChange}
                        availableTypes={availableInterviewTypes}
                      />
                    </div>
                  ) : null}

                  {wizardStep === 'department' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Choose Department</div>
                      <IndustrySelector
                        options={filteredDepartments}
                        selectedKeys={departmentKeys}
                        onChange={handleDepartmentsChange}
                        selectAll={selectAllDepartments}
                        onSelectAllChange={handleSelectAllDepartmentsChange}
                        isLoading={isLoadingConfig}
                        search={departmentSearch}
                        onSearchChange={setDepartmentSearch}
                      />
                    </div>
                  ) : null}

                  {wizardStep === 'specialization' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Choose Specialization</div>
                      {hasDepartmentSelection ? (
                        <RoleCategorySelector
                          options={filteredSpecializationOptions}
                          selectedRefs={specializationRefs}
                          onChange={handleSpecializationsChange}
                          selectAll={selectAllSpecializations}
                          onSelectAllChange={handleSelectAllSpecializationsChange}
                          showDepartmentLabels={resolvedDepartmentKeys.length > 1}
                          search={specializationSearch}
                          onSearchChange={setSpecializationSearch}
                        />
                      ) : (
                        <div className="rounded-2xl border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                          Select at least one department first.
                        </div>
                      )}
                    </div>
                  ) : null}

                  {wizardStep === 'topics' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Topics</div>
                      {selectedSpecializations.length > 0 && interviewType ? (
                        <TopicSelector
                          technicalTopics={technicalTopicOptions}
                          behavioralTopics={behavioralTopicOptions}
                          hrTopics={hrTopicOptions}
                          selectedTopics={topics}
                          onChange={setTopics}
                          search={topicSearch}
                          onSearchChange={setTopicSearch}
                          mode={topicMode}
                          onModeChange={setTopicMode}
                          allowedKind={topicAllowedKind}
                          selectAll={selectAllTopics}
                          onSelectAllChange={setSelectAllTopics}
                        />
                      ) : (
                        <div className="rounded-2xl border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                          Choose at least one specialization first.
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

                  {wizardStep === 'generate' ? (
                    <>
                      <div className="space-y-3">
                        <div className="text-sm font-semibold text-foreground">Question count</div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <SelectCard title="10" subtitle="Quick (~5 min)" selected={totalQuestions === 10} onClick={() => setTotalQuestions(10)} />
                          <SelectCard title="20" subtitle="Standard (~10 min)" selected={totalQuestions === 20} onClick={() => setTotalQuestions(20)} />
                          <SelectCard title="30" subtitle="Thorough (~15 min)" selected={totalQuestions === 30} onClick={() => setTotalQuestions(30)} />
                        </div>
                        {interviewType === 'both' ? (
                          <div className="rounded-2xl border border-border bg-input/20 p-4">
                            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                              <span>Technical: <strong className="text-foreground">{technicalRatio}%</strong></span>
                              <span>Behavioral: <strong className="text-foreground">{100 - technicalRatio}%</strong></span>
                            </div>
                            <input type="range" min={0} max={100} value={technicalRatio} onChange={(e) => setTechnicalRatio(Number(e.target.value))} className="w-full accent-primary" />
                          </div>
                        ) : null}
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
                            <Clock className="h-4 w-4" /> No time limit for the selected specializations
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-border bg-input/20 p-4 sm:p-5">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Review</div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="text-sm text-muted-foreground">Departments</div>
                          <div className="text-sm font-semibold text-foreground">{summaryDepartmentsPreview}</div>
                          <div className="text-sm text-muted-foreground">Specializations</div>
                          <div className="text-sm font-semibold text-foreground">{summarySpecializationsPreview}</div>
                          <div className="text-sm text-muted-foreground">Type</div>
                          <div className="text-sm font-semibold text-foreground">
                            {interviewType ? formatInterviewTypeLabel(interviewType) : '—'}
                          </div>
                          <div className="text-sm text-muted-foreground">Topics</div>
                          <div className="text-sm font-semibold text-foreground">{summaryTopicsPreview}</div>
                          <div className="text-sm text-muted-foreground">Difficulty</div>
                          <div className="text-sm font-semibold text-foreground">{formatDifficultyLabel(difficulty)}</div>
                          <div className="text-sm text-muted-foreground">Questions</div>
                          <div className="text-sm font-semibold text-foreground">
                            {totalQuestions}
                            {interviewType === 'both'
                              ? ` (Tech ${technicalRatio}% / Beh ${100 - technicalRatio}%)`
                              : interviewType === 'technical'
                                ? ' (all technical)'
                                : interviewType === 'behavioral'
                                  ? ' (all behavioral)'
                                  : ''}
                          </div>
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
                        topicCount={selectAllTopics ? availableTopicOptions.length : topics.length}
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
                disabled={wizardStep === 'interviewType'}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-input/20 px-4 text-sm font-semibold text-foreground hover:bg-input/40 btn-micro disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {wizardStep !== 'generate' ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinueFromStep || isCreatingInterview}
                  className="hq-btn-primary h-10 px-5 text-sm disabled:pointer-events-none disabled:opacity-45"
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
                  <dt className="text-xs text-muted-foreground">Type</dt>
                  <dd className="font-medium text-foreground">
                    {interviewType ? formatInterviewTypeLabel(interviewType) : '—'}
                  </dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Departments</dt>
                  <dd className="font-medium text-foreground">{summaryDepartmentsPreview}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Specializations</dt>
                  <dd className="font-medium text-foreground">{summarySpecializationsPreview}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Topics</dt>
                  <dd className="break-words font-medium text-foreground">{summaryTopicsPreview}</dd>
                </div>
                <div className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <dt className="text-xs text-muted-foreground">Difficulty</dt>
                  <dd className="font-medium text-foreground">{formatDifficultyLabel(difficulty)}</dd>
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
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
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
                    {hasTopicSelection
                      ? interviewType === 'both'
                        ? `${technicalRatio}% tech / ${100 - technicalRatio}% behavioral`
                        : interviewType === 'technical'
                          ? '100% technical'
                          : interviewType === 'behavioral'
                            ? '100% behavioral'
                            : '—'
                      : '—'}
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
                <li>Use Select all to practice across every department, specialization, or topic quickly.</li>
                <li>Pick interview type first — recommended topics adapt to technical, behavioral, or both.</li>
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
