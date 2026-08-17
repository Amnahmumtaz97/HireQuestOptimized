'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Play, Search } from 'lucide-react'
import { AlertBanner } from '@/components/ui/alert-banner'
import { BounceLoader } from '@/components/ui/bounce-loader'
import type { DepartmentConfig } from '@/lib/interview-catalog/types'
import {
  buildQuestionBank,
  practiceHrefForBankItem,
  type QuestionBankItem,
  type QuestionBankKind,
} from '@/lib/interview-config/question-bank'
import { INTERVIEW_TYPE_LABELS, interviewTypeIcon } from '@/lib/interview-config/interview-types'
import { useTopicBookmarks } from '@/hooks/useTopicBookmarks'

const KINDS: Array<QuestionBankKind | 'all'> = [
  'all',
  'technical',
  'coding',
  'system_design',
  'behavioral',
  'hr',
]

export function QuestionBankPage() {
  const [departments, setDepartments] = useState<DepartmentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<(typeof KINDS)[number]>('all')
  const { isSaved, toggle } = useTopicBookmarks()

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch('/api/interview-config')
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load catalog')
        if (!cancelled) setDepartments((data.departments ?? []) as DepartmentConfig[])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load question bank')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const bank = useMemo(() => buildQuestionBank(departments), [departments])
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return bank.filter((item) => {
      if (kind !== 'all' && item.kind !== kind) return false
      if (!q) return true
      return (
        item.label.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.kind.toLowerCase().includes(q)
      )
    })
  }, [bank, kind, query])

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center">
        <BounceLoader label="Loading question bank" />
      </div>
    )
  }

  if (error) return <AlertBanner variant="error">{error}</AlertBanner>

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search topics…"
            className="hq-filter-field w-full pl-9"
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {KINDS.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={['hq-panel-btn hq-segment-tab btn-micro', kind === k ? 'hq-segment-tab--active hq-panel-btn--active' : ''].join(' ')}
            >
              {k === 'all' ? 'All' : INTERVIEW_TYPE_LABELS[k]}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{filtered.length}</span> topics
        {kind !== 'all' ? ` in ${INTERVIEW_TYPE_LABELS[kind]}` : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-5 py-14 text-center text-sm text-muted-foreground">
          No topics match that search.
        </div>
      ) : (
        <div className="hq-ilist">
          {filtered.slice(0, 80).map((item) => (
            <BankRow
              key={item.id}
              item={item}
              saved={isSaved(item.id)}
              onToggleSave={() => toggle(item)}
            />
          ))}
        </div>
      )}
      {filtered.length > 80 ? (
        <p className="text-center text-xs text-muted-foreground">
          Showing 80 of {filtered.length}. Narrow search to see the rest.
        </p>
      ) : null}
    </div>
  )
}

function BankRow({
  item,
  saved,
  onToggleSave,
}: {
  item: QuestionBankItem
  saved: boolean
  onToggleSave: () => void
}) {
  const Icon = interviewTypeIcon(item.kind)
  return (
    <div className="hq-ilist-row">
      <Link href={practiceHrefForBankItem(item)} className="hq-ilist-main">
        <span className="hq-ilist-icon hq-ilist-icon--blue">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="hq-ilist-title">{item.label}</span>
          <span className="hq-ilist-sub">{item.source}</span>
        </span>
        <span className="hq-ilist-badges">
          <span className="hq-ilist-badge hq-ilist-badge--type">
            {INTERVIEW_TYPE_LABELS[item.kind]}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <Play className="h-3.5 w-3.5" />
          Practice
        </span>
      </Link>
      <button
        type="button"
        className="hq-ilist-more"
        aria-label={saved ? 'Remove bookmark' : 'Bookmark topic'}
        aria-pressed={saved}
        onClick={onToggleSave}
      >
        <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} />
      </button>
    </div>
  )
}
