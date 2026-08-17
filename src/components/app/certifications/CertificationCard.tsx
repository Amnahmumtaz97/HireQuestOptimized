'use client'

import Link from 'next/link'
import { BarChart2, Bookmark, Clock3 } from 'lucide-react'
import {
  CERT_CATEGORY_LABELS,
  CERT_LEVEL_LABELS,
} from '@/lib/certifications/constants'
import { ProviderLogo } from './ProviderLogo'
import type { Certification } from './types'
import type { CertCategory } from '@/lib/certifications/constants'

type CertificationCardProps = {
  cert: Certification
  saved?: boolean
  onToggleSave?: (id: string) => void
}

function hoursLabel(hours: number | null): string | null {
  if (typeof hours !== 'number' || hours <= 0) return null
  return Number.isInteger(hours) ? `${hours}h` : `${hours}h`
}

function CostBadge({ costType }: { costType: string }) {
  const isFree = costType === 'free'
  return (
    <span className={isFree ? 'hq-cert-badge hq-cert-badge--free' : 'hq-cert-badge hq-cert-badge--paid'}>
      {isFree ? 'Free' : 'Paid'}
    </span>
  )
}

function SaveButton({
  saved,
  onToggle,
}: {
  saved: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className={['hq-cert-save', saved ? 'is-saved' : ''].join(' ')}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark credential'}
      aria-pressed={saved}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onToggle()
      }}
    >
      <Bookmark className="h-4 w-4" fill={saved ? 'currentColor' : 'none'} aria-hidden />
    </button>
  )
}

export function CertificationCard({
  cert,
  saved = false,
  onToggleSave,
}: CertificationCardProps) {
  const hours = hoursLabel(cert.estimatedHours)
  const levelLabel = CERT_LEVEL_LABELS[cert.level as keyof typeof CERT_LEVEL_LABELS] ?? cert.level
  const categoryLabel =
    CERT_CATEGORY_LABELS[cert.category as CertCategory] ?? cert.category

  return (
    <Link
      href={`/app/learning-paths/certifications/${cert.id}`}
      data-category={cert.category}
      className="hq-cert-card"
    >
      <div className="hq-cert-hero">
        <div className="hq-cert-top">
          <div className="hq-cert-brand">
            <ProviderLogo
              slug={cert.providerSlug}
              name={cert.provider}
              size="h-9 w-9"
              iconSize="h-5 w-5"
            />
            <span className="hq-cert-provider">{cert.provider}</span>
          </div>
          <CostBadge costType={cert.costType} />
        </div>

        <h3 className="hq-cert-title">{cert.name}</h3>

        <div className="hq-cert-tags">
          <span className="hq-cert-level">
            <BarChart2 className="h-3.5 w-3.5" aria-hidden />
            {levelLabel}
          </span>
          <span className="hq-cert-topic">{categoryLabel}</span>
        </div>
      </div>

      <div className="hq-cert-foot">
        <div className="hq-cert-foot-meta">
          {hours ? (
            <span>
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              {hours}
            </span>
          ) : null}
          <span>{cert.examRequired ? 'Exam required' : 'No exam'}</span>
        </div>
        {onToggleSave ? (
          <SaveButton saved={saved} onToggle={() => onToggleSave(cert.id)} />
        ) : null}
      </div>
    </Link>
  )
}
