'use client'

import { useCallback, useEffect, useState } from 'react'
import { Plus, Trash2, Save, Award, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { LoadingButton } from '@/components/ui/loading-button'
import { useToast } from '@/components/ui/toast'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { ListPagination } from '@/components/ui/list-pagination'
import {
  CERT_CATEGORIES,
  CERT_CATEGORY_LABELS,
  CERT_COST_LABELS,
  CERT_COST_TYPES,
  CERT_CREDENTIAL_LABELS,
  CERT_CREDENTIAL_TYPES,
  CERT_LEVELS,
  CERT_PORTFOLIO_VALUES,
} from '@/lib/certifications/constants'
import type { SerializedCertification } from '@/lib/certifications/serialize'

type AdminCert = SerializedCertification & { sourceNotes: string | null }

const TODAY = new Date().toISOString().slice(0, 10)

function emptyDraft(): Omit<AdminCert, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    provider: '',
    providerSlug: '',
    category: 'software-dev',
    subcategories: [],
    roles: [],
    level: 'beginner',
    costType: 'free',
    credentialType: 'course-certificate',
    examRequired: false,
    description: '',
    whyItMatters: '',
    skills: [],
    estimatedHours: null,
    portfolioValue: 'medium',
    portfolioNote: '',
    linkedinSupported: false,
    resumeRecommended: false,
    officialUrl: '',
    credentialUrl: null,
    expiration: null,
    isFeatured: false,
    tags: [],
    lastVerifiedAt: TODAY,
    sourceNotes: '',
    isPublished: true,
  }
}

const LIST_PAGE_SIZE = 15

export function CertificationsAdmin() {
  const toast = useToast()
  const [certs, setCerts] = useState<AdminCert[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Omit<AdminCert, 'id' | 'createdAt' | 'updatedAt'>>(emptyDraft())
  const [saving, setSaving] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [listPage, setListPage] = useState(1)

  const set = useCallback(<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
  }, [])

  // ── Load all certs (admin) ──
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/certifications')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load')
        if (!cancelled) setCerts(data.certifications ?? [])
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Failed to load certifications')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [toast])

  // ── Select cert to edit ──
  function selectCert(cert: AdminCert) {
    setSelectedId(cert.id)
    setDraft({
      name: cert.name,
      provider: cert.provider,
      providerSlug: cert.providerSlug,
      category: cert.category as (typeof draft)['category'],
      subcategories: cert.subcategories,
      roles: cert.roles,
      level: cert.level as (typeof draft)['level'],
      costType: cert.costType as (typeof draft)['costType'],
      credentialType: cert.credentialType as (typeof draft)['credentialType'],
      examRequired: cert.examRequired,
      description: cert.description,
      whyItMatters: cert.whyItMatters,
      skills: cert.skills,
      estimatedHours: cert.estimatedHours,
      portfolioValue: cert.portfolioValue as (typeof draft)['portfolioValue'],
      portfolioNote: cert.portfolioNote,
      linkedinSupported: cert.linkedinSupported,
      resumeRecommended: cert.resumeRecommended,
      officialUrl: cert.officialUrl,
      credentialUrl: cert.credentialUrl ?? null,
      expiration: cert.expiration ?? null,
      isFeatured: cert.isFeatured,
      tags: cert.tags,
      lastVerifiedAt: cert.lastVerifiedAt,
      sourceNotes: cert.sourceNotes ?? '',
      isPublished: cert.isPublished,
    })
  }

  function newCert() {
    setSelectedId(null)
    setDraft(emptyDraft())
  }

  // ── Save (create or update) ──
  async function handleSave() {
    if (!draft.name.trim() || !draft.officialUrl.trim()) {
      toast.error('Name and Official URL are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...draft,
        subcategories: draft.subcategories,
        roles: draft.roles,
        skills: draft.skills,
        tags: draft.tags,
        estimatedHours: draft.estimatedHours ?? null,
        credentialUrl: draft.credentialUrl || undefined,
        expiration: draft.expiration || null,
        sourceNotes: draft.sourceNotes || undefined,
      }

      const isNew = !selectedId
      const url = isNew ? '/api/admin/certifications' : `/api/admin/certifications/${selectedId}`
      const method = isNew ? 'POST' : 'PUT'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to save')

      const saved = data.certification as AdminCert
      if (isNew) {
        setCerts((prev) => [saved, ...prev])
        setSelectedId(saved.id)
        setCreating(false)
      } else {
        setCerts((prev) => prev.map((c) => (c.id === saved.id ? saved : c)))
      }
      toast.success(isNew ? 'Certification created.' : 'Certification updated.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  // ── Delete ──
  async function handleDelete() {
    if (!selectedId) return
    try {
      const res = await fetch(`/api/admin/certifications/${selectedId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to delete')
      }
      setCerts((prev) => prev.filter((c) => c.id !== selectedId))
      setSelectedId(null)
      setDraft(emptyDraft())
      toast.success('Certification deleted.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    } finally {
      setDeleteOpen(false)
    }
  }

  // ── Toggle publish ──
  async function togglePublish(cert: AdminCert) {
    const next = !cert.isPublished
    try {
      const res = await fetch(`/api/admin/certifications/${cert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cert, isPublished: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to update')
      setCerts((prev) => prev.map((c) => (c.id === cert.id ? (data.certification as AdminCert) : c)))
      toast.success(next ? 'Certification published.' : 'Certification unpublished.')
      if (selectedId === cert.id) set('isPublished', next)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    }
  }

  const totalPages = Math.max(1, Math.ceil(certs.length / LIST_PAGE_SIZE))
  const pageItems = certs.slice((listPage - 1) * LIST_PAGE_SIZE, listPage * LIST_PAGE_SIZE)
  const selected = selectedId ? certs.find((c) => c.id === selectedId) ?? null : null

  function ArrayField({
    label,
    value,
    onChange,
    placeholder,
  }: {
    label: string
    value: string[]
    onChange: (v: string[]) => void
    placeholder?: string
  }) {
    return (
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</label>
        <textarea
          value={value.join(', ')}
          onChange={(e) =>
            onChange(
              e.target.value
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean),
            )
          }
          placeholder={placeholder || `Comma-separated ${label.toLowerCase()}`}
          rows={2}
          className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none ring-primary/30 focus:ring-2 resize-none"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-[600px] flex-col lg:flex-row">
      {/* ── Left: list ── */}
      <div className="flex w-full flex-col border-b border-border lg:w-72 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Certifications</span>
            <span className="rounded-full bg-input/50 px-2 py-0.5 text-[10px] text-muted-foreground">
              {certs.length}
            </span>
          </div>
          <button
            type="button"
            onClick={newCert}
            className="hq-panel-btn inline-flex h-8 items-center gap-1.5 px-3 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-px p-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-input/30" />
              ))}
            </div>
          ) : (
            <div className="space-y-px p-2">
              {pageItems.map((cert) => (
                <button
                  key={cert.id}
                  type="button"
                  onClick={() => selectCert(cert)}
                  className={[
                    'flex w-full flex-col rounded-xl px-3 py-2.5 text-left transition-colors',
                    selectedId === cert.id
                      ? 'bg-primary/12 text-foreground'
                      : 'hover:bg-input/40 text-foreground',
                  ].join(' ')}
                >
                  <span className="truncate text-xs font-semibold leading-tight">{cert.name}</span>
                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">{cert.provider}</span>
                    {!cert.isPublished ? (
                      <span className="rounded-full bg-muted/40 px-1.5 py-px text-[9px] text-muted-foreground">
                        Draft
                      </span>
                    ) : null}
                    {cert.isFeatured ? (
                      <span className="rounded-full bg-primary/15 px-1.5 py-px text-[9px] text-primary">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-border px-2 py-2">
          <ListPagination page={listPage} totalPages={totalPages} onPageChange={setListPage} />
        </div>
      </div>

      {/* ── Right: editor ── */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {!selectedId && !creating ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <Award className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">
              Select a certification to edit, or create a new one.
            </p>
            <button
              type="button"
              onClick={() => { newCert(); setCreating(true) }}
              className="hq-btn-primary inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              New Certification
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Actions bar ── */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {selectedId ? 'Edit Certification' : 'New Certification'}
              </h2>
              <div className="flex items-center gap-2">
                {selected ? (
                  <>
                    <button
                      type="button"
                      onClick={() => void togglePublish(selected)}
                      className="hq-panel-btn inline-flex h-8 items-center gap-1.5 px-3 text-xs"
                      title={selected.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {selected.isPublished ? (
                        <><EyeOff className="h-3.5 w-3.5" /> Unpublish</>
                      ) : (
                        <><Eye className="h-3.5 w-3.5" /> Publish</>
                      )}
                    </button>
                    {draft.officialUrl ? (
                      <a
                        href={draft.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hq-panel-btn inline-flex h-8 items-center gap-1.5 px-3 text-xs"
                        title="Open official page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="hq-panel-btn inline-flex h-8 items-center gap-1.5 px-3 text-xs text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : null}
                <LoadingButton
                  loading={saving}
                  onClick={() => void handleSave()}
                  className="hq-btn-primary inline-flex h-8 items-center gap-1.5 rounded-xl px-4 text-xs font-semibold"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save
                </LoadingButton>
              </div>
            </div>

            {/* ── Form ── */}
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Name */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Certification Name *
                </label>
                <input
                  value={draft.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="e.g. AWS Certified Cloud Practitioner"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Provider */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Provider *</label>
                <input
                  value={draft.provider}
                  onChange={(e) => set('provider', e.target.value)}
                  placeholder="e.g. Amazon Web Services"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Provider slug */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Provider Slug</label>
                <input
                  value={draft.providerSlug}
                  onChange={(e) => set('providerSlug', e.target.value.toLowerCase())}
                  placeholder="e.g. aws"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Category</label>
                <select
                  value={draft.category}
                  onChange={(e) => set('category', e.target.value as (typeof draft)['category'])}
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                >
                  {CERT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CERT_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Level</label>
                <select
                  value={draft.level}
                  onChange={(e) => set('level', e.target.value as (typeof draft)['level'])}
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                >
                  {CERT_LEVELS.map((l) => (
                    <option key={l} value={l} className="capitalize">{l}</option>
                  ))}
                </select>
              </div>

              {/* Cost type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Cost Type</label>
                <select
                  value={draft.costType}
                  onChange={(e) => set('costType', e.target.value as (typeof draft)['costType'])}
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                >
                  {CERT_COST_TYPES.map((c) => (
                    <option key={c} value={c}>{CERT_COST_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {/* Credential type */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Credential Type</label>
                <select
                  value={draft.credentialType}
                  onChange={(e) => set('credentialType', e.target.value as (typeof draft)['credentialType'])}
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                >
                  {CERT_CREDENTIAL_TYPES.map((c) => (
                    <option key={c} value={c}>{CERT_CREDENTIAL_LABELS[c]}</option>
                  ))}
                </select>
              </div>

              {/* Portfolio value */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Portfolio Value</label>
                <select
                  value={draft.portfolioValue}
                  onChange={(e) => set('portfolioValue', e.target.value as (typeof draft)['portfolioValue'])}
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                >
                  {CERT_PORTFOLIO_VALUES.map((v) => (
                    <option key={v} value={v} className="capitalize">{v}</option>
                  ))}
                </select>
              </div>

              {/* Estimated hours */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Estimated Hours</label>
                <input
                  type="number"
                  value={draft.estimatedHours ?? ''}
                  onChange={(e) => set('estimatedHours', e.target.value ? Number(e.target.value) : null)}
                  placeholder="e.g. 40"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Expiration */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Validity / Expiration</label>
                <input
                  value={draft.expiration ?? ''}
                  onChange={(e) => set('expiration', e.target.value || null)}
                  placeholder="e.g. 3 years, No expiration"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Official URL */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Official URL *</label>
                <input
                  value={draft.officialUrl}
                  onChange={(e) => set('officialUrl', e.target.value)}
                  placeholder="https://..."
                  type="url"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Credential URL */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Credential / Badge URL</label>
                <input
                  value={draft.credentialUrl ?? ''}
                  onChange={(e) => set('credentialUrl', e.target.value || null)}
                  placeholder="https://credly.com/... (optional)"
                  type="url"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Description *</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="1–3 sentence factual description"
                  rows={3}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none ring-primary/30 focus:ring-2 resize-none"
                />
              </div>

              {/* Why it matters */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Why it matters</label>
                <textarea
                  value={draft.whyItMatters}
                  onChange={(e) => set('whyItMatters', e.target.value)}
                  placeholder="Plain-English explanation of why this credential is useful"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none ring-primary/30 focus:ring-2 resize-none"
                />
              </div>

              {/* Portfolio note */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Portfolio note</label>
                <input
                  value={draft.portfolioNote}
                  onChange={(e) => set('portfolioNote', e.target.value)}
                  placeholder="Brief note shown to users about portfolio value"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Array fields */}
              <ArrayField
                label="Skills (comma-separated)"
                value={draft.skills}
                onChange={(v) => set('skills', v)}
                placeholder="Python, SQL, Data Structures"
              />
              <ArrayField
                label="Roles (comma-separated)"
                value={draft.roles}
                onChange={(v) => set('roles', v)}
                placeholder="Software Engineer, Data Analyst"
              />
              <ArrayField
                label="Tags (comma-separated)"
                value={draft.tags}
                onChange={(v) => set('tags', v)}
                placeholder="cloud, free, beginner"
              />
              <ArrayField
                label="Subcategories (comma-separated)"
                value={draft.subcategories}
                onChange={(v) => set('subcategories', v)}
                placeholder="deep-learning, python"
              />

              {/* Last verified date */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">Last Verified At (YYYY-MM-DD)</label>
                <input
                  value={draft.lastVerifiedAt}
                  onChange={(e) => set('lastVerifiedAt', e.target.value)}
                  placeholder="2025-01-15"
                  className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground outline-none ring-primary/30 focus:ring-2"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                {(
                  [
                    ['examRequired', 'Exam required'],
                    ['linkedinSupported', 'LinkedIn-friendly'],
                    ['resumeRecommended', 'Resume recommended'],
                    ['isFeatured', 'Featured'],
                    ['isPublished', 'Published'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={Boolean(draft[key])}
                      onChange={(e) => set(key, e.target.checked)}
                      className="h-4 w-4 rounded accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {/* Source notes */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                  Source notes (internal only — not shown to users)
                </label>
                <textarea
                  value={draft.sourceNotes ?? ''}
                  onChange={(e) => set('sourceNotes', e.target.value)}
                  placeholder="Where was this verified? e.g. 'Exam fee verified via official AWS pricing page Aug 2025'"
                  rows={2}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-foreground outline-none ring-primary/30 focus:ring-2 resize-none"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirm ── */}
      <ConfirmModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete certification?"
        description={`This will permanently delete "${selected?.name}". This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => void handleDelete()}
        confirmVariant="danger"
      />
    </div>
  )
}
