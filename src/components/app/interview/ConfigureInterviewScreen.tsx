'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, AlertTriangle, Sparkles } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { StyledSelect } from '@/components/ui/styled-select'
import { useToast } from '@/components/ui/toast'
import {
  InterviewTypeSelector,
  type InterviewType,
} from '@/components/app/InterviewTypeSelector'
import { ChipMultiSelect } from '@/components/app/ChipMultiSelect'
import {
  CODING_CATEGORIES,
  BEHAVIORAL_COMPETENCIES,
  HR_SECTIONS,
  SYSTEM_DESIGN_TOPICS,
} from '@/lib/interview-config/type-config'
import type { InterviewSetupConfig } from '@/lib/interview-config/setup-types'
import { validateInterviewSetupForGenerate } from '@/lib/interview-config/setup-types'
import { CODING_CATEGORY_SET } from '@/lib/interview-config/banks/coding-categories'
import { BEHAVIORAL_COMPETENCY_SET } from '@/lib/interview-config/banks/behavioral-competencies'
import { SYSTEM_DESIGN_TOPIC_SET } from '@/lib/interview-config/banks/system-design-topics'
import { SENIORITY_UI_OPTIONS } from '@/lib/interview-config/experience'
import { DIFFICULTY_UI_OPTIONS } from '@/lib/interview-config/difficulty'

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
    <span className="inline-flex items-center gap-1 rounded-full bg-warning-muted px-2 py-0.5 text-[10px] font-medium text-warning">
      <AlertTriangle className="h-3 w-3" /> Missing — Please Fill
    </span>
  )
}

function suggestFromSkills(skills: string[], bank: Set<string>): string[] {
  const out: string[] = []
  for (const skill of skills) {
    const s = skill.trim()
    if (bank.has(s)) out.push(s)
    else {
      for (const item of bank) {
        if (item.toLowerCase() === s.toLowerCase()) out.push(item)
      }
    }
  }
  return [...new Set(out)]
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
  const [creating, setCreating] = useState(false)
  const [showErrors, setShowErrors] = useState(false)
  const [filter, setFilter] = useState('')

  const issues = useMemo(() => validateInterviewSetupForGenerate(config), [config])
  const canGenerate = issues.length === 0
  const interviewType = (config.interviewType ?? null) as InterviewType | null

  const fromResume = (field: string) =>
    (config.resumeParsedFields || []).includes(field) &&
    !(config.manuallyFilledFields || []).includes(field)

  const patch = <K extends keyof InterviewSetupConfig>(key: K, value: InterviewSetupConfig[K]) => {
    setConfig((prev) => ({
      ...prev,
      [key]: value,
      manuallyFilledFields: [...new Set([...(prev.manuallyFilledFields || []), String(key)])],
    }))
  }

  const handleInterviewTypeChange = (next: InterviewType) => {
    const skills = config.extractedSkills || []
    const codingSuggest = suggestFromSkills(skills, CODING_CATEGORY_SET)
    const behSuggest = suggestFromSkills(skills, BEHAVIORAL_COMPETENCY_SET)
    const sdSuggest = suggestFromSkills(skills, SYSTEM_DESIGN_TOPIC_SET)

    setConfig((prev) => ({
      ...prev,
      interviewType: next === 'both' ? 'mixed' : next,
      preferredQuestionFormat: next === 'coding' ? 'coding' : null,
      codingCategories: next === 'coding' ? codingSuggest : prev.codingCategories,
      behavioralCompetencies: next === 'behavioral' ? behSuggest : prev.behavioralCompetencies,
      systemDesignTopics: next === 'system_design' ? sdSuggest : prev.systemDesignTopics,
      topics:
        next === 'coding'
          ? codingSuggest
          : next === 'behavioral'
            ? behSuggest
            : next === 'system_design'
              ? sdSuggest
              : prev.topics,
      categories: next === 'hr' ? ['hr'] : prev.categories,
      manuallyFilledFields: [
        ...new Set([...(prev.manuallyFilledFields || []), 'interviewType', 'preferredQuestionFormat']),
      ],
    }))
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
      if (!res.ok) throw new Error(data.message || 'Failed to generate interview')
      toast.success(
        data.source === 'gemini'
          ? 'Interview ready — questions from your confirmed selections'
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
            Resume only prefills. Confirm type and selections before generate.
          </p>
        </div>
      </div>

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
                patch('yearsExperience', e.target.value === '' ? null : Number(e.target.value))
              }
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
          </label>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Seniority</span>
              <FieldBadge fromResume={fromResume('seniorityLevel')} />
            </div>
            <StyledSelect
              value={config.seniorityLevel || ''}
              onChange={(value) =>
                patch(
                  'seniorityLevel',
                  (value || null) as InterviewSetupConfig['seniorityLevel'],
                )
              }
              options={SENIORITY_UI_OPTIONS.map((opt) => ({
                value: opt.key,
                label: opt.label,
              }))}
              placeholder="Select seniority"
              allowEmpty
              ariaLabel="Seniority"
              className="h-10"
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Skills (from resume)</span>
              <FieldBadge fromResume={fromResume('extractedSkills')} />
            </div>
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-input/10 p-3">
              {(config.extractedSkills || []).length ? (
                config.extractedSkills.map((s) => (
                  <span key={s} className="rounded-full border border-border px-2 py-0.5 text-[11px]">
                    {s}
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No skills extracted</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          2 · Interview type
        </h2>
        <InterviewTypeSelector value={interviewType} onChange={handleInterviewTypeChange} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          3 · Selections for this type
        </h2>
        {!interviewType ? (
          <div className="rounded-2xl border border-border bg-input/20 p-4 text-sm text-muted-foreground">
            Choose an interview type first.
          </div>
        ) : (
          <>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter…"
              className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
            />
            {interviewType === 'coding' ? (
              <ChipMultiSelect
                options={[...CODING_CATEGORIES]}
                selected={config.codingCategories ?? []}
                onChange={(next) => {
                  patch('codingCategories', next)
                  patch('topics', next)
                  patch('categories', ['coding'])
                }}
                search={filter}
              />
            ) : interviewType === 'behavioral' ? (
              <ChipMultiSelect
                options={[...BEHAVIORAL_COMPETENCIES]}
                selected={config.behavioralCompetencies ?? []}
                onChange={(next) => {
                  patch('behavioralCompetencies', next)
                  patch('topics', next)
                  patch('categories', ['behavioral'])
                }}
                search={filter}
              />
            ) : interviewType === 'hr' ? (
              <ChipMultiSelect
                options={HR_SECTIONS.map((s) => ({ key: s.key, label: s.label }))}
                selected={config.hrSections ?? []}
                onChange={(next) => {
                  patch('hrSections', next)
                  patch('categories', ['hr'])
                }}
                search={filter}
              />
            ) : interviewType === 'system_design' ? (
              <ChipMultiSelect
                options={[...SYSTEM_DESIGN_TOPICS]}
                selected={config.systemDesignTopics ?? []}
                onChange={(next) => {
                  patch('systemDesignTopics', next)
                  patch('topics', next)
                  patch('categories', ['system_design'])
                }}
                search={filter}
              />
            ) : (
              <ChipMultiSelect
                options={[...SYSTEM_DESIGN_TOPICS, ...CODING_CATEGORIES]}
                selected={config.topics}
                onChange={(next) => {
                  patch('topics', next)
                  patch('categories', ['technical'])
                }}
                search={filter}
              />
            )}
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          4 · Interview parameters
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Difficulty</span>
            <StyledSelect
              value={config.difficulty || ''}
              onChange={(value) =>
                patch('difficulty', (value || null) as InterviewSetupConfig['difficulty'])
              }
              options={DIFFICULTY_UI_OPTIONS.map((opt) => ({
                value: opt.key,
                label: opt.label,
                description: opt.subtitle,
              }))}
              placeholder="Select difficulty"
              allowEmpty
              ariaLabel="Difficulty"
              className="h-10"
            />
          </div>
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
        className="hq-btn-primary inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl px-6 text-sm font-semibold disabled:opacity-50 sm:w-auto"
      >
        <Sparkles className="h-4 w-4" />
        Generate Interview
      </LoadingButton>
    </div>
  )
}
