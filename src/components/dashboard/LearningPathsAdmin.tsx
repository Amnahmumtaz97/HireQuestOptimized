'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Save, Route } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import type { LearningPath, LearningStage, StageType } from '@/components/app/learning-paths/types'
import type { DepartmentDto } from '@/lib/interview-catalog/admin'
import { PATH_CATEGORIES, PATH_CATEGORY_LABELS } from '@/lib/learning-paths/constants'
import { ListPagination } from '@/components/ui/list-pagination'

type StageDraft = LearningStage & { _key: string }

function emptyStage(pathId: string, order: number): StageDraft {
  return {
    _key: `new-${order}-${Date.now()}`,
    id: '',
    pathId,
    order,
    title: `Stage ${order}`,
    type: 'concept',
    contentRef: '',
    unlockMinScore: null,
    level: Math.min(6, order) as number,
    departmentKey: '',
    specializationKeys: [],
    interviewType: null,
    difficulty: null,
    suggestedTopics: [],
    totalQuestions: null,
    technicalQuestionRatio: null,
  }
}

export function LearningPathsAdmin() {
  const toast = useToast()
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audience, setAudience] = useState('beginner')
  const [category, setCategory] = useState<LearningPath['category']>('technology')
  const [subcategory, setSubcategory] = useState('')
  const [tagsText, setTagsText] = useState('')
  const [difficultyLabel, setDifficultyLabel] = useState('')
  const [estimatedMinutes, setEstimatedMinutes] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [slug, setSlug] = useState('')
  const [stages, setStages] = useState<StageDraft[]>([])
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [listPage, setListPage] = useState(1)
  const [stagesPage, setStagesPage] = useState(1)
  const LIST_PAGE_SIZE = 12
  const STAGES_PAGE_SIZE = 8

  const selected = useMemo(
    () => paths.find((p) => p.id === selectedId) ?? null,
    [paths, selectedId],
  )

  const listTotalPages = Math.max(1, Math.ceil(paths.length / LIST_PAGE_SIZE))
  const safeListPage = Math.min(Math.max(1, listPage), listTotalPages)
  const pagedPaths = useMemo(() => {
    const start = (safeListPage - 1) * LIST_PAGE_SIZE
    return paths.slice(start, start + LIST_PAGE_SIZE)
  }, [paths, safeListPage])

  const stagesTotalPages = Math.max(1, Math.ceil(stages.length / STAGES_PAGE_SIZE))
  const safeStagesPage = Math.min(Math.max(1, stagesPage), stagesTotalPages)
  const pagedStages = useMemo(() => {
    const start = (safeStagesPage - 1) * STAGES_PAGE_SIZE
    return stages.slice(start, start + STAGES_PAGE_SIZE)
  }, [stages, safeStagesPage])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [pathsRes, catalogRes] = await Promise.all([
        fetch('/api/admin/learning-paths'),
        fetch('/api/admin/interview-config'),
      ])
      const pathsData = await pathsRes.json()
      const catalogData = await catalogRes.json()
      if (!pathsRes.ok) throw new Error(pathsData.message || 'Failed to load paths')
      setPaths(pathsData.paths ?? [])
      setDepartments(catalogData.departments ?? [])
      if (!selectedId && pathsData.paths?.[0]) {
        setSelectedId(pathsData.paths[0].id)
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [selectedId, toast])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selected) {
      setTitle('')
      setDescription('')
      setAudience('beginner')
      setCategory('technology')
      setSubcategory('')
      setTagsText('')
      setDifficultyLabel('')
      setEstimatedMinutes('')
      setIsFeatured(false)
      setSlug('')
      setStages([])
      return
    }
    setTitle(selected.title)
    setDescription(selected.description)
    setAudience(selected.targetAudience)
    setCategory(selected.category || 'technology')
    setSubcategory(selected.subcategory || '')
    setTagsText((selected.tags || []).join(', '))
    setDifficultyLabel(selected.difficultyLabel || '')
    setEstimatedMinutes(
      typeof selected.estimatedMinutes === 'number' ? String(selected.estimatedMinutes) : '',
    )
    setIsFeatured(Boolean(selected.isFeatured))
    setSlug(selected.slug || '')
    setStages(
      selected.stages.map((s) => ({
        ...s,
        _key: s.id || `s-${s.order}`,
        level: s.level ?? null,
        departmentKey: s.departmentKey || '',
        specializationKeys: s.specializationKeys || [],
        suggestedTopics: s.suggestedTopics || [],
      })),
    )
    setStagesPage(1)
  }, [selected])

  const specsForDept = (departmentKey: string) =>
    departments.find((d) => d.key === departmentKey)?.specializations ?? []

  const topicOptions = (departmentKey: string, specializationKeys: string[]) => {
    const dept = departments.find((d) => d.key === departmentKey)
    if (!dept) return [] as string[]
    const specs =
      specializationKeys.length > 0
        ? dept.specializations.filter((s) => specializationKeys.includes(s.key))
        : dept.specializations
    const set = new Set<string>()
    for (const s of specs) {
      for (const t of [
        ...(s.technicalTopics ?? []),
        ...(s.behavioralTopics ?? []),
        ...(s.hrTopics ?? []),
      ]) {
        set.add(t)
      }
    }
    return [...set]
  }

  const createPath = async () => {
    setCreating(true)
    try {
      const res = await fetch('/api/admin/learning-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'New learning path',
          description: 'Describe this path for learners.',
          targetAudience: 'beginner',
          category: 'technology',
          slug: `path-${Date.now().toString(36)}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Create failed')
      setPaths((prev) => [...prev, data.path])
      setSelectedId(data.path.id)
      toast.success('Path created')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Create failed')
    } finally {
      setCreating(false)
    }
  }

  const saveAll = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      const metaRes = await fetch(`/api/admin/learning-paths/${selectedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          targetAudience: audience,
          category,
          subcategory,
          tags: tagsText
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          difficultyLabel: difficultyLabel || null,
          estimatedMinutes: estimatedMinutes === '' ? null : Number(estimatedMinutes),
          isFeatured,
          slug: slug || null,
        }),
      })
      const metaData = await metaRes.json()
      if (!metaRes.ok) throw new Error(metaData.message || 'Failed to save path')

      const stagesPayload = stages.map((s, i) => ({
        id: s.id || undefined,
        order: i + 1,
        title: s.title,
        type: s.type,
        contentRef: s.contentRef,
        unlockMinScore: s.unlockMinScore,
        level: s.level ?? null,
        departmentKey: s.departmentKey || '',
        specializationKeys: s.specializationKeys || [],
        interviewType: s.interviewType || null,
        difficulty: s.difficulty || null,
        suggestedTopics: s.suggestedTopics || [],
        totalQuestions: s.totalQuestions,
        technicalQuestionRatio: s.technicalQuestionRatio,
      }))

      const stagesRes = await fetch(`/api/admin/learning-paths/${selectedId}/stages`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stages: stagesPayload.length ? stagesPayload : [emptyStage(selectedId, 1)] }),
      })
      const stagesData = await stagesRes.json()
      if (!stagesRes.ok) throw new Error(stagesData.message || 'Failed to save stages')

      setPaths((prev) =>
        prev.map((p) => (p.id === selectedId ? stagesData.path : p)),
      )
      toast.success('Saved learning path')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const deletePath = async () => {
    if (!selectedId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/learning-paths/${selectedId}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Delete failed')
      setPaths((prev) => prev.filter((p) => p.id !== selectedId))
      setSelectedId(null)
      setDeleteOpen(false)
      toast.success('Path deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    } finally {
      setSaving(false)
    }
  }

  const updateStage = (key: string, patch: Partial<StageDraft>) => {
    setStages((prev) => prev.map((s) => (s._key === key ? { ...s, ...patch } : s)))
  }

  if (loading) {
    return null
  }

  return (
    <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[240px_1fr]">
      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Paths</h2>
          <LoadingButton
            type="button"
            loading={creating}
            onClick={() => void createPath()}
            className="hq-btn-outline h-8 rounded-lg px-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
          </LoadingButton>
        </div>
        <ul className="max-h-[70vh] space-y-1 overflow-y-auto">
          {pagedPaths.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setSelectedId(p.id)}
                className={[
                  'flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs transition',
                  selectedId === p.id
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-input/30',
                ].join(' ')}
              >
                <Route className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{p.title}</span>
              </button>
            </li>
          ))}
        </ul>
        <ListPagination
          page={safeListPage}
          totalPages={listTotalPages}
          onPageChange={setListPage}
          compact
          className="pt-1"
        />
      </aside>

      {selected ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-lg font-semibold text-foreground">Edit learning path</h1>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-destructive/40 px-3 text-xs text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
              <LoadingButton
                type="button"
                loading={saving}
                loadingLabel="Saving…"
                onClick={() => void saveAll()}
                className="hq-btn-primary h-9 rounded-xl px-4 text-xs"
              >
                <Save className="h-3.5 w-3.5" /> Save
              </LoadingButton>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Title</span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-border bg-input/30 px-3 py-2 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Audience</span>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LearningPath['category'])}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              >
                {PATH_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {PATH_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Subcategory</span>
              <input
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
                placeholder="e.g. languages, frontend, pakistan"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-xs text-muted-foreground">Tags (comma-separated)</span>
              <input
                value={tagsText}
                onChange={(e) => setTagsText(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Difficulty</span>
              <select
                value={difficultyLabel}
                onChange={(e) => setDifficultyLabel(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              >
                <option value="">—</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Estimated minutes</span>
              <input
                type="number"
                min={1}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              />
            </label>
            <label className="inline-flex items-center gap-2 text-xs text-muted-foreground sm:col-span-2">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
              />
              Featured path
            </label>
            <label className="block space-y-1">
              <span className="text-xs text-muted-foreground">Slug</span>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-input/30 px-3 text-sm"
              />
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Stages</h3>
              <button
                type="button"
                onClick={() =>
                  setStages((prev) => [...prev, emptyStage(selectedId!, prev.length + 1)])
                }
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-border px-2 text-xs"
              >
                <Plus className="h-3.5 w-3.5" /> Add stage
              </button>
            </div>

            {pagedStages.map((stage) => {
              const specs = specsForDept(stage.departmentKey || '')
              const topics = topicOptions(stage.departmentKey || '', stage.specializationKeys || [])
              const interviewBound =
                stage.type === 'practice' || stage.type === 'mock_interview'
              return (
                <div
                  key={stage._key}
                  className="space-y-3 rounded-2xl border border-border bg-input/10 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="grid flex-1 gap-2 sm:grid-cols-2">
                      <input
                        value={stage.title}
                        onChange={(e) => updateStage(stage._key, { title: e.target.value })}
                        className="h-9 rounded-lg border border-border bg-input/30 px-2 text-sm"
                        placeholder="Title"
                      />
                      <select
                        value={stage.type}
                        onChange={(e) =>
                          updateStage(stage._key, { type: e.target.value as StageType })
                        }
                        className="h-9 rounded-lg border border-border bg-input/30 px-2 text-sm"
                      >
                        <option value="concept">concept</option>
                        <option value="practice">practice</option>
                        <option value="mock_interview">mock_interview</option>
                        <option value="ai_feedback">ai_feedback</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStages((prev) => prev.filter((s) => s._key !== stage._key))}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea
                    value={stage.contentRef}
                    onChange={(e) => updateStage(stage._key, { contentRef: e.target.value })}
                    rows={2}
                    placeholder="Content / coaching copy"
                    className="w-full rounded-lg border border-border bg-input/30 px-2 py-1.5 text-sm"
                  />
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    Unlock min score
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={stage.unlockMinScore ?? ''}
                      onChange={(e) =>
                        updateStage(stage._key, {
                          unlockMinScore: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="h-8 w-20 rounded-lg border border-border bg-input/30 px-2"
                    />
                  </label>
                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                    Level
                    <select
                      value={stage.level ?? ''}
                      onChange={(e) =>
                        updateStage(stage._key, {
                          level: e.target.value === '' ? null : Number(e.target.value),
                        })
                      }
                      className="h-8 rounded-lg border border-border bg-input/30 px-2"
                    >
                      <option value="">—</option>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          L{n}
                        </option>
                      ))}
                    </select>
                  </label>

                  {interviewBound ? (
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Catalog bindings
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <select
                          value={stage.departmentKey || ''}
                          onChange={(e) =>
                            updateStage(stage._key, {
                              departmentKey: e.target.value,
                              specializationKeys: [],
                              suggestedTopics: [],
                            })
                          }
                          className="h-9 rounded-lg border border-border bg-input/30 px-2 text-sm"
                        >
                          <option value="">Department…</option>
                          {departments.map((d) => (
                            <option key={d.key} value={d.key}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={stage.interviewType || ''}
                          onChange={(e) =>
                            updateStage(stage._key, {
                              interviewType: (e.target.value || null) as LearningStage['interviewType'],
                            })
                          }
                          className="h-9 rounded-lg border border-border bg-input/30 px-2 text-sm"
                        >
                          <option value="">Interview type…</option>
                          <option value="technical">technical</option>
                          <option value="behavioral">behavioral</option>
                          <option value="both">both</option>
                          <option value="hr">hr</option>
                        </select>
                        <select
                          value={stage.difficulty || ''}
                          onChange={(e) =>
                            updateStage(stage._key, {
                              difficulty: (e.target.value || null) as LearningStage['difficulty'],
                            })
                          }
                          className="h-9 rounded-lg border border-border bg-input/30 px-2 text-sm"
                        >
                          <option value="">Difficulty…</option>
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                          <option value="Adaptive">Adaptive</option>
                        </select>
                        <input
                          type="number"
                          min={5}
                          max={40}
                          placeholder="Questions"
                          value={stage.totalQuestions ?? ''}
                          onChange={(e) =>
                            updateStage(stage._key, {
                              totalQuestions:
                                e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          className="h-9 rounded-lg border border-border bg-input/30 px-2 text-sm"
                        />
                      </div>
                      {specs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {specs.map((s) => {
                            const on = (stage.specializationKeys || []).includes(s.key)
                            return (
                              <button
                                key={s.key}
                                type="button"
                                onClick={() => {
                                  const cur = stage.specializationKeys || []
                                  updateStage(stage._key, {
                                    specializationKeys: on
                                      ? cur.filter((k) => k !== s.key)
                                      : [...cur, s.key],
                                  })
                                }}
                                className={[
                                  'rounded-full border px-2 py-0.5 text-[11px]',
                                  on
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-border text-muted-foreground',
                                ].join(' ')}
                              >
                                {s.label}
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                      {topics.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {topics.map((t) => {
                            const on = (stage.suggestedTopics || []).includes(t)
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => {
                                  const cur = stage.suggestedTopics || []
                                  updateStage(stage._key, {
                                    suggestedTopics: on
                                      ? cur.filter((x) => x !== t)
                                      : [...cur, t],
                                  })
                                }}
                                className={[
                                  'rounded-full border px-2 py-0.5 text-[11px]',
                                  on
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-border text-muted-foreground',
                                ].join(' ')}
                              >
                                {t}
                              </button>
                            )
                          })}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              )
            })}
            <ListPagination
              page={safeStagesPage}
              totalPages={stagesTotalPages}
              onPageChange={setStagesPage}
            />
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Select or create a learning path.</p>
      )}

      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete learning path?"
        description="This removes the path and all of its stages. User progress for this path may become orphaned."
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={() => void deletePath()}
      />
    </div>
  )
}
