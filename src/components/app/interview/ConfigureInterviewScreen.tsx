'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Search,
  Sparkles,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import {
  categoriesForTrack,
  type TaxonomyTrack,
} from '@/lib/interview-taxonomy/taxonomy'
import type { InterviewSetupConfig } from '@/lib/interview-config/setup-types'
import { validateInterviewSetupForGenerate } from '@/lib/interview-config/setup-types'

type ConfigureInterviewScreenProps = {
  initial: InterviewSetupConfig
  pathId?: string | null
  stageId?: string | null
  pathRemediationId?: string | null
  onBack: () => void
}

function FieldBadge({ fromResume }: { fromResume: boolean }) {
  return fromResume ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--hq-green)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--hq-green)]">
      <Check className="h-3 w-3" /> From Resume
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" /> Missing — Please Fill
    </span>
  )
}

export function ConfigureInterviewScreen({
  initial,
  pathId,
  stageId,
  pathRemediationId,
  onBack,
}: ConfigureInterviewScreenProps) {
  const router = useRouter()
  const toast = useToast()
  const [config, setConfig] = useState<InterviewSetupConfig>(initial)
  const [topicSearch, setTopicSearch] = useState('')
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})
  const [creating, setCreating] = useState(false)
  const [showErrors, setShowErrors] = useState(false)

  const issues = useMemo(() => validateInterviewSetupForGenerate(config), [config])
  const canGenerate = issues.length === 0

  const fromResume = (field: string) =>
    (config.resumeParsedFields || []).includes(field) &&
    !(config.manuallyFilledFields || []).includes(field)

  const markManual = (field: string) => {
    setConfig((prev) => ({
      ...prev,
      manuallyFilledFields: [...new Set([...(prev.manuallyFilledFields || []), field])],
    }))
  }

  const patch = <K extends keyof InterviewSetupConfig>(key: K, value: InterviewSetupConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
    markManual(String(key))
  }

  const pathLocked = Boolean(pathId && stageId)
  const lockedTopics = useMemo(
    () => (pathLocked ? [...(initial.topics || [])] : []),
    [pathLocked, initial.topics],
  )

  const toggleTopic = (topic: string, categoryKey: string) => {
    if (pathLocked && lockedTopics.length > 0) {
      // Path stage topics are fixed; only allow selecting within the stage set (no free add).
      if (!lockedTopics.includes(topic)) {
        toast.error('Path stage topics are locked for this interview')
        return
      }
    }
    setConfig((prev) => {
      const has = prev.topics.includes(topic)
      const topics = has ? prev.topics.filter((t) => t !== topic) : [...prev.topics, topic]
      let categories = prev.categories
      if (!has && !categories.includes(categoryKey)) {
        categories = [...categories, categoryKey]
      }
      if (has) {
        const cat = categoriesForTrack('technical')
          .concat(categoriesForTrack('non_technical'))
          .find((c) => c.key === categoryKey)
        if (cat && !cat.topics.some((t) => topics.includes(t))) {
          categories = categories.filter((k) => k !== categoryKey)
        }
      }
      return {
        ...prev,
        topics,
        categories,
        manuallyFilledFields: [...new Set([...(prev.manuallyFilledFields || []), 'topics', 'categories'])],
      }
    })
  }

  const selectAllInCategory = (categoryKey: string, topics: string[], on: boolean) => {
    setConfig((prev) => {
      let nextTopics = prev.topics.filter((t) => !topics.includes(t))
      let categories = prev.categories.filter((k) => k !== categoryKey)
      if (on) {
        nextTopics = [...new Set([...nextTopics, ...topics])]
        categories = [...categories, categoryKey]
      }
      return {
        ...prev,
        topics: nextTopics,
        categories,
        manuallyFilledFields: [...new Set([...(prev.manuallyFilledFields || []), 'topics', 'categories'])],
      }
    })
  }

  const renderTrack = (track: TaxonomyTrack, title: string) => {
    const cats = categoriesForTrack(track)
    const q = topicSearch.trim().toLowerCase()
    return (
      <div className="space-y-3 rounded-2xl border border-border bg-input/10 p-4">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <div className="space-y-2">
          {cats.map((cat) => {
            const topics = q
              ? cat.topics.filter((t) => t.toLowerCase().includes(q))
              : cat.topics
            if (q && topics.length === 0) return null
            const open = openCats[cat.key] ?? topics.some((t) => config.topics.includes(t))
            const selectedCount = cat.topics.filter((t) => config.topics.includes(t)).length
            return (
              <div key={cat.key} className="rounded-xl border border-border/70 bg-background/40">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm"
                  onClick={() => setOpenCats((p) => ({ ...p, [cat.key]: !open }))}
                >
                  <span className="font-medium text-foreground">
                    {cat.label}
                    {selectedCount > 0 ? (
                      <span className="ml-2 text-xs text-primary">({selectedCount})</span>
                    ) : null}
                  </span>
                  {open ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                <AnimatePresence initial={false}>
                  {open ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t border-border/60 px-3 pb-3"
                    >
                      <div className="flex flex-wrap gap-2 py-2">
                        <button
                          type="button"
                          className="text-[11px] text-primary underline-offset-2 hover:underline"
                          onClick={() => selectAllInCategory(cat.key, cat.topics, true)}
                        >
                          Select all
                        </button>
                        <button
                          type="button"
                          className="text-[11px] text-muted-foreground underline-offset-2 hover:underline"
                          onClick={() => selectAllInCategory(cat.key, cat.topics, false)}
                        >
                          Deselect all
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {topics.map((t) => {
                          const on = config.topics.includes(t)
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => toggleTopic(t, cat.key)}
                              className={[
                                'rounded-full border px-2.5 py-1 text-[11px] transition',
                                on
                                  ? 'border-primary bg-primary/15 text-primary'
                                  : 'border-border text-muted-foreground hover:bg-input/40',
                              ].join(' ')}
                            >
                              {t}
                            </button>
                          )
                        })}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const generate = async () => {
    setShowErrors(true)
    if (!canGenerate) {
      toast.error(issues[0]?.message || 'Complete required fields')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/interviews/from-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          setup: config,
          learningPathId: pathId || null,
          learningStageId: stageId || null,
          pathRemediationId: pathRemediationId || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || 'Failed to generate interview')
      }
      toast.success(
        data.source === 'gemini'
          ? 'Interview ready — questions from your confirmed topics'
          : 'Interview created',
      )
      router.push(`/app/interviews/${data.sessionId}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not generate interview')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs text-muted-foreground hover:bg-input/30"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Configure Your Interview</h1>
          <p className="text-xs text-muted-foreground">
            {pathLocked
              ? 'Path stage topics are locked. Resume fields still only prefill — confirm before generate.'
              : 'Review resume details, pick topics, then generate. No questions until you confirm.'}
          </p>
        </div>
      </div>

      {/* Section 1 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          1 · Resume information
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Target / current role</span>
              <FieldBadge fromResume={fromResume('targetRole') || fromResume('domain')} />
            </div>
            <input
              value={config.targetRole || config.currentRole || ''}
              onChange={(e) => patch('targetRole', e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              placeholder="e.g. Full Stack Developer"
            />
          </label>
          <label className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Years experience</span>
              <FieldBadge fromResume={fromResume('yearsExperience')} />
            </div>
            <input
              type="number"
              min={0}
              max={60}
              value={config.yearsExperience ?? ''}
              onChange={(e) =>
                patch(
                  'yearsExperience',
                  e.target.value === '' ? null : Number(e.target.value),
                )
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
          <label className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Seniority</span>
              <FieldBadge fromResume={fromResume('seniorityLevel')} />
            </div>
            <select
              value={config.seniorityLevel || ''}
              onChange={(e) =>
                patch(
                  'seniorityLevel',
                  (e.target.value || null) as InterviewSetupConfig['seniorityLevel'],
                )
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            >
              <option value="">Select…</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid</option>
              <option value="senior">Senior</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Domain</span>
              <FieldBadge fromResume={fromResume('domain')} />
            </div>
            <input
              value={config.domain || ''}
              onChange={(e) => patch('domain', e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Education</span>
              <FieldBadge fromResume={fromResume('education') || fromResume('degree')} />
            </div>
            <input
              value={config.education || ''}
              onChange={(e) => patch('education', e.target.value)}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              placeholder="Degree @ University"
            />
          </label>
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Skills (from resume)</span>
              <FieldBadge fromResume={fromResume('extractedSkills')} />
            </div>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-input/10 p-3">
              {(config.extractedSkills || []).length ? (
                config.extractedSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-border px-2 py-0.5 text-[11px]"
                  >
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No skills extracted</span>
              )}
            </div>
          </div>
          {(config.projects || []).length > 0 ? (
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">Projects</span>
                <FieldBadge fromResume={fromResume('projects')} />
              </div>
              <ul className="space-y-2 text-sm">
                {config.projects.map((p) => (
                  <li
                    key={p.name}
                    className="rounded-xl border border-border bg-input/10 px-3 py-2"
                  >
                    <div className="font-medium">{p.name}</div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      {/* Section 2 */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            2 · Category & topic selection
          </h2>
          <p className="text-xs text-muted-foreground">
            {config.topics.length} topic{config.topics.length === 1 ? '' : 's'} selected
            {config.categories.length
              ? ` · ${config.categories.length} categor${config.categories.length === 1 ? 'y' : 'ies'}`
              : ''}
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            placeholder="Search topics…"
            className="h-10 w-full rounded-xl border border-border bg-input/30 pl-9 pr-3 text-sm"
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {renderTrack('technical', 'Technical')}
          {renderTrack('non_technical', 'Non-Technical')}
        </div>
      </section>

      {/* Section 3 */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          3 · Interview parameters
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Difficulty</span>
            <select
              value={config.difficulty || ''}
              onChange={(e) =>
                patch('difficulty', (e.target.value || null) as InterviewSetupConfig['difficulty'])
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            >
              <option value="">Select…</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
              <option value="Mixed">Mixed</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Interview round</span>
            <select
              value={config.interviewRoundType || ''}
              onChange={(e) =>
                patch(
                  'interviewRoundType',
                  (e.target.value || null) as InterviewSetupConfig['interviewRoundType'],
                )
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            >
              <option value="">Select…</option>
              <option value="technical_screen">Technical Screen</option>
              <option value="system_design">System Design</option>
              <option value="behavioral">Behavioral</option>
              <option value="managerial">Managerial</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Question format</span>
            <select
              value={config.preferredQuestionFormat || ''}
              onChange={(e) =>
                patch(
                  'preferredQuestionFormat',
                  (e.target.value || null) as InterviewSetupConfig['preferredQuestionFormat'],
                )
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            >
              <option value="">Optional…</option>
              <option value="coding">Coding</option>
              <option value="scenario">Scenario</option>
              <option value="whiteboard">Whiteboard</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Target company</span>
            <select
              value={config.targetCompanyType || ''}
              onChange={(e) =>
                patch(
                  'targetCompanyType',
                  (e.target.value || null) as InterviewSetupConfig['targetCompanyType'],
                )
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            >
              <option value="">Optional…</option>
              <option value="startup">Startup</option>
              <option value="mid_size">Mid-size</option>
              <option value="enterprise">Enterprise</option>
              <option value="faang">FAANG</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Duration (minutes)</span>
            <input
              type="number"
              min={10}
              max={180}
              value={config.interviewDuration ?? 30}
              onChange={(e) => patch('interviewDuration', Number(e.target.value) || 30)}
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Number of questions</span>
            <input
              type="number"
              min={3}
              max={40}
              value={config.numberOfQuestions ?? 12}
              onChange={(e) =>
                patch('numberOfQuestions', Math.max(3, Math.min(40, Number(e.target.value) || 12)))
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs text-muted-foreground">Focus areas (optional, comma-separated)</span>
            <input
              value={(config.focusAreas || []).join(', ')}
              onChange={(e) =>
                patch(
                  'focusAreas',
                  e.target.value
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
        </div>
      </section>

      {showErrors && issues.length > 0 ? (
        <ul className="space-y-1 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {issues.map((i) => (
            <li key={i.field + i.message}>• {i.message}</li>
          ))}
        </ul>
      ) : null}

      <LoadingButton
        type="button"
        loading={creating}
        loadingLabel="Generating…"
        disabled={!canGenerate && showErrors}
        onClick={() => void generate()}
        className="hq-btn-primary inline-flex h-12 items-center gap-2 rounded-2xl px-6 text-sm font-semibold disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" />
        Generate Interview
      </LoadingButton>
    </div>
  )
}
