'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Layers,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { SelectionChip } from '@/components/ui/selection-chip'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import { getIndustryIcon, getRoleIcon } from '@/lib/icon-mapping'
import type { DepartmentDto, SpecializationPayload } from '@/lib/interview-catalog/admin'
import { countTopics } from '@/lib/interview-catalog/admin'

type AdminTab = 'departments' | 'specializations' | 'topics'

type TopicRow = {
  departmentId: string
  departmentKey: string
  departmentLabel: string
  specializationKey: string
  specializationLabel: string
  kind: 'technical' | 'behavioral'
  topic: string
}

const PAGE_SIZE = 8

const emptySpecialization: SpecializationPayload = {
  key: '',
  label: '',
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
    if (!next || safeValue.includes(next)) return
    onChange([...safeValue, next])
    setDraft('')
  }

  return (
    <div className="space-y-1.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="rounded-lg border border-border bg-surface p-2">
        <div className="mb-2 flex flex-wrap gap-2">
          {safeValue.map((item) => (
            <SelectionChip key={item} onClick={() => onChange(safeValue.filter((entry) => entry !== item))} active>
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
            className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-3 text-xs font-medium text-foreground transition-all hover:border-primary/30 hover:bg-surface-strong"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={[
        'inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        active
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
          : 'border-border bg-input/30 text-muted-foreground',
      ].join(' ')}
    >
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

export function TrackConfigManager() {
  const toast = useToast()
  const [departments, setDepartments] = useState<DepartmentDto[]>([])
  const [activeTab, setActiveTab] = useState<AdminTab>('departments')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [expandedDepartments, setExpandedDepartments] = useState<Set<string>>(new Set())
  const [expandedSpecializations, setExpandedSpecializations] = useState<Set<string>>(new Set())
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const [departmentModalOpen, setDepartmentModalOpen] = useState(false)
  const [editingDepartment, setEditingDepartment] = useState<DepartmentDto | null>(null)
  const [departmentForm, setDepartmentForm] = useState({
    label: '',
    description: '',
    isActive: true,
  })

  const [specializationModalOpen, setSpecializationModalOpen] = useState(false)
  const [editingSpecialization, setEditingSpecialization] = useState<{
    departmentId: string
    specKey?: string
    form: SpecializationPayload
  } | null>(null)

  const [topicModalOpen, setTopicModalOpen] = useState(false)
  const [topicForm, setTopicForm] = useState<{
    departmentId: string
    specializationKey: string
    kind: 'technical' | 'behavioral'
    topic: string
  }>({ departmentId: '', specializationKey: '', kind: 'technical', topic: '' })

  const [deleteTarget, setDeleteTarget] = useState<
    | { type: 'department'; id: string; label: string }
    | { type: 'specialization'; departmentId: string; specKey: string; label: string }
    | { type: 'topic'; departmentId: string; specKey: string; kind: 'technical' | 'behavioral'; topic: string }
    | null
  >(null)

  const loadDepartments = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/interview-config')
      const data = await response.json()
      if (!response.ok) {
        setError(data.message ?? 'Failed to load catalog')
        return
      }
      const next = (data.departments ?? []) as DepartmentDto[]
      setDepartments(next)
      setSelectedDepartmentId((current) => current ?? next[0]?._id ?? null)
    } catch {
      setError('Failed to load catalog')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadDepartments()
  }, [loadDepartments])

  const selectedDepartment = useMemo(
    () => departments.find((department) => department._id === selectedDepartmentId) ?? null,
    [departments, selectedDepartmentId],
  )

  const normalizedSearch = search.trim().toLowerCase()

  const filteredDepartments = useMemo(() => {
    if (!normalizedSearch) return departments
    return departments.filter(
      (department) =>
        department.label.toLowerCase().includes(normalizedSearch) ||
        department.key.toLowerCase().includes(normalizedSearch) ||
        department.description?.toLowerCase().includes(normalizedSearch),
    )
  }, [departments, normalizedSearch])

  const specializationRows = useMemo(() => {
    return departments.flatMap((department) =>
      department.specializations.map((spec) => ({
        department,
        spec,
        topicCount: spec.technicalTopics.length + spec.behavioralTopics.length,
      })),
    )
  }, [departments])

  const filteredSpecializations = useMemo(() => {
    if (!normalizedSearch) return specializationRows
    return specializationRows.filter(
      (row) =>
        row.spec.label.toLowerCase().includes(normalizedSearch) ||
        row.spec.key.toLowerCase().includes(normalizedSearch) ||
        row.department.label.toLowerCase().includes(normalizedSearch),
    )
  }, [normalizedSearch, specializationRows])

  const topicRows = useMemo<TopicRow[]>(() => {
    return departments.flatMap((department) =>
      department.specializations.flatMap((spec) => [
        ...spec.technicalTopics.map((topic) => ({
          departmentId: department._id,
          departmentKey: department.key,
          departmentLabel: department.label,
          specializationKey: spec.key,
          specializationLabel: spec.label,
          kind: 'technical' as const,
          topic,
        })),
        ...spec.behavioralTopics.map((topic) => ({
          departmentId: department._id,
          departmentKey: department.key,
          departmentLabel: department.label,
          specializationKey: spec.key,
          specializationLabel: spec.label,
          kind: 'behavioral' as const,
          topic,
        })),
      ]),
    )
  }, [departments])

  const filteredTopics = useMemo(() => {
    if (!normalizedSearch) return topicRows
    return topicRows.filter(
      (row) =>
        row.topic.toLowerCase().includes(normalizedSearch) ||
        row.specializationLabel.toLowerCase().includes(normalizedSearch) ||
        row.departmentLabel.toLowerCase().includes(normalizedSearch),
    )
  }, [normalizedSearch, topicRows])

  const activeRows =
    activeTab === 'departments'
      ? filteredDepartments
      : activeTab === 'specializations'
        ? filteredSpecializations
        : filteredTopics

  const totalPages = Math.max(1, Math.ceil(activeRows.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pagedRows = activeRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [activeTab, search])

  const toggleDepartmentExpanded = (id: string) => {
    setExpandedDepartments((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSpecializationExpanded = (key: string) => {
    setExpandedSpecializations((previous) => {
      const next = new Set(previous)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const openCreateDepartment = () => {
    setEditingDepartment(null)
    setDepartmentForm({ label: '', description: '', isActive: true })
    setDepartmentModalOpen(true)
  }

  const openEditDepartment = (department: DepartmentDto) => {
    setEditingDepartment(department)
    setDepartmentForm({
      label: department.label,
      description: department.description ?? '',
      isActive: department.isActive,
    })
    setDepartmentModalOpen(true)
  }

  const saveDepartment = async () => {
    setIsSaving(true)
    setError('')
    try {
      const payload = {
        label: departmentForm.label,
        description: departmentForm.description,
        isActive: departmentForm.isActive,
        specializations: editingDepartment?.specializations ?? [],
        key: editingDepartment?.key,
      }

      const endpoint = editingDepartment
        ? `/api/admin/interview-config/${editingDepartment._id}`
        : '/api/admin/interview-config'
      const method = editingDepartment ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message ?? 'Failed to save department')
        return
      }

      const saved = data.department as DepartmentDto
      setDepartments((previous) => {
        if (editingDepartment) {
          return previous.map((item) => (item._id === saved._id ? saved : item))
        }
        return [...previous, saved]
      })
      setSelectedDepartmentId(saved._id)
      setDepartmentModalOpen(false)
      toast.success(editingDepartment ? 'Department updated' : 'Department created')
    } catch {
      toast.error('Failed to save department')
    } finally {
      setIsSaving(false)
    }
  }

  const openCreateSpecialization = (departmentId?: string) => {
    const targetId = departmentId ?? selectedDepartmentId
    if (!targetId) return
    setEditingSpecialization({
      departmentId: targetId,
      form: { ...emptySpecialization },
    })
    setSpecializationModalOpen(true)
  }

  const openEditSpecialization = (departmentId: string, specKey: string) => {
    const department = departments.find((entry) => entry._id === departmentId)
    const spec = department?.specializations.find((entry) => entry.key === specKey)
    if (!department || !spec) return
    setEditingSpecialization({
      departmentId,
      specKey,
      form: { ...spec },
    })
    setSpecializationModalOpen(true)
  }

  const saveSpecialization = async () => {
    if (!editingSpecialization) return
    setIsSaving(true)
    try {
      const { departmentId, specKey, form } = editingSpecialization
      const endpoint = specKey
        ? `/api/admin/interview-config/${departmentId}/specializations/${specKey}`
        : `/api/admin/interview-config/${departmentId}/specializations`
      const method = specKey ? 'PATCH' : 'POST'

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message ?? 'Failed to save specialization')
        return
      }

      const saved = data.department as DepartmentDto
      setDepartments((previous) => previous.map((item) => (item._id === saved._id ? saved : item)))
      setSpecializationModalOpen(false)
      toast.success(specKey ? 'Specialization updated' : 'Specialization created')
    } catch {
      toast.error('Failed to save specialization')
    } finally {
      setIsSaving(false)
    }
  }

  const openCreateTopic = (departmentId?: string, specializationKey?: string) => {
    setTopicForm({
      departmentId: departmentId ?? selectedDepartmentId ?? '',
      specializationKey: specializationKey ?? selectedDepartment?.specializations[0]?.key ?? '',
      kind: 'technical',
      topic: '',
    })
    setTopicModalOpen(true)
  }

  const saveTopic = async () => {
    if (!topicForm.departmentId || !topicForm.specializationKey || !topicForm.topic.trim()) return
    setIsSaving(true)
    try {
      const response = await fetch(
        `/api/admin/interview-config/${topicForm.departmentId}/specializations/${topicForm.specializationKey}/topics`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ kind: topicForm.kind, topic: topicForm.topic.trim() }),
        },
      )
      const data = await response.json()
      if (!response.ok) {
        toast.error(data.message ?? 'Failed to add topic')
        return
      }
      const saved = data.department as DepartmentDto
      setDepartments((previous) => previous.map((item) => (item._id === saved._id ? saved : item)))
      setTopicModalOpen(false)
      toast.success('Topic added')
    } catch {
      toast.error('Failed to add topic')
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsSaving(true)
    try {
      if (deleteTarget.type === 'department') {
        const response = await fetch(`/api/admin/interview-config/${deleteTarget.id}`, { method: 'DELETE' })
        const data = await response.json()
        if (!response.ok) {
          toast.error(data.message ?? 'Failed to delete department')
          return
        }
        setDepartments((previous) => previous.filter((item) => item._id !== deleteTarget.id))
        setSelectedDepartmentId((current) => (current === deleteTarget.id ? null : current))
      }

      if (deleteTarget.type === 'specialization') {
        const response = await fetch(
          `/api/admin/interview-config/${deleteTarget.departmentId}/specializations/${deleteTarget.specKey}`,
          { method: 'DELETE' },
        )
        const data = await response.json()
        if (!response.ok) {
          toast.error(data.message ?? 'Failed to delete specialization')
          return
        }
        const saved = data.department as DepartmentDto
        setDepartments((previous) => previous.map((item) => (item._id === saved._id ? saved : item)))
      }

      if (deleteTarget.type === 'topic') {
        const response = await fetch(
          `/api/admin/interview-config/${deleteTarget.departmentId}/specializations/${deleteTarget.specKey}/topics`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kind: deleteTarget.kind, topic: deleteTarget.topic }),
          },
        )
        const data = await response.json()
        if (!response.ok) {
          toast.error(data.message ?? 'Failed to delete topic')
          return
        }
        const saved = data.department as DepartmentDto
        setDepartments((previous) => previous.map((item) => (item._id === saved._id ? saved : item)))
      }

      toast.success('Deleted successfully')
      setDeleteTarget(null)
    } catch {
      toast.error('Delete failed')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-180px)]">
      <div className="border-b border-border bg-surface/40 px-4 py-5 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold text-foreground">
          Track <span className="text-gradient">Configuration</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the interview hierarchy: Department → Specialization → Topics
        </p>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {([
              ['departments', 'Departments'],
              ['specializations', 'Specializations'],
              ['topics', 'Topics'],
            ] as const).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={[
                  'rounded-xl border px-4 py-2 text-sm font-semibold transition-all',
                  activeTab === key
                    ? 'border-primary/50 bg-primary/10 text-foreground shadow-glow-sm'
                    : 'border-border bg-input/20 text-muted-foreground hover:text-foreground',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search hierarchy..."
                className="pl-10"
              />
            </div>
            {activeTab === 'departments' ? (
              <button
                type="button"
                onClick={openCreateDepartment}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-white shadow-glow-sm"
              >
                <Plus className="h-4 w-4" /> Add Department
              </button>
            ) : null}
            {activeTab === 'specializations' ? (
              <button
                type="button"
                onClick={() => openCreateSpecialization()}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-white shadow-glow-sm"
              >
                <Plus className="h-4 w-4" /> Add Specialization
              </button>
            ) : null}
            {activeTab === 'topics' ? (
              <button
                type="button"
                onClick={() => openCreateTopic()}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-white shadow-glow-sm"
              >
                <Plus className="h-4 w-4" /> Add Topic
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 xl:grid-cols-[1fr_320px]">
        <section className="p-4 sm:p-6 lg:p-8">
          {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading catalog...</p>
          ) : activeTab === 'departments' ? (
            <div className="space-y-3">
              {(pagedRows as DepartmentDto[]).map((department) => {
                const Icon = getIndustryIcon(department.key).icon
                const expanded = expandedDepartments.has(department._id)
                return (
                  <div key={department._id} className="dashboard-card overflow-hidden">
                    <div className="flex flex-wrap items-center gap-3 p-4">
                      <button
                        type="button"
                        onClick={() => toggleDepartmentExpanded(department._id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-input/20"
                      >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      <div className="icon-card-icon-wrap flex h-11 w-11 items-center justify-center rounded-xl border">
                        <Icon className={`h-5 w-5 ${getIndustryIcon(department.key).accentColor}`} />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDepartmentId(department._id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="font-semibold text-foreground">{department.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {department.specializations.length} specializations · {countTopics(department)} topics
                        </div>
                      </button>
                      <StatusBadge active={department.isActive} />
                      <div className="flex gap-2">
                        <button type="button" onClick={() => openEditDepartment(department)} className="rounded-lg border border-border p-2 hover:bg-input/30">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'department', id: department._id, label: department.label })}
                          className="rounded-lg border border-border p-2 hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4 text-red-300" />
                        </button>
                      </div>
                    </div>

                    {expanded ? (
                      <div className="border-t border-border/70 bg-input/10 p-4">
                        {department.specializations.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No specializations yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {department.specializations.map((spec) => {
                              const SpecIcon = getRoleIcon(spec.key).icon
                              const specExpanded = expandedSpecializations.has(`${department._id}:${spec.key}`)
                              return (
                                <div key={spec.key} className="rounded-xl border border-border/70 bg-surface/60">
                                  <div className="flex items-center gap-3 p-3">
                                    <button
                                      type="button"
                                      onClick={() => toggleSpecializationExpanded(`${department._id}:${spec.key}`)}
                                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border"
                                    >
                                      {specExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                                    </button>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-input/20">
                                      <SpecIcon className={`h-4 w-4 ${getRoleIcon(spec.key).accentColor}`} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="text-sm font-medium text-foreground">{spec.label}</div>
                                      <div className="text-xs text-muted-foreground">
                                        {spec.technicalTopics.length} technical · {spec.behavioralTopics.length} behavioral
                                      </div>
                                    </div>
                                    <button type="button" onClick={() => openEditSpecialization(department._id, spec.key)} className="rounded-lg border border-border p-1.5">
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setDeleteTarget({
                                          type: 'specialization',
                                          departmentId: department._id,
                                          specKey: spec.key,
                                          label: spec.label,
                                        })
                                      }
                                      className="rounded-lg border border-border p-1.5 hover:bg-red-500/10"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 text-red-300" />
                                    </button>
                                  </div>
                                  {specExpanded ? (
                                    <div className="border-t border-border/60 px-3 py-3">
                                      <div className="flex flex-wrap gap-2">
                                        {[...spec.technicalTopics, ...spec.behavioralTopics].map((topic) => (
                                          <SelectionChip key={topic} active>
                                            <Tag className="h-3 w-3" />
                                            {topic}
                                          </SelectionChip>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              )
                            })}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => openCreateSpecialization(department._id)}
                          className="mt-3 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add specialization
                        </button>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : activeTab === 'specializations' ? (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-input/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Topics</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedRows as typeof filteredSpecializations).map(({ department, spec, topicCount }) => {
                    const SpecIcon = getRoleIcon(spec.key).icon
                    return (
                      <tr key={`${department._id}:${spec.key}`} className="border-t border-border/70">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <SpecIcon className={`h-4 w-4 ${getRoleIcon(spec.key).accentColor}`} />
                            <span className="font-medium text-foreground">{spec.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{department.label}</td>
                        <td className="px-4 py-3 text-muted-foreground">{topicCount}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => openEditSpecialization(department._id, spec.key)} className="rounded-lg border border-border p-1.5">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget({
                                  type: 'specialization',
                                  departmentId: department._id,
                                  specKey: spec.key,
                                  label: spec.label,
                                })
                              }
                              className="rounded-lg border border-border p-1.5"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-300" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full text-sm">
                <thead className="bg-input/20 text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Topic</th>
                    <th className="px-4 py-3">Kind</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedRows as TopicRow[]).map((row) => (
                    <tr key={`${row.departmentId}:${row.specializationKey}:${row.kind}:${row.topic}`} className="border-t border-border/70">
                      <td className="px-4 py-3 font-medium text-foreground">{row.topic}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{row.kind}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.specializationLabel}</td>
                      <td className="px-4 py-3 text-muted-foreground">{row.departmentLabel}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteTarget({
                                type: 'topic',
                                departmentId: row.departmentId,
                                specKey: row.specializationKey,
                                kind: row.kind,
                                topic: row.topic,
                              })
                            }
                            className="rounded-lg border border-border p-1.5"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && activeRows.length > PAGE_SIZE ? (
            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                  className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                  className="rounded-lg border border-border px-3 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <aside className="border-t border-border bg-input/10 p-4 sm:p-6 xl:border-l xl:border-t-0">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Layers className="h-4 w-4" />
            Department Details
          </div>
          {selectedDepartment ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getIndustryIcon(selectedDepartment.key).icon
                  return (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface">
                      <Icon className={`h-6 w-6 ${getIndustryIcon(selectedDepartment.key).accentColor}`} />
                    </div>
                  )
                })()}
                <div>
                  <div className="font-semibold text-foreground">{selectedDepartment.label}</div>
                  <div className="text-xs text-muted-foreground">{selectedDepartment.key}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedDepartment.description?.trim() || 'No description provided.'}
              </p>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="text-xs text-muted-foreground">Specializations</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {selectedDepartment.specializations.length}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-surface p-3">
                  <div className="text-xs text-muted-foreground">Topics</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">{countTopics(selectedDepartment)}</div>
                </div>
              </div>
              <StatusBadge active={selectedDepartment.isActive} />
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openEditDepartment(selectedDepartment)} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold">
                  Edit department
                </button>
                <button type="button" onClick={() => openCreateSpecialization(selectedDepartment._id)} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold">
                  Add specialization
                </button>
                <button type="button" onClick={() => openCreateTopic(selectedDepartment._id)} className="rounded-xl border border-border px-3 py-2 text-xs font-semibold">
                  Add topic
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select a department to view details.</p>
          )}
        </aside>
      </div>

      {departmentModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-foreground">
              {editingDepartment ? 'Edit Department' : 'Add Department'}
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Label</span>
                <Input value={departmentForm.label} onChange={(e) => setDepartmentForm((p) => ({ ...p, label: e.target.value }))} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Description</span>
                <Input value={departmentForm.description} onChange={(e) => setDepartmentForm((p) => ({ ...p, description: e.target.value }))} />
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={departmentForm.isActive} onChange={(e) => setDepartmentForm((p) => ({ ...p, isActive: e.target.checked }))} />
                Active
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setDepartmentModalOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm">
                Cancel
              </button>
              <LoadingButton type="button" onClick={saveDepartment} loading={isSaving} className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white">
                Save
              </LoadingButton>
            </div>
          </div>
        </div>
      ) : null}

      {specializationModalOpen && editingSpecialization ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-foreground">
              {editingSpecialization.specKey ? 'Edit Specialization' : 'Add Specialization'}
            </h2>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Department</span>
                <select
                  value={editingSpecialization.departmentId}
                  onChange={(e) =>
                    setEditingSpecialization((previous) =>
                      previous ? { ...previous, departmentId: e.target.value } : previous,
                    )
                  }
                  className="w-full rounded-xl border border-border bg-input/20 px-3 py-2 text-sm"
                >
                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Label</span>
                <Input
                  value={editingSpecialization.form.label}
                  onChange={(e) =>
                    setEditingSpecialization((previous) =>
                      previous ? { ...previous, form: { ...previous.form, label: e.target.value } } : previous,
                    )
                  }
                />
              </label>
              <TagInput
                label="Technical Topics"
                value={editingSpecialization.form.technicalTopics}
                onChange={(next) =>
                  setEditingSpecialization((previous) =>
                    previous ? { ...previous, form: { ...previous.form, technicalTopics: next } } : previous,
                  )
                }
                placeholder="Add technical topic"
              />
              <TagInput
                label="Behavioral Topics"
                value={editingSpecialization.form.behavioralTopics}
                onChange={(next) =>
                  setEditingSpecialization((previous) =>
                    previous ? { ...previous, form: { ...previous.form, behavioralTopics: next } } : previous,
                  )
                }
                placeholder="Add behavioral topic"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSpecializationModalOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm">
                Cancel
              </button>
              <LoadingButton type="button" onClick={saveSpecialization} loading={isSaving} className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white">
                Save
              </LoadingButton>
            </div>
          </div>
        </div>
      ) : null}

      {topicModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5">
            <h2 className="text-lg font-semibold text-foreground">Add Topic</h2>
            <div className="mt-4 space-y-3">
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Department</span>
                <select
                  value={topicForm.departmentId}
                  onChange={(e) => setTopicForm((p) => ({ ...p, departmentId: e.target.value, specializationKey: '' }))}
                  className="w-full rounded-xl border border-border bg-input/20 px-3 py-2 text-sm"
                >
                  {departments.map((department) => (
                    <option key={department._id} value={department._id}>
                      {department.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Specialization</span>
                <select
                  value={topicForm.specializationKey}
                  onChange={(e) => setTopicForm((p) => ({ ...p, specializationKey: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-input/20 px-3 py-2 text-sm"
                >
                  {(departments.find((d) => d._id === topicForm.departmentId)?.specializations ?? []).map((spec) => (
                    <option key={spec.key} value={spec.key}>
                      {spec.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Kind</span>
                <select
                  value={topicForm.kind}
                  onChange={(e) => setTopicForm((p) => ({ ...p, kind: e.target.value as 'technical' | 'behavioral' }))}
                  className="w-full rounded-xl border border-border bg-input/20 px-3 py-2 text-sm"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs text-muted-foreground">Topic</span>
                <Input value={topicForm.topic} onChange={(e) => setTopicForm((p) => ({ ...p, topic: e.target.value }))} />
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setTopicModalOpen(false)} className="rounded-xl border border-border px-4 py-2 text-sm">
                Cancel
              </button>
              <LoadingButton type="button" onClick={saveTopic} loading={isSaving} className="rounded-xl bg-gradient-primary px-4 py-2 text-sm font-semibold text-white">
                Save
              </LoadingButton>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Confirm delete"
        description={
          deleteTarget?.type === 'department'
            ? `Delete department "${deleteTarget.label}" and all nested specializations/topics?`
            : deleteTarget?.type === 'specialization'
              ? `Delete specialization "${deleteTarget.label}"?`
              : deleteTarget?.type === 'topic'
                ? `Delete topic "${deleteTarget.topic}"?`
                : ''
        }
        confirmLabel="Delete"
        confirmVariant="danger"
        disabled={isSaving}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
