'use client'

import { useEffect, useMemo, useState } from 'react'
import type { RoleCategoryConfig } from '@/lib/interview-config'
import { Input } from '@/components/ui/input'
import { SelectionChip } from '@/components/ui/selection-chip'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import { Pencil, Plus, Trash2 } from 'lucide-react'

type InterviewConfigDto = {
  _id: string
  industryKey: string
  industryLabel: string
  roleCategories: RoleCategoryConfig[]
  isActive: boolean
}

type EditableConfig = {
  industryKey: string
  industryLabel: string
  roleCategories: RoleCategoryConfig[]
  isActive: boolean
}

const emptyConfig: EditableConfig = {
  industryKey: '',
  industryLabel: '',
  roleCategories: [],
  isActive: true,
}

const emptyRoleCategory: RoleCategoryConfig = {
  key: '',
  label: '',
  interviewTypes: ['Technical', 'Behavioral'],
  technicalTopics: [],
  behavioralTopics: [],
  technicalQuestionRatio: 70,
  durationEnabled: true,
  durations: [20, 30, 45],
}

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string[]
  onChange: (nextValue: string[]) => void
  placeholder: string
}) {
  const [draft, setDraft] = useState('')
  const safeValue = Array.isArray(value) ? value : []

  const pushDraft = () => {
    const next = draft.trim()
    if (!next) {
      return
    }
    if (!safeValue.includes(next)) {
      onChange([...safeValue, next])
    }
    setDraft('')
  }

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="rounded-lg border border-border bg-surface p-2">
        <div className="mb-2 flex flex-wrap gap-2">
          {safeValue.map((item) => (
            <SelectionChip
              key={item}
              onClick={() => onChange(safeValue.filter((entry) => entry !== item))}
              active
            >
              <span>{item}</span>
              <span className="text-foreground/70">×</span>
            </SelectionChip>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                pushDraft()
              }
            }}
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={pushDraft}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-strong hover:shadow-glow-sm"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

export function TrackConfigManager() {
  const sanitizeRoleCategory = (category: Partial<RoleCategoryConfig>): RoleCategoryConfig => ({
    key: category.key ?? '',
    label: category.label ?? '',
    interviewTypes:
      Array.isArray(category.interviewTypes) && category.interviewTypes.length > 0
        ? category.interviewTypes
        : ['Technical', 'Behavioral'],
    technicalTopics: Array.isArray(category.technicalTopics) ? category.technicalTopics : [],
    behavioralTopics: Array.isArray(category.behavioralTopics)
      ? category.behavioralTopics
      : [],
    technicalQuestionRatio:
      typeof category.technicalQuestionRatio === 'number'
        ? category.technicalQuestionRatio
        : 70,
    durationEnabled:
      typeof category.durationEnabled === 'boolean' ? category.durationEnabled : true,
    durations: Array.isArray(category.durations) ? category.durations : [20, 30, 45],
  })

  const [configs, setConfigs] = useState<InterviewConfigDto[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editorState, setEditorState] = useState<EditableConfig>(emptyConfig)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [configDeleteOpen, setConfigDeleteOpen] = useState(false)
  const [pendingRoleRemoveIndex, setPendingRoleRemoveIndex] = useState<number | null>(null)

  const toast = useToast()

  const selectedConfig = useMemo(
    () => configs.find((config) => config._id === selectedId) ?? null,
    [configs, selectedId],
  )

  useEffect(() => {
    async function loadConfigs() {
      setIsLoading(true)
      setError('')
      try {
        const response = await fetch('/api/admin/interview-config')
        const data = await response.json()
        if (!response.ok) {
          setError(data.message ?? 'Failed to load configs')
          return
        }

        const nextConfigs = (data.configs ?? []) as InterviewConfigDto[]
        setConfigs(nextConfigs)
        if (nextConfigs.length > 0) {
          const first = nextConfigs[0]
          setSelectedId(first._id)
          setEditorState({
            industryKey: first.industryKey,
            industryLabel: first.industryLabel,
            roleCategories: (first.roleCategories ?? []).map(sanitizeRoleCategory),
            isActive: Boolean(first.isActive),
          })
        }
      } catch {
        setError('Failed to load configs')
      } finally {
        setIsLoading(false)
      }
    }

    void loadConfigs()
  }, [])

  const selectConfig = (config: InterviewConfigDto) => {
    setIsCreating(false)
    setSelectedId(config._id)
    setEditorState({
      industryKey: config.industryKey,
      industryLabel: config.industryLabel,
      roleCategories: (config.roleCategories ?? []).map(sanitizeRoleCategory),
      isActive: Boolean(config.isActive),
    })
    setError('')
    setMessage('')
  }

  const startCreate = () => {
    setIsCreating(true)
    setSelectedId(null)
    setEditorState(emptyConfig)
    setError('')
    setMessage('')
  }

  const updateRoleCategory = (roleCategoryIndex: number, updates: Partial<RoleCategoryConfig>) => {
    setEditorState((previous) => ({
      ...previous,
      roleCategories: previous.roleCategories.map((category, index) =>
        index === roleCategoryIndex ? { ...category, ...updates } : category,
      ),
    }))
  }

  const addRoleCategory = () => {
    setEditorState((previous) => ({
      ...previous,
      roleCategories: [
        ...previous.roleCategories,
        { ...emptyRoleCategory },
      ],
    }))
  }

  const removeRoleCategory = (roleCategoryIndex: number) => {
    setEditorState((previous) => ({
      ...previous,
      roleCategories: previous.roleCategories.filter(
        (_item, index) => index !== roleCategoryIndex,
      ),
    }))
  }

  const saveConfig = async () => {
    setError('')
    setMessage('')
    setIsSaving(true)

    try {
      const payload: EditableConfig = {
        ...editorState,
        industryKey: '',
      }

      const isUpdate = !isCreating && Boolean(selectedId)
      const endpoint = isUpdate
        ? `/api/admin/interview-config/${selectedId}`
        : '/api/admin/interview-config'
      const method = isUpdate ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) {
        const msg = data.message ?? 'Failed to save config'
        setError(msg)
        toast.error(msg)
        return
      }

      const savedConfig = data.config as InterviewConfigDto

      setConfigs((previous) => {
        if (isUpdate) {
          return previous.map((item) =>
            item._id === savedConfig._id ? savedConfig : item,
          )
        }
        return [...previous, savedConfig]
      })

      setIsCreating(false)
      setSelectedId(savedConfig._id)
      setEditorState({
        industryKey: savedConfig.industryKey,
        industryLabel: savedConfig.industryLabel,
        roleCategories: (savedConfig.roleCategories ?? []).map(sanitizeRoleCategory),
        isActive: Boolean(savedConfig.isActive),
      })
      setMessage('Config saved successfully')
      toast.success('Config saved')
    } catch {
      setError('Failed to save config')
      toast.error('Failed to save config')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteConfigConfirmed = async () => {
    if (!selectedId || isCreating) {
      return
    }

    setError('')
    setMessage('')
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/interview-config/${selectedId}`, {
        method: 'DELETE',
      })
      const data = await response.json()

      if (!response.ok) {
        const msg = data.message ?? 'Failed to delete config'
        setError(msg)
        toast.error(msg)
        return
      }

      const remaining = configs.filter((config) => config._id !== selectedId)
      setConfigs(remaining)
      if (remaining.length > 0) {
        selectConfig(remaining[0])
      } else {
        startCreate()
      }
      setMessage('Config deleted successfully')
      toast.success('Interview config deleted')
      setConfigDeleteOpen(false)
    } catch {
      setError('Failed to delete config')
      toast.error('Failed to delete config')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-180px)] grid-cols-[240px,1fr] lg:grid-cols-[260px,1fr]">
      <aside className="border-r border-border bg-surface p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Industries
          </div>
          <button
            type="button"
            onClick={startCreate}
            title="Create new industry config"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-strong hover:shadow-glow-sm"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> Add
          </button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-2">
            {configs.map((config) => (
              <button
                key={config._id}
                type="button"
                onClick={() => selectConfig(config)}
                className={[
                  'w-full rounded-xl border px-3 py-2 text-left text-sm transition-all duration-200 ease-out transform-gpu',
                  selectedConfig?._id === config._id
                    ? 'border-primary/60 bg-primary/10 text-foreground shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_30%,transparent)]'
                    : 'border-transparent bg-surface text-muted-foreground hover:-translate-y-0.5 hover:border-primary/25 hover:bg-surface-strong hover:text-foreground hover:shadow-glow-sm',
                ].join(' ')}
              >
                {config.industryLabel}
              </button>
            ))}
          </div>
        )}
      </aside>

      <section className="p-6 lg:p-8 overflow-y-auto">
        <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold text-foreground">
          {isCreating ? (
            <>
              <Plus className="h-6 w-6 text-primary" aria-hidden />
              <span>Create</span> <span className="text-gradient">Config</span>
            </>
          ) : (
            <>
              <Pencil className="h-6 w-6 text-muted-foreground" aria-hidden />
              <span>Edit Config</span>{' '}
              {editorState.industryLabel ? <span className="text-gradient">— {editorState.industryLabel}</span> : null}
            </>
          )}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage industry categories, topics, and interview behavior ratios.
        </p>

        <div className="mt-6 grid gap-4">
          <label className="space-y-1.5">
            <span className="text-xs text-muted-foreground">Industry Label</span>
            <Input
              value={editorState.industryLabel}
              onChange={(event) =>
                setEditorState((previous) => ({
                  ...previous,
                  industryLabel: event.target.value,
                }))
              }
              placeholder="Software / IT"
            />
          </label>
        </div>

        <label className="mt-4 inline-flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={editorState.isActive}
            onChange={(event) =>
              setEditorState((previous) => ({
                ...previous,
                isActive: event.target.checked,
              }))
            }
            className="h-4 w-4 accent-primary"
          />
          Active configuration
        </label>

        <label className="mt-5 block space-y-1.5">
          <span className="text-xs text-muted-foreground">Role Categories</span>
          <div className="space-y-3">
            {editorState.roleCategories.map((roleCategory, roleCategoryIndex) => (
              <div
                key={`${roleCategory.key || 'role'}-${roleCategoryIndex}`}
                className="dashboard-card p-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[11px] text-muted-foreground">
                      Role Category Label
                    </span>
                    <Input
                      value={roleCategory.label}
                      onChange={(event) =>
                        updateRoleCategory(roleCategoryIndex, { label: event.target.value })
                      }
                      placeholder="Engineering"
                    />
                  </label>
                  <TagInput
                    label="Interview Types"
                    value={roleCategory.interviewTypes}
                    onChange={(next) =>
                      updateRoleCategory(roleCategoryIndex, { interviewTypes: next })
                    }
                    placeholder="Technical"
                  />
                  <TagInput
                    label="Technical Topics"
                    value={roleCategory.technicalTopics}
                    onChange={(next) =>
                      updateRoleCategory(roleCategoryIndex, { technicalTopics: next })
                    }
                    placeholder="System Design"
                  />
                  <TagInput
                    label="Behavioral Topics"
                    value={roleCategory.behavioralTopics}
                    onChange={(next) =>
                      updateRoleCategory(roleCategoryIndex, { behavioralTopics: next })
                    }
                    placeholder="Leadership"
                  />

                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[11px] text-muted-foreground">
                      Technical Question Ratio ({roleCategory.technicalQuestionRatio}%)
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={roleCategory.technicalQuestionRatio}
                      onChange={(event) =>
                        updateRoleCategory(roleCategoryIndex, {
                          technicalQuestionRatio: Number(event.target.value),
                        })
                      }
                      className="w-full accent-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Behavioral ratio: {100 - roleCategory.technicalQuestionRatio}%
                    </p>
                  </label>

                  <label className="inline-flex items-center gap-2 text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={roleCategory.durationEnabled}
                      onChange={(event) =>
                        updateRoleCategory(roleCategoryIndex, {
                          durationEnabled: event.target.checked,
                          durations: event.target.checked ? roleCategory.durations : [],
                        })
                      }
                      className="h-4 w-4 accent-primary"
                    />
                    Duration enabled
                  </label>

                  {roleCategory.durationEnabled ? (
                    <TagInput
                      label="Durations (minutes)"
                      value={roleCategory.durations.map((item) => `${item}`)}
                      onChange={(next) =>
                        updateRoleCategory(roleCategoryIndex, {
                          durations: next
                            .map((item) => Number(item))
                            .filter((item) => Number.isInteger(item) && item > 0),
                        })
                      }
                      placeholder="30"
                    />
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setPendingRoleRemoveIndex(roleCategoryIndex)}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-red-500/35 hover:bg-red-500/10 hover:text-red-200 hover:shadow-glow-sm"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addRoleCategory}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-strong hover:shadow-glow-sm"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden /> Add Role Category
            </button>
          </div>
        </label>

        {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        {message ? <p className="mt-3 text-sm text-emerald-400">{message}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <LoadingButton
            type="button"
            onClick={saveConfig}
            loading={isSaving}
            loadingLabel="Saving..."
            className="h-10 rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-white shadow-glow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-glow"
          >
            Save config
          </LoadingButton>

          {!isCreating ? (
            <button
              type="button"
              onClick={() => setConfigDeleteOpen(true)}
              disabled={isDeleting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-5 text-sm font-semibold text-red-200 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-red-500/20 hover:shadow-glow-sm disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete config
            </button>
          ) : null}
        </div>
      </section>

      <ConfirmModal
        open={configDeleteOpen}
        onOpenChange={setConfigDeleteOpen}
        title="Delete interview config?"
        description="This action cannot be undone. All role categories and topics for this industry will be removed from the database."
        confirmLabel="Confirm Delete"
        confirmVariant="danger"
        disabled={isDeleting}
        onConfirm={deleteConfigConfirmed}
      />

      <ConfirmModal
        open={pendingRoleRemoveIndex !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRoleRemoveIndex(null)
        }}
        title="Remove role category?"
        description="This section will be removed from the editor. Save the config to persist changes."
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={async () => {
          if (pendingRoleRemoveIndex === null) return
          removeRoleCategory(pendingRoleRemoveIndex)
          setPendingRoleRemoveIndex(null)
        }}
      />
    </div>
  )
}
