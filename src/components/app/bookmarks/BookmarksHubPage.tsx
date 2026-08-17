'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Bookmark, Play } from 'lucide-react'
import { AlertBanner } from '@/components/ui/alert-banner'
import { BounceLoader } from '@/components/ui/bounce-loader'
import { CertificationCard } from '@/components/app/certifications/CertificationCard'
import { PathCard } from '@/components/app/learning-paths/PathCard'
import { useCertBookmarks } from '@/components/app/certifications/useCertBookmarks'
import { usePathBookmarks } from '@/hooks/usePathBookmarks'
import { useTopicBookmarks } from '@/hooks/useTopicBookmarks'
import type { Certification } from '@/components/app/certifications/types'
import type { LearningPath } from '@/components/app/learning-paths/types'
import {
  practiceHrefForBankItem,
  type QuestionBankItem,
} from '@/lib/interview-config/question-bank'
import { INTERVIEW_TYPE_LABELS, interviewTypeIcon } from '@/lib/interview-config/interview-types'

type Tab = 'certs' | 'paths' | 'topics'

export function BookmarksHubPage() {
  const { ids: certIds, isSaved: isCertSaved, toggle: toggleCert } = useCertBookmarks()
  const { ids: pathIds, isSaved: isPathSaved, toggle: togglePath } = usePathBookmarks()
  const { items: topicItems, toggle: toggleTopic } = useTopicBookmarks()
  const [tab, setTab] = useState<Tab>('certs')
  const [certs, setCerts] = useState<Certification[]>([])
  const [paths, setPaths] = useState<LearningPath[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const certIdList = useMemo(() => [...certIds], [certIds])
  const pathIdList = useMemo(() => [...pathIds], [pathIds])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [certRes, pathRes] = await Promise.all([
          certIdList.length
            ? fetch(`/api/certifications?ids=${encodeURIComponent(certIdList.join(','))}&limit=36`)
            : Promise.resolve(null),
          pathIdList.length
            ? fetch(`/api/paths?ids=${encodeURIComponent(pathIdList.join(','))}&limit=24`)
            : Promise.resolve(null),
        ])
        if (certRes) {
          const data = await certRes.json()
          if (!certRes.ok) throw new Error(data.message || 'Failed to load credentials')
          if (!cancelled) setCerts((data.certifications ?? []) as Certification[])
        } else if (!cancelled) setCerts([])
        if (pathRes) {
          const data = await pathRes.json()
          if (!pathRes.ok) throw new Error(data.message || 'Failed to load paths')
          if (!cancelled) setPaths((data.paths ?? []) as LearningPath[])
        } else if (!cancelled) setPaths([])
        if (!cancelled) setError('')
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load bookmarks')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [certIdList, pathIdList])

  const tabs: Array<{ id: Tab; label: string; count: number }> = [
    { id: 'certs', label: 'Credentials', count: certIdList.length },
    { id: 'paths', label: 'Paths', count: pathIdList.length },
    { id: 'topics', label: 'Topics', count: topicItems.length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              'hq-panel-btn hq-segment-tab btn-micro',
              tab === t.id ? 'hq-segment-tab--active hq-panel-btn--active' : '',
            ].join(' ')}
          >
            {t.label}
            <span className="ml-1.5 text-[10px] opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      {error ? <AlertBanner variant="error">{error}</AlertBanner> : null}

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <BounceLoader label="Loading bookmarks" />
        </div>
      ) : tab === 'certs' ? (
        certs.length === 0 ? (
          <EmptyState
            copy="Bookmark credentials from the certifications catalog."
            href="/app/learning-paths/certifications"
            cta="Browse credentials"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {certs.map((cert) => (
              <CertificationCard
                key={cert.id}
                cert={cert}
                saved={isCertSaved(cert.id)}
                onToggleSave={toggleCert}
              />
            ))}
          </div>
        )
      ) : tab === 'paths' ? (
        paths.length === 0 ? (
          <EmptyState
            copy="Bookmark a learning path from Overview or the catalog."
            href="/app/learning-paths"
            cta="Browse paths"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {paths.map((path) => (
              <PathCard
                key={path.id}
                path={path}
                saved={isPathSaved(path.id)}
                onToggleSave={togglePath}
              />
            ))}
          </div>
        )
      ) : topicItems.length === 0 ? (
        <EmptyState
          copy="Bookmark topics in the question bank to practice them later."
          href="/app/question-bank"
          cta="Open question bank"
        />
      ) : (
        <div className="hq-ilist">
          {topicItems.map((item) => (
            <TopicBookmarkRow key={item.id} item={item} onRemove={() => toggleTopic(item)} />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ copy, href, cta }: { copy: string; href: string; cta: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-5 py-14 text-center">
      <p className="text-sm text-muted-foreground">{copy}</p>
      <Link href={href} className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
        {cta}
      </Link>
    </div>
  )
}

function TopicBookmarkRow({
  item,
  onRemove,
}: {
  item: QuestionBankItem
  onRemove: () => void
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
          <span className="hq-ilist-sub">
            {INTERVIEW_TYPE_LABELS[item.kind as keyof typeof INTERVIEW_TYPE_LABELS] ?? item.kind}
            {item.source ? ` · ${item.source}` : ''}
          </span>
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          <Play className="h-3.5 w-3.5" />
          Practice
        </span>
      </Link>
      <button type="button" className="hq-ilist-more" aria-label="Remove bookmark" onClick={onRemove}>
        <Bookmark className="h-4 w-4" fill="currentColor" />
      </button>
    </div>
  )
}
