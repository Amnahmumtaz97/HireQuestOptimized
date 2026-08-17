'use client'

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { DifficultySelector, type Difficulty } from '@/components/app/DifficultySelector'
import { InterviewTypeSelector, type InterviewType } from '@/components/app/InterviewTypeSelector'
import { StartInterviewButton } from '@/components/app/StartInterviewButton'
import type { TopicMode } from '@/components/app/TopicSelector'
import { IndustrySelector } from '@/components/app/IndustrySelector'
import { RoleCategorySelector } from '@/components/app/RoleCategorySelector'
import { ResumeUpload } from '@/components/app/ResumeUpload'
import type { ResumeParseResult } from '@/lib/resume/schema'
import { matchResumeToCatalog } from '@/lib/resume/match-catalog'
import { getSavedProfileResume } from '@/lib/profile/storage'
import type { LearningStage } from '@/components/app/learning-paths/types'
import { LearningPathsDashboardWidget } from '@/components/app/learning-paths/LearningPathsDashboardWidget'
import { toSpecializationRef } from '@/lib/interview-catalog/resolve'
import {
  MessageSquare, BarChart2, User,
  Plus, RotateCcw, Activity, CheckCircle2,
  Clock, Sparkles, CreditCard,
  Briefcase, Tag, AlarmClock, ArrowLeft, ArrowRight,
  Trash2, Lightbulb, ListChecks, Check, ChevronDown, ChevronRight, Leaf, Mountain, FileText,
} from 'lucide-react'
import { ProgressRing } from '@/components/dashboard/ProgressRing'
import { AIAssistantCard } from '@/components/dashboard/AIAssistantCard'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { Card } from '@/components/ui/card'
import { ListPagination } from '@/components/ui/list-pagination'
import { defaultMonthToDateRange } from '@/utils/dashboard/date'
import { InterviewListRow } from '@/components/app/interview/InterviewListRow'
import { useToast } from '@/components/ui/toast'
import {
  formatDifficultyLabel,
  formatInterviewTypeLabel,
  formatInterviewSessionTitle,
  formatSpecializationsDisplay,
  formatTopicsDisplay,
  formatIndustryDisplay,
} from '@/utils/dashboard/interview-labels'
import {
  averageTechnicalRatio,
  buildScopedRoleOptions,
  filterDepartmentsBySearch,
  filterScopedSpecializationsBySearch,
  mergeTopicsFromRoles,
  resolveRoleRefs,
  resolveRolesFromRefs,
  unionDurationOptions,
} from '@/lib/interview-scope'
import { InterviewDeleteModal } from '@/components/app/InterviewDeleteModal'
import { DashboardDateCalendarButton } from '@/components/app/dashboard/DashboardDateCalendarButton'
import type {
  InterviewConfig,
  InterviewSession,
} from '@/components/app/dashboard/types'
import type { DepartmentConfig } from '@/lib/interview-catalog/types'
import { IconCard, IconGrid } from '@/components/ui/icon-card'
import { AlertBanner } from '@/components/ui/alert-banner'
import { ChipMultiSelect } from '@/components/app/ChipMultiSelect'
import { TopicBundleSelector, DynamicTopicGrid } from '@/components/app/TopicBundleSelector'
import {
  CODING_CATEGORIES,
  BEHAVIORAL_COMPETENCIES,
  HR_SECTIONS,
  HR_SECTION_KEYS,
  SYSTEM_DESIGN_TOPICS,
} from '@/lib/interview-config/type-config'
import { hrSectionLabel } from '@/lib/interview-config/banks/hr-sections'
import { INTERVIEW_TYPE_UI_ORDER, DEFAULT_MIX_WEIGHTS, interviewTypeNeedsCatalog } from '@/lib/interview-config/interview-types'
import { QUESTION_COUNT_PRESETS } from '@/lib/interview-config/question-counts'
import { DURATION_OPTIONS_DEFAULT } from '@/lib/interview-config/durations'
import type { MixKind } from '@/lib/interview-config/type-config'

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

/** Steps whose action verb is not simply "Choose <label>". */
const WIZARD_STEP_ACTIONS: Partial<Record<WizardStepKey, string>> = {
  interviewType: 'Choose Type',
  difficulty: 'Set Difficulty',
  generate: 'Generate',
}

function wizardStepAction(key: WizardStepKey, label: string) {
  return WIZARD_STEP_ACTIONS[key] ?? `Choose ${label}`
}

function WizardStepper({
  steps,
  active,
  onSelect,
  maxVisibleIndex,
}: {
  steps: Array<{ key: WizardStepKey; label: string; isComplete: boolean }>
  active: WizardStepKey
  onSelect: (key: WizardStepKey) => void
  /** Highest step index to show (progressive reveal). */
  maxVisibleIndex: number
}) {
  const visibleSteps = steps.slice(0, Math.max(1, maxVisibleIndex + 1))
  const activeIndex = Math.max(
    0,
    visibleSteps.findIndex((s) => s.key === active),
  )
  const activeStep = visibleSteps[activeIndex]

  return (
    <nav
      aria-label="Interview setup steps"
      className="hq-wiz-stepper w-full rounded-2xl border border-border px-3.5 py-3 sm:px-5 sm:py-4"
    >
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Step {activeIndex + 1} of {steps.length}
        </span>
        <span className="min-w-0 truncate text-[15px] font-bold tracking-[-0.015em] text-foreground">
          {activeStep ? wizardStepAction(activeStep.key, activeStep.label) : ''}
        </span>
      </div>

      <ol className="-mx-1 flex flex-nowrap items-center overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleSteps.map((s, idx) => {
          const isActive = s.key === active
          const isComplete = s.isComplete
          const isLast = idx === visibleSteps.length - 1

          return (
            <li key={s.key} className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={() => onSelect(s.key)}
                aria-current={isActive ? 'step' : undefined}
                className={[
                  'group inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5 transition-colors',
                  isActive
                    ? 'border-transparent bg-primary/12'
                    : 'border-transparent hover:bg-input/30',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold',
                    isActive
                      ? 'hq-wiz-step-num--active'
                      : isComplete
                        ? 'hq-wiz-step-num--done'
                        : 'hq-wiz-step-num--todo',
                  ].join(' ')}
                  aria-hidden
                >
                  {isComplete && !isActive ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                </span>
                <span
                  className={[
                    'whitespace-nowrap text-[12.5px] tracking-[-0.01em]',
                    isActive
                      ? 'font-bold hq-wiz-step-label--active'
                      : isComplete
                        ? 'font-medium hq-wiz-step-label--done'
                        : 'font-medium hq-wiz-step-label--todo',
                  ].join(' ')}
                >
                  {s.label}
                </span>
              </button>

              {!isLast ? (
                <ChevronRight
                  className="mx-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/45"
                  strokeWidth={2.5}
                  aria-hidden
                />
              ) : null}
            </li>
          )
        })}
      </ol>
    </nav>
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
        return tb - ta
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

  const interviewTypeTagClass = (_t: string) => 'hq-tag hq-tag--accent'

  const statusTagClass = (status: InterviewSession['status']) => {
    if (status === 'completed') return 'hq-tag hq-tag--easy'
    if (status === 'in_progress') return 'hq-tag hq-tag--medium'
    return 'hq-tag hq-tag--accent'
  }

  return (
    <div className="animate-fade-up space-y-6 sm:space-y-7">
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

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(240px,300px)_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-4 lg:self-start">
          <LearningPathsDashboardWidget />
        </div>

        <Card className="min-w-0 p-6">
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
              {pagedSessions.map((s) => {
                const href =
                  s.status === 'completed'
                    ? `/app/interviews/${s._id}/results`
                    : `/app/interviews/${s._id}`
                const actionLabel =
                  s.status === 'completed' ? 'View results' : s.status === 'in_progress' ? 'Resume' : 'Start'
                return (
              <div key={s._id} className="hq-interview-row flex-wrap items-start sm:flex-nowrap sm:items-center">
                <div className="hq-int-icon">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="hq-int-name">
                        {formatInterviewSessionTitle(s, interviewConfigs)}
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
                        onClick={() => router.push(href)}
                        className="hq-panel-btn min-h-8 px-3 py-1.5 text-xs font-semibold"
                      >
                        {actionLabel}
                      </button>
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
                )
              })}
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
      </div>

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
          const title = formatInterviewSessionTitle(s, interviewConfigs).toLowerCase()
          const industry = formatIndustryDisplay(s.industryKey, interviewConfigs).toLowerCase()
          const type = formatInterviewTypeLabel(s.interviewType).toLowerCase()
          const topics = (s.topics ?? []).join(' ').toLowerCase()
          return `${title} ${industry} ${type} ${topics}`.includes(q)
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
  const difficultyOptions: Array<{ key: 'all' | 'Easy' | 'Medium' | 'Hard' | 'Adaptive'; label: string; icon: React.ReactNode; iconClass: string }> = [
    { key: 'all', label: 'All', icon: <BarChart2 className="h-3.5 w-3.5" />, iconClass: 'text-[var(--hq-display-blue)]' },
    { key: 'Easy', label: 'Easy', icon: <Leaf className="h-3.5 w-3.5" />, iconClass: 'text-emerald-400' },
    { key: 'Medium', label: 'Medium', icon: <Activity className="h-3.5 w-3.5" />, iconClass: 'text-amber-400' },
    { key: 'Hard', label: 'Hard', icon: <Mountain className="h-3.5 w-3.5" />, iconClass: 'text-rose-400' },
    { key: 'Adaptive', label: 'Adaptive AI', icon: <Sparkles className="h-3.5 w-3.5" />, iconClass: 'text-primary' },
  ]
  const selectedDifficulty = difficultyOptions.find((o) => o.key === difficultyFilter) ?? difficultyOptions[0]

  const pageSize = 8
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [safePage, sorted])

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
          <div className="hq-ilist">
            {pageItems.map((s) => (
              <InterviewListRow
                key={s._id}
                session={s}
                configs={interviewConfigs}
                onDelete={() => setDeleteTargetId(s._id)}
              />
            ))}
          </div>

          <ListPagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
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

export type CreateInterviewWizardProps = {
  entryMode?: 'manual' | 'resume' | 'path'
  learningPathId?: string | null
  learningStageId?: string | null
  stagePrefill?: LearningStage | null
  hideResumeUpload?: boolean
  focusResumeSection?: boolean
  prefillType?: InterviewType | null
  prefillTopic?: string | null
}

export function CreateInterviewWizard({
  entryMode = 'manual',
  learningPathId: learningPathIdProp = null,
  learningStageId: learningStageIdProp = null,
  stagePrefill = null,
  hideResumeUpload = false,
  focusResumeSection = false,
  prefillType = null,
  prefillTopic = null,
}: CreateInterviewWizardProps = {}) {
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
          interviewTypes: specialization.interviewTypes ?? ['Technical', 'Behavioral', 'Screening HR'],
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

  const [departmentKey, setDepartmentKey] = useState<string | null>(null)
  const [departmentSearch, setDepartmentSearch] = useState('')
  const [specializationRefs, setSpecializationRefs] = useState<string[]>([])
  const [selectAllSpecializations, setSelectAllSpecializations] = useState(false)
  const [specializationSearch, setSpecializationSearch] = useState('')
  const [selectAllTopics, setSelectAllTopics] = useState(false)
  const [interviewType, setInterviewType] = useState<InterviewType | null>(null)
  const [topics, setTopics] = useState<string[]>([])
  const [codingCategories, setCodingCategories] = useState<string[]>([])
  const [behavioralCompetencies, setBehavioralCompetencies] = useState<string[]>([])
  const [hrSections, setHrSections] = useState<string[]>([])
  const [systemDesignTopics, setSystemDesignTopics] = useState<string[]>([])
  const [mixWeights, setMixWeights] = useState<Partial<Record<MixKind, number>>>({
    ...DEFAULT_MIX_WEIGHTS,
  })
  const [mixSelections, setMixSelections] = useState<Partial<Record<MixKind, string[]>>>({})
  const [technicalRatio, setTechnicalRatio] = useState(70)
  const [duration, setDuration] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
  const [totalQuestions, setTotalQuestions] = useState(20)
  const [topicSearch, setTopicSearch] = useState('')
  const [topicMode, setTopicMode] = useState<TopicMode>('all')
  const [topicViewMode, setTopicViewMode] = useState<'bundles' | 'individual'>('bundles')
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isCreatingInterview, setIsCreatingInterview] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [wizardStep, setWizardStep] = useState<WizardStepKey>('interviewType')
  const [wizardError, setWizardError] = useState('')
  const [pastDifficulty, setPastDifficulty] = useState(false)
  const [resumeContext, setResumeContext] = useState<ResumeParseResult | null>(null)
  const [savedResume, setSavedResume] = useState<ResumeParseResult | null>(null)
  const [profileResumeChecked, setProfileResumeChecked] = useState(false)
  const [showResumeUploader, setShowResumeUploader] = useState(false)
  const [learningPathId, setLearningPathId] = useState<string | null>(learningPathIdProp)
  const [learningStageId, setLearningStageId] = useState<string | null>(learningStageIdProp)

  useEffect(() => {
    setLearningPathId(learningPathIdProp)
    setLearningStageId(learningStageIdProp)
  }, [learningPathIdProp, learningStageIdProp])

  useEffect(() => {
    const profileResume = getSavedProfileResume()
    setSavedResume(profileResume)
    setShowResumeUploader(!profileResume)
    setProfileResumeChecked(true)
  }, [])

  useEffect(() => {
    if (!focusResumeSection) return
    const t = window.setTimeout(() => {
      document.getElementById('start-from-resume')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 120)
    return () => window.clearTimeout(t)
  }, [focusResumeSection])

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

  const availableInterviewTypes = useMemo(
    (): InterviewType[] => [...INTERVIEW_TYPE_UI_ORDER],
    [],
  )

  const needsCatalog = interviewTypeNeedsCatalog(interviewType)
  const isBankType =
    interviewType === 'coding' ||
    interviewType === 'behavioral' ||
    interviewType === 'hr' ||
    interviewType === 'system_design' ||
    interviewType === 'mixed' ||
    interviewType === 'both'

  const resolvedDepartmentKeys = useMemo(() => {
    if (!departmentKey) return [] as string[]
    const valid = departments.some((department) => department.key === departmentKey)
    return valid ? [departmentKey] : []
  }, [departmentKey, departments])

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
    return mergeTopicsFromRoles(
      selectedSpecializations,
      interviewType === 'coding' ? 'technical' : interviewType,
    )
  }, [interviewType, selectedSpecializations])

  const technicalTopicOptions = topicScope.technicalTopics
  const behavioralTopicOptions = topicScope.behavioralTopics
  const hrTopicOptions = topicScope.hrTopics
  const availableTopicOptions = topicScope.topics
  const durationOptions = useMemo(() => {
    const fromSpecs = unionDurationOptions(selectedSpecializations)
    return fromSpecs.length > 0 ? fromSpecs : [...DURATION_OPTIONS_DEFAULT]
  }, [selectedSpecializations])

  const topicAllowedKind = useMemo((): 'technical' | 'behavioral' | 'both' | 'hr' => {
    if (interviewType === 'technical' || interviewType === 'coding') return 'technical'
    if (interviewType === 'behavioral') return 'behavioral'
    if (interviewType === 'hr') return 'hr'
    return 'both'
  }, [interviewType])

  const hasDepartmentSelection = Boolean(departmentKey) && resolvedDepartmentKeys.length > 0
  const hasSpecializationSelection = selectAllSpecializations || specializationRefs.length > 0
  const hasBankSelection = useMemo(() => {
    if (interviewType === 'coding') return codingCategories.length > 0
    if (interviewType === 'behavioral') return behavioralCompetencies.length > 0
    if (interviewType === 'hr') return hrSections.length > 0
    if (interviewType === 'system_design') return systemDesignTopics.length > 0
    if (interviewType === 'mixed' || interviewType === 'both') {
      const kinds = (Object.keys(mixWeights) as MixKind[]).filter((k) => (mixWeights[k] ?? 0) > 0)
      if (kinds.length === 0) return false
      const sum = kinds.reduce((a, k) => a + (mixWeights[k] ?? 0), 0)
      if (sum !== 100) return false
      return kinds.every((k) => (mixSelections[k]?.length ?? 0) > 0)
    }
    return selectAllTopics || topics.length > 0
  }, [
    behavioralCompetencies.length,
    codingCategories.length,
    hrSections.length,
    interviewType,
    mixSelections,
    mixWeights,
    selectAllTopics,
    systemDesignTopics.length,
    topics.length,
  ])

  const hasTopicSelection = needsCatalog
    ? selectAllTopics || topics.length > 0
    : hasBankSelection

  const canCreateInterview =
    Boolean(interviewType) &&
    Boolean(difficulty) &&
    hasTopicSelection &&
    Boolean(duration) &&
    (needsCatalog ? hasDepartmentSelection && hasSpecializationSelection : true)

  const stepStates = useMemo(() => {
    const typeDone = Boolean(interviewType)
    if (!needsCatalog) {
      const selectionDone = typeDone && hasTopicSelection
      const difficultyDone = selectionDone && Boolean(difficulty)
      const generateReady =
        difficultyDone && pastDifficulty && Boolean(totalQuestions) && Boolean(duration)
      return {
        typeDone,
        departmentDone: typeDone,
        specializationDone: typeDone,
        topicsDone: selectionDone,
        difficultyDone,
        generateReady,
      }
    }
    const departmentDone = typeDone && hasDepartmentSelection
    const specializationDone = departmentDone && hasSpecializationSelection
    const topicsDone = specializationDone && hasTopicSelection
    const difficultyDone = topicsDone && Boolean(difficulty)
    const generateReady =
      difficultyDone &&
      pastDifficulty &&
      Boolean(totalQuestions) &&
      Boolean(duration)

    return {
      typeDone,
      departmentDone,
      specializationDone,
      topicsDone,
      difficultyDone,
      generateReady,
    }
  }, [
    difficulty,
    duration,
    hasDepartmentSelection,
    hasSpecializationSelection,
    hasTopicSelection,
    interviewType,
    needsCatalog,
    pastDifficulty,
    totalQuestions,
  ])

  const firstIncompleteStepIndex = useMemo(() => {
    if (!stepStates.typeDone) return 0
    if (needsCatalog) {
    if (!stepStates.departmentDone) return 1
    if (!stepStates.specializationDone) return 2
    if (!stepStates.topicsDone) return 3
      if (!stepStates.difficultyDone || !pastDifficulty) return 4
    if (!stepStates.generateReady) return 5
    return 6
    }
    // type → topics → difficulty → generate (indices in filtered wizardSteps)
    if (!stepStates.topicsDone) return 1
    if (!stepStates.difficultyDone || !pastDifficulty) return 2
    if (!stepStates.generateReady) return 3
    return 4
  }, [needsCatalog, pastDifficulty, stepStates])

  const wizardSteps = useMemo(() => {
    if (!interviewType) {
      return [
        { key: 'interviewType' as const, label: 'Type', isComplete: stepStates.typeDone },
      ]
    }
    if (!needsCatalog) {
      const selectionLabel =
        interviewType === 'coding'
          ? 'Categories'
          : interviewType === 'behavioral'
            ? 'Competencies'
            : interviewType === 'hr'
              ? 'Sections'
              : interviewType === 'system_design'
                ? 'Topics'
                : 'Sections'
      return [
        { key: 'interviewType' as const, label: 'Type', isComplete: stepStates.typeDone },
        { key: 'topics' as const, label: selectionLabel, isComplete: stepStates.topicsDone },
        { key: 'difficulty' as const, label: 'Difficulty', isComplete: stepStates.difficultyDone && pastDifficulty },
        { key: 'generate' as const, label: 'Generate', isComplete: stepStates.generateReady },
      ]
    }
    return [
      { key: 'interviewType' as const, label: 'Type', isComplete: stepStates.typeDone },
      { key: 'department' as const, label: 'Department', isComplete: stepStates.departmentDone },
      { key: 'specialization' as const, label: 'Specialization', isComplete: stepStates.specializationDone },
      { key: 'topics' as const, label: 'Topics', isComplete: stepStates.topicsDone },
      { key: 'difficulty' as const, label: 'Difficulty', isComplete: stepStates.difficultyDone && pastDifficulty },
      { key: 'generate' as const, label: 'Generate', isComplete: stepStates.generateReady },
    ]
  }, [interviewType, needsCatalog, pastDifficulty, stepStates])

  const summaryTopicsPreview = useMemo(
    () =>
      formatTopicsDisplay(topics, {
        selectAll: selectAllTopics,
        totalAvailable: availableTopicOptions.length,
      }),
    [availableTopicOptions.length, selectAllTopics, topics],
  )

  const summaryDepartmentsPreview = useMemo(() => {
    if (!departmentKey) return '—'
    return formatIndustryDisplay(departmentKey, configShim)
  }, [configShim, departmentKey])

  const summarySpecializationsPreview = useMemo(
    () =>
      formatSpecializationsDisplay(departmentKey ?? '', [], configShim, {
        selectAll: selectAllSpecializations,
        totalAvailable: scopedSpecializationOptions.length,
        specializationRefs: resolvedSpecializationRefs,
      }),
    [
      configShim,
      departmentKey,
      resolvedSpecializationRefs,
      scopedSpecializationOptions.length,
      selectAllSpecializations,
    ],
  )

  const summarySelectionPreview = useMemo(() => {
    if (interviewType === 'coding') return formatTopicsDisplay(codingCategories)
    if (interviewType === 'behavioral') return formatTopicsDisplay(behavioralCompetencies)
    if (interviewType === 'hr') {
      return formatTopicsDisplay(hrSections.map((key) => hrSectionLabel(key)))
    }
    if (interviewType === 'system_design') return formatTopicsDisplay(systemDesignTopics)
    if (interviewType === 'mixed' || interviewType === 'both') {
      const parts = (Object.entries(mixWeights) as [MixKind, number][])
        .filter(([, weight]) => weight > 0)
        .map(([kind, weight]) => {
          const count = mixSelections[kind]?.length ?? 0
          return `${formatInterviewTypeLabel(kind)} ${weight}% (${count})`
        })
      return parts.length > 0 ? parts.join(' · ') : '—'
    }
    return summaryTopicsPreview
  }, [
    behavioralCompetencies,
    codingCategories,
    hrSections,
    interviewType,
    mixSelections,
    mixWeights,
    summaryTopicsPreview,
    systemDesignTopics,
  ])

  const summarySelectionLabel = useMemo(() => {
    if (interviewType === 'coding') return 'Categories'
    if (interviewType === 'behavioral') return 'Competencies'
    if (interviewType === 'hr') return 'Sections'
    if (interviewType === 'system_design') return 'Topics'
    if (interviewType === 'mixed' || interviewType === 'both') return 'Mix'
    return 'Topics'
  }, [interviewType])

  const summaryQuestionsPreview = useMemo(() => {
    if (!totalQuestions) return '—'
    if (interviewType === 'mixed' || interviewType === 'both') {
      const parts = (Object.entries(mixWeights) as [MixKind, number][])
        .filter(([, weight]) => weight > 0)
        .map(([kind, weight]) => `${formatInterviewTypeLabel(kind)} ${weight}%`)
      return parts.length > 0 ? `${totalQuestions} (${parts.join(' / ')})` : String(totalQuestions)
    }
    if (interviewType === 'technical') return `${totalQuestions} (all technical)`
    if (interviewType === 'behavioral') return `${totalQuestions} (all behavioral)`
    if (interviewType === 'coding') return `${totalQuestions} (coding)`
    if (interviewType === 'system_design') return `${totalQuestions} (system design)`
    if (interviewType === 'hr') return `${totalQuestions} (screening HR)`
    return String(totalQuestions)
  }, [interviewType, mixWeights, totalQuestions])

  const reviewRows = useMemo(() => {
    const rows: Array<{ label: string; value: string }> = [
      {
        label: 'Type',
        value: interviewType ? formatInterviewTypeLabel(interviewType) : '—',
      },
    ]

    if (needsCatalog) {
      rows.push(
        { label: 'Department', value: summaryDepartmentsPreview },
        { label: 'Specialization', value: summarySpecializationsPreview },
      )
    }

    rows.push(
      { label: summarySelectionLabel, value: summarySelectionPreview },
      {
        label: 'Difficulty',
        value: difficulty ? formatDifficultyLabel(difficulty) : '—',
      },
      { label: 'Questions', value: summaryQuestionsPreview },
      { label: 'Duration', value: duration ? `${duration} min` : '—' },
    )

    return rows
  }, [
    difficulty,
    duration,
    interviewType,
    needsCatalog,
    summaryDepartmentsPreview,
    summaryQuestionsPreview,
    summarySelectionLabel,
    summarySelectionPreview,
    summarySpecializationsPreview,
  ])

  const selectionCount = useMemo(() => {
    if (interviewType === 'coding') return codingCategories.length
    if (interviewType === 'behavioral') return behavioralCompetencies.length
    if (interviewType === 'hr') return hrSections.length
    if (interviewType === 'system_design') return systemDesignTopics.length
    if (interviewType === 'mixed' || interviewType === 'both') {
      return (Object.values(mixSelections) as string[][]).reduce((sum, list) => sum + list.length, 0)
    }
    return selectAllTopics ? availableTopicOptions.length : topics.length
  }, [
    availableTopicOptions.length,
    behavioralCompetencies.length,
    codingCategories.length,
    hrSections.length,
    interviewType,
    mixSelections,
    selectAllTopics,
    systemDesignTopics.length,
    topics.length,
  ])

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
    if (interviewType === 'both' || interviewType === 'mixed') {
      const sum =
        (mixWeights.coding ?? 0) +
        (mixWeights.system_design ?? 0) +
        (mixWeights.technical ?? 0)
      return sum || technicalRatio
    }
    if (
      interviewType === 'technical' ||
      interviewType === 'coding' ||
      interviewType === 'system_design'
    ) {
      return 100
    }
    if (interviewType === 'behavioral' || interviewType === 'hr') return 0
    return technicalRatio
  }, [interviewType, mixWeights, technicalRatio])

  const draftPayload = useMemo(() => {
    const mixSections =
      interviewType === 'mixed' || interviewType === 'both'
        ? (Object.entries(mixWeights) as [MixKind, number][])
            .filter(([, w]) => w > 0)
            .map(([kind, weight]) => ({
              kind,
              weight,
              selection: mixSelections[kind] ?? [],
            }))
        : undefined

    return {
      departmentKey: needsCatalog ? departmentKey ?? '' : undefined,
      specializationKey: needsCatalog ? selectedSpecializations[0]?.key ?? '' : undefined,
      specializationRefs: needsCatalog ? resolvedSpecializationRefs : undefined,
      specializationKeys: needsCatalog
        ? selectedSpecializations.map((spec) => spec.key)
        : undefined,
      selectAllSpecializations: needsCatalog ? selectAllSpecializations : false,
      selectAllTopics: needsCatalog ? selectAllTopics : false,
      interviewType: interviewType === 'both' ? 'mixed' : interviewType,
      preferredQuestionFormat: interviewType === 'coding' ? 'coding' : null,
      topics:
        interviewType === 'system_design'
          ? systemDesignTopics
          : interviewType === 'coding'
            ? codingCategories
            : interviewType === 'behavioral'
              ? behavioralCompetencies
              : needsCatalog
                ? selectAllTopics
                  ? []
                  : topics
                : topics,
      codingCategories: interviewType === 'coding' ? codingCategories : undefined,
      behavioralCompetencies:
        interviewType === 'behavioral' ? behavioralCompetencies : undefined,
      hrSections: interviewType === 'hr' ? hrSections : undefined,
      systemDesignTopics:
        interviewType === 'system_design' ? systemDesignTopics : undefined,
      mixSections,
      difficulty,
      totalQuestions,
      technicalQuestionRatio: technicalQuestionRatioForApi,
      durationMinutes: Number(duration) || null,
      entryMode,
      learningPathId: learningPathId || null,
      learningStageId: learningStageId || null,
      resumeContext: resumeContext
        ? {
            name: resumeContext.name,
            yearsExperience: resumeContext.yearsExperience,
            seniorityLevel: resumeContext.seniorityLevel,
            domain: resumeContext.domain,
            skills: resumeContext.skills,
            projects: resumeContext.projects,
          }
        : null,
    }
  }, [
    behavioralCompetencies,
    codingCategories,
    departmentKey,
      difficulty,
      duration,
    entryMode,
    hrSections,
      interviewType,
    learningPathId,
    learningStageId,
    mixSelections,
    mixWeights,
    needsCatalog,
      resolvedSpecializationRefs,
    resumeContext,
      selectAllSpecializations,
      selectAllTopics,
      selectedSpecializations,
    systemDesignTopics,
      technicalQuestionRatioForApi,
      topics,
      totalQuestions,
  ])

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
      } else if (needsCatalog && !hasDepartmentSelection) {
        setActionError('Select at least one department.')
      } else if (needsCatalog && !hasSpecializationSelection) {
        setActionError('Select at least one specialization.')
      } else if (!hasTopicSelection) {
        setActionError('Choose at least one option for this interview type.')
      } else if (!difficulty) {
        setActionError('Choose a difficulty level.')
      } else if (!duration) {
        setActionError('Select a session duration.')
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

      const genRes = await fetch(`/api/interviews/${sessionId}/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
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
    setDepartmentKey(null)
    setDepartmentSearch('')
    setSpecializationRefs([])
    setSelectAllSpecializations(false)
    setSpecializationSearch('')
    setSelectAllTopics(false)
    setInterviewType(null)
    setTopics([])
    setTechnicalRatio(70)
    setDuration('')
    setDifficulty(null)
    setTotalQuestions(20)
    setTopicSearch('')
    setTopicMode('all')
    setTopicViewMode('bundles')
    setActionMessage('')
    setActionError('')
    setWizardStep('interviewType')
    setWizardError('')
    setPastDifficulty(false)
    setResumeContext(null)
    setShowResumeUploader(!savedResume)
  }, [savedResume])

  const applyResumeSuggestions = useCallback(
    (resume: ResumeParseResult) => {
      setResumeContext(resume)
      const match = matchResumeToCatalog(resume, departments)
      if (match.departmentKey) {
        setDepartmentKey(match.departmentKey)
        if (match.specializationKeys.length > 0) {
          setSpecializationRefs(
            match.specializationKeys.map((k) =>
              toSpecializationRef(match.departmentKey!, k),
            ),
          )
          setSelectAllSpecializations(false)
        } else {
    setSpecializationRefs([])
    setSelectAllSpecializations(false)
        }
        if (match.topics.length > 0) {
          setTopics(match.topics)
    setSelectAllTopics(false)
        }
      }
      if (match.difficulty) {
        setDifficulty(match.difficulty)
        setPastDifficulty(true)
      }
      if (match.interviewType) setInterviewType(match.interviewType)
    },
    [departments],
  )

  useEffect(() => {
    if (!stagePrefill || departments.length === 0) return
    if (stagePrefill.departmentKey) {
      setDepartmentKey(stagePrefill.departmentKey)
      if (stagePrefill.specializationKeys?.length) {
        setSpecializationRefs(
          stagePrefill.specializationKeys.map((k) =>
            toSpecializationRef(stagePrefill.departmentKey!, k),
          ),
        )
        setSelectAllSpecializations(false)
      }
    }
    if (stagePrefill.interviewType) setInterviewType(stagePrefill.interviewType)
    if (stagePrefill.difficulty) {
      setDifficulty(stagePrefill.difficulty)
      setPastDifficulty(true)
    }
    if (stagePrefill.suggestedTopics?.length) {
      setTopics(stagePrefill.suggestedTopics)
      setSelectAllTopics(false)
    }
    if (typeof stagePrefill.totalQuestions === 'number') {
      setTotalQuestions(stagePrefill.totalQuestions)
    }
    if (typeof stagePrefill.technicalQuestionRatio === 'number') {
      setTechnicalRatio(stagePrefill.technicalQuestionRatio)
    }
  }, [stagePrefill, departments])

  const prefillApplied = useRef(false)
  useEffect(() => {
    if (prefillApplied.current || !prefillType) return
    prefillApplied.current = true
    setInterviewType(prefillType)
    if (!prefillTopic) return
    if (prefillType === 'coding') setCodingCategories([prefillTopic])
    else if (prefillType === 'behavioral') setBehavioralCompetencies([prefillTopic])
    else if (prefillType === 'hr') setHrSections([prefillTopic])
    else if (prefillType === 'system_design') setSystemDesignTopics([prefillTopic])
    else setTopics([prefillTopic])
  }, [prefillType, prefillTopic])

  const handleDepartmentChange = useCallback((nextKey: string | null) => {
    setDepartmentKey(nextKey)
      setSpecializationRefs([])
      setSelectAllSpecializations(false)
      setSelectAllTopics(false)
      setTopics([])
      setDuration('')
    setTopicSearch('')
    setTopicMode('all')
    setPastDifficulty(false)
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
    setCodingCategories([])
    setBehavioralCompetencies([])
    setHrSections([])
    setSystemDesignTopics([])
    setMixSelections({})
    setTopicMode('all')
    setPastDifficulty(false)
    setWizardStep('interviewType')
  }, [])

  const wizardStepKeys = useMemo(() => wizardSteps.map((s) => s.key), [wizardSteps])

  const goBack = () => {
    setWizardError('')
    const idx = wizardStepKeys.indexOf(wizardStep)
    if (idx > 0) setWizardStep(wizardStepKeys[idx - 1])
  }

  const goNext = () => {
    setWizardError('')
    const idx = wizardStepKeys.indexOf(wizardStep)
    if (wizardStep === 'interviewType' && !stepStates.typeDone) {
        setWizardError('Select an interview type to continue.')
        return
      }
    if (wizardStep === 'department' && !stepStates.departmentDone) {
        setWizardError('Select at least one department to continue.')
        return
      }
    if (wizardStep === 'specialization' && !stepStates.specializationDone) {
        setWizardError('Select at least one specialization to continue.')
        return
      }
    if (wizardStep === 'topics' && !stepStates.topicsDone) {
      setWizardError('Choose at least one option to continue.')
      return
    }
    if (wizardStep === 'difficulty') {
      if (!difficulty) {
        setWizardError('Choose a difficulty to continue.')
        return
      }
      setPastDifficulty(true)
    }
    if (idx >= 0 && idx < wizardStepKeys.length - 1) {
      setWizardStep(wizardStepKeys[idx + 1])
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
            {actionError ? <AlertBanner variant="error">{actionError}</AlertBanner> : null}
            {actionMessage ? <AlertBanner variant="success">{actionMessage}</AlertBanner> : null}
            {wizardError ? <AlertBanner variant="warning">{wizardError}</AlertBanner> : null}

            {(learningPathId || learningStageId) && (
              <p className="text-xs text-muted-foreground">
                Linked from a learning path
                {stagePrefill?.title ? ` · ${stagePrefill.title}` : ''}
                {learningPathId ? ` · path …${learningPathId.slice(-6)}` : ''}
                . Path bindings and any attached resume will tailor generated questions.
              </p>
            )}

            {!hideResumeUpload ? (
              <div
                id="start-from-resume"
                className={[
                  'rounded-2xl border border-border bg-input/10 p-4 sm:p-5',
                  focusResumeSection ? 'ring-2 ring-primary/50' : '',
                ].join(' ')}
              >
                <div className="mb-3">
                  <div className="text-sm font-semibold text-foreground">Start from your resume</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use the resume saved in your profile or upload a different one for this interview.
                  </p>
                </div>
                {profileResumeChecked && savedResume ? (
                  <div className="mb-3 rounded-xl border border-border bg-card/60 p-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-2.5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground">Resume saved in your profile</p>
                          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                            {savedResume.domain || 'General profile'}
                            {savedResume.seniorityLevel ? ` · ${savedResume.seniorityLevel}` : ''}
                            {savedResume.skills.length ? ` · ${savedResume.skills.length} skills` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isLoadingConfig}
                          onClick={() => {
                            applyResumeSuggestions(savedResume)
                            setShowResumeUploader(false)
                          }}
                          className="hq-btn-primary h-9 gap-1.5 rounded-xl px-3 text-xs disabled:cursor-wait disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {resumeContext === savedResume ? 'Using saved resume' : 'Use saved resume'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResumeContext(null)
                            setShowResumeUploader(true)
                          }}
                          className="inline-flex h-9 items-center rounded-xl border border-border bg-input/15 px-3 text-xs font-semibold text-foreground hover:bg-input/25"
                        >
                          Upload new
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
                {profileResumeChecked && showResumeUploader ? (
                  <ResumeUpload
                    value={resumeContext}
                    onParsed={applyResumeSuggestions}
                    onClear={() => setResumeContext(null)}
                  />
                ) : null}
              </div>
            ) : null}

            <WizardStepper
              steps={wizardSteps}
              active={wizardStep}
              maxVisibleIndex={firstIncompleteStepIndex}
              onSelect={(key) => {
                setWizardError('')
                const idx = wizardStepKeys.indexOf(key)
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
                        selectedKey={departmentKey}
                        onChange={handleDepartmentChange}
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
                          showDepartmentLabels={false}
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
                      {/* ── Header: title + view-mode toggle ── */}
                      {(() => {
                        const isBankType = interviewType === 'coding' || interviewType === 'behavioral' || interviewType === 'hr' || interviewType === 'system_design'
                        const title =
                          interviewType === 'coding' ? 'Coding categories'
                          : interviewType === 'behavioral' ? 'Behavioral competencies'
                          : interviewType === 'hr' ? 'Screening sections'
                          : interviewType === 'system_design' ? 'System design topics'
                          : interviewType === 'technical' ? 'Technical topics'
                          : interviewType === 'mixed' || interviewType === 'both' ? 'Mixed sections'
                          : 'Topics'
                        return (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-foreground">{title}</span>
                            {isBankType ? (
                              <div className="flex items-center gap-0.5 rounded-lg border border-border bg-input/20 p-0.5">
                                {(['bundles', 'individual'] as const).map((mode) => (
                                  <button
                                    key={mode}
                                    type="button"
                                    onClick={() => setTopicViewMode(mode)}
                                    className={[
                                      'inline-flex h-6 items-center rounded-md px-2.5 text-[11px] font-semibold transition-colors',
                                      topicViewMode === mode
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground',
                                    ].join(' ')}
                                  >
                                    {mode === 'bundles' ? 'Bundles' : 'Individual'}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        )
                      })()}

                      {/* ── Selectors ── */}
                      {interviewType === 'coding' ? (
                        topicViewMode === 'bundles' ? (
                          <TopicBundleSelector
                            type="coding"
                            selected={codingCategories}
                            onChange={setCodingCategories}
                          />
                        ) : (
                          <DynamicTopicGrid
                            topics={[...CODING_CATEGORIES]}
                            selected={codingCategories}
                            onChange={setCodingCategories}
                          />
                        )
                      ) : interviewType === 'behavioral' ? (
                        topicViewMode === 'bundles' ? (
                          <TopicBundleSelector
                            type="behavioral"
                            selected={behavioralCompetencies}
                            onChange={setBehavioralCompetencies}
                          />
                        ) : (
                          <DynamicTopicGrid
                            topics={[...BEHAVIORAL_COMPETENCIES]}
                            selected={behavioralCompetencies}
                            onChange={setBehavioralCompetencies}
                          />
                        )
                      ) : interviewType === 'hr' ? (
                        topicViewMode === 'bundles' ? (
                          <TopicBundleSelector
                            type="hr"
                            selected={hrSections}
                            onChange={setHrSections}
                          />
                        ) : (
                          <DynamicTopicGrid
                            topics={[...HR_SECTION_KEYS]}
                            selected={hrSections}
                            onChange={setHrSections}
                            labelFn={hrSectionLabel}
                          />
                        )
                      ) : interviewType === 'system_design' ? (
                        topicViewMode === 'bundles' ? (
                          <TopicBundleSelector
                            type="system_design"
                            selected={systemDesignTopics}
                            onChange={setSystemDesignTopics}
                          />
                        ) : (
                          <DynamicTopicGrid
                            topics={[...SYSTEM_DESIGN_TOPICS]}
                            selected={systemDesignTopics}
                            onChange={setSystemDesignTopics}
                          />
                        )
                      ) : interviewType === 'mixed' || interviewType === 'both' ? (
                        /* Mixed mode: weight sliders + selectors per section */
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">
                            Set weights to sum to 100, then pick topics for each section.
                          </p>
                          {(
                            [
                              ['coding', 'Coding'],
                              ['behavioral', 'Behavioral'],
                              ['hr', 'Screening HR'],
                              ['system_design', 'System Design'],
                            ] as const
                          ).map(([kind, sectionLabel]) => {
                            const weight = mixWeights[kind] ?? 0
                            return (
                              <div key={kind} className="rounded-lg border border-border p-3 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold text-foreground">{sectionLabel}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5 rounded-lg border border-border bg-input/20 p-0.5">
                                      {(['bundles', 'individual'] as const).map((mode) => (
                                        <button
                                          key={mode}
                                          type="button"
                                          onClick={() => setTopicViewMode(mode)}
                                          className={[
                                            'inline-flex h-5 items-center rounded-md px-2 text-[10px] font-semibold transition-colors',
                                            topicViewMode === mode
                                              ? 'bg-primary text-primary-foreground shadow-sm'
                                              : 'text-muted-foreground hover:text-foreground',
                                          ].join(' ')}
                                        >
                                          {mode === 'bundles' ? 'Bundles' : 'Individual'}
                                        </button>
                                      ))}
                                    </div>
                                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                                      Weight %
                                      <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={weight}
                                        onChange={(e) =>
                                          setMixWeights((prev) => ({
                                            ...prev,
                                            [kind]: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                                          }))
                                        }
                                        className="h-7 w-14 rounded-md border border-border bg-input/30 px-2 text-xs"
                                      />
                                    </label>
                                  </div>
                                </div>
                                {weight > 0 ? (
                                  topicViewMode === 'bundles' ? (
                                    <TopicBundleSelector
                                      type={kind === 'hr' ? 'hr' : kind === 'coding' ? 'coding' : kind === 'behavioral' ? 'behavioral' : 'system_design'}
                                      selected={mixSelections[kind] ?? []}
                                      onChange={(next) =>
                                        setMixSelections((prev) => ({ ...prev, [kind]: next }))
                                      }
                                    />
                                  ) : (
                                    <DynamicTopicGrid
                                      topics={
                                        kind === 'coding' ? [...CODING_CATEGORIES]
                                        : kind === 'behavioral' ? [...BEHAVIORAL_COMPETENCIES]
                                        : kind === 'hr' ? [...HR_SECTION_KEYS]
                                        : [...SYSTEM_DESIGN_TOPICS]
                                      }
                                      selected={mixSelections[kind] ?? []}
                                      onChange={(next) =>
                                        setMixSelections((prev) => ({ ...prev, [kind]: next }))
                                      }
                                      labelFn={kind === 'hr' ? hrSectionLabel : undefined}
                                    />
                                  )
                                ) : null}
                              </div>
                            )
                          })}
                          <p className="text-xs text-muted-foreground">
                            Total weight:{' '}
                            <span className={
                              (Object.values(mixWeights) as number[]).reduce((a, b) => a + (b || 0), 0) === 100
                                ? 'text-emerald-400 font-semibold'
                                : 'text-amber-400 font-semibold'
                            }>
                              {(Object.values(mixWeights) as number[]).reduce((a, b) => a + (b || 0), 0)}%
                            </span>
                            {' '}(must equal 100)
                          </p>
                        </div>
                      ) : selectedSpecializations.length > 0 && interviewType ? (
                        /* Technical catalog type — always individual cards */
                        <DynamicTopicGrid
                          topics={technicalTopicOptions}
                          selected={topics}
                          onChange={setTopics}
                        />
                      ) : (
                        <div className="rounded-lg border border-border bg-input/20 p-3 text-sm text-muted-foreground">
                          {needsCatalog
                            ? 'Choose at least one specialization first.'
                            : 'Select an interview type first.'}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {wizardStep === 'difficulty' ? (
                    <div className="space-y-3">
                      <div className="text-sm font-semibold text-foreground">Difficulty</div>
                      {stepStates.topicsDone ? (
                        <DifficultySelector
                          value={difficulty}
                          onChange={(next) => {
                            setDifficulty(next)
                            setPastDifficulty(true)
                          }}
                        />
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
                          {QUESTION_COUNT_PRESETS.map((preset) => (
                            <SelectCard
                              key={preset.value}
                              title={preset.title}
                              subtitle={preset.subtitle}
                              selected={totalQuestions === preset.value}
                              onClick={() => setTotalQuestions(preset.value)}
                            />
                          ))}
                        </div>
                        {interviewType === 'mixed' || interviewType === 'both' ? (
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
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {durationOptions.map((opt) => (
                            <SelectCard
                              key={opt}
                              title={`${opt} min`}
                              selected={duration === opt.toString()}
                              onClick={() => setDuration(opt.toString())}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-input/20 p-4 sm:p-5">
                        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70">Review</div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {reviewRows.map((row) => (
                            <Fragment key={row.label}>
                              <div className="text-sm text-muted-foreground">{row.label}</div>
                              <div className="text-sm font-semibold text-foreground">{row.value}</div>
                            </Fragment>
                          ))}
                        </div>
                      </div>

                      <StartInterviewButton
                        canStart={canCreateInterview}
                        isCreating={isCreatingInterview}
                        isSaving={isSavingDraft}
                        onSaveDraft={saveDraft}
                        onStart={createInterview}
                        interviewType={interviewType}
                        topicCount={selectionCount}
                      />
                    </>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={goBack}
                disabled={wizardStep === 'interviewType'}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-input/20 px-4 text-sm font-semibold text-foreground hover:bg-input/40 btn-micro disabled:opacity-50 sm:h-10 sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>

              {wizardStep !== 'generate' ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinueFromStep || isCreatingInterview}
                  className="hq-btn-primary h-11 w-full px-5 text-sm disabled:pointer-events-none disabled:opacity-45 sm:h-10 sm:w-auto"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <div className="text-center text-xs text-muted-foreground sm:text-right">
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
                {reviewRows.map((row) => (
                  <div
                    key={row.label}
                    className="flex flex-col gap-0.5 border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  >
                    <dt className="text-xs text-muted-foreground">{row.label}</dt>
                    <dd className="break-words font-medium text-foreground">
                      {row.label === 'Difficulty' && difficulty ? (
                        <span
                          className={[
                            'inline-flex rounded-md px-2 py-0.5 text-xs font-bold',
                            difficulty === 'Easy'
                              ? 'bg-success-muted text-success'
                              : difficulty === 'Medium'
                                ? 'bg-warning-muted text-warning'
                                : difficulty === 'Hard'
                                  ? 'bg-destructive-muted text-destructive'
                                  : 'bg-primary/15 text-primary',
                          ].join(' ')}
                        >
                          {row.value}
                        </span>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
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
                  <span className="text-right font-medium">{summaryQuestionsPreview}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Mode</span>
                  <span className="text-right font-medium">
                    {interviewType ? formatInterviewTypeLabel(interviewType) : '—'}
                  </span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">{summarySelectionLabel}</span>
                  <span className="text-right font-medium">{summarySelectionPreview}</span>
                </li>
                <li className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="text-right font-medium">
                    {duration ? `${duration} min` : '—'}
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
                {needsCatalog ? (
                  <li>Use Select all to practice across every department, specialization, or topic quickly.</li>
                ) : (
                  <li>Pick categories, competencies, or sections that match the round you are preparing for.</li>
                )}
                <li>Pick interview type first — the next steps adapt to that format.</li>
                <li>Choose a duration so the session timer matches your practice goal.</li>
                <li>You can save a draft locally before generating questions.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
