'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Clock,
  FileText,
  Award,
  CheckCircle2,
  XCircle,
  Tag,
  BookOpen,
  Briefcase,
  Info,
  DollarSign,
  CalendarClock,
  Route,
} from 'lucide-react'
import {
  CERT_COST_LABELS,
  CERT_COST_COLORS,
  CERT_CREDENTIAL_LABELS,
  CERT_LEVEL_LABELS,
  CERT_PORTFOLIO_VALUE_LABELS,
  CERT_PORTFOLIO_COLORS,
  CERT_CATEGORY_LABELS,
} from '@/lib/certifications/constants'
import { PATH_CATEGORY_LABELS, type PathCategory } from '@/lib/learning-paths/constants'
import type { RelatedPathSummary } from '@/lib/learning-paths/related-certs'
import { AlertBanner } from '@/components/ui/alert-banner'
import { ProviderLogo } from './ProviderLogo'
import type { Certification } from './types'

function isDataStale(lastVerifiedAt: string): boolean {
  return Date.now() - new Date(lastVerifiedAt).getTime() > 180 * 24 * 60 * 60 * 1000
}

function SectionHeading({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <Icon className="h-4 w-4 text-primary" />
      {children}
    </h2>
  )
}

// ── At-a-glance summary card ──────────────────────────────────────────────────
function GlanceCell({
  icon: Icon,
  label,
  value,
  valueClass,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
  valueClass?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-input/10 px-3 py-4 text-center">
      <Icon className="h-5 w-5 text-primary/70" />
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={['text-sm font-semibold leading-tight text-foreground', valueClass ?? ''].join(' ')}>
        {value}
      </div>
    </div>
  )
}

export function CertificationDetailPage({ certId }: { certId: string }) {
  const [cert, setCert] = useState<Certification | null>(null)
  const [relatedPaths, setRelatedPaths] = useState<RelatedPathSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/certifications/${certId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Failed to load')
        if (!cancelled) {
          setCert(data.certification)
          setRelatedPaths(Array.isArray(data.relatedPaths) ? data.relatedPaths : [])
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load certification')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [certId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-input/40" />
        <div className="h-36 animate-pulse rounded-2xl bg-input/30 lg:hidden" />
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="h-80 animate-pulse rounded-2xl bg-input/30" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-input/30" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !cert) {
    return <AlertBanner variant="error">{error || 'Certification not found.'}</AlertBanner>
  }

  const costColors = CERT_COST_COLORS[cert.costType as keyof typeof CERT_COST_COLORS] ?? {
    bg: 'bg-muted/20', text: 'text-muted-foreground', border: 'border-border',
  }
  const pvColors = CERT_PORTFOLIO_COLORS[cert.portfolioValue as keyof typeof CERT_PORTFOLIO_COLORS] ?? {
    bg: 'bg-muted/20', text: 'text-muted-foreground',
  }
  const stale = isDataStale(cert.lastVerifiedAt)
  const verifiedLabel = new Date(cert.lastVerifiedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/app/learning-paths" className="hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          Learning Paths
        </Link>
        <span>/</span>
        <Link href="/app/learning-paths/certifications" className="hover:text-foreground">
          Certifications
        </Link>
        <span>/</span>
        <span className="truncate text-foreground">{cert.name}</span>
      </nav>

      {/* ── Staleness warning ── */}
      {stale ? (
        <AlertBanner variant="warning">
          This information was last verified in {verifiedLabel}. Please confirm current pricing and
          availability on the official provider page before enrolling.
        </AlertBanner>
      ) : null}

      {/* ── Mobile hero strip (hidden on lg+) ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card lg:hidden">
        {/* Accent bar */}
        <div
          className={[
            'h-[3px] w-full',
            cert.costType === 'free' ? 'bg-emerald-500' :
            cert.costType === 'free-exam' || cert.costType === 'partially-free' ? 'bg-amber-500' :
            'bg-rose-500/50',
          ].join(' ')}
          aria-hidden
        />

        <div className="space-y-4 p-5">
          {/* Provider + name */}
          <div className="flex items-start gap-3">
            <ProviderLogo
              slug={cert.providerSlug}
              name={cert.provider}
              size="h-12 w-12"
              iconSize="h-7 w-7"
            />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] text-muted-foreground">{cert.provider}</div>
              <h1 className="text-base font-semibold leading-snug text-foreground">{cert.name}</h1>
            </div>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-1.5">
            <span
              className={[
                'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                costColors.bg, costColors.text, costColors.border,
              ].join(' ')}
            >
              {CERT_COST_LABELS[cert.costType as keyof typeof CERT_COST_LABELS]}
            </span>
            <span className="inline-flex items-center rounded-full border border-border bg-input/30 px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
              {CERT_LEVEL_LABELS[cert.level as keyof typeof CERT_LEVEL_LABELS]}
            </span>
            {cert.examRequired ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-input/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3 w-3" />
                Exam
              </span>
            ) : null}
            {cert.linkedinSupported ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs font-medium text-sky-400">
                <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn
              </span>
            ) : null}
          </div>

          {/* CTA */}
          <a
            href={cert.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hq-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            <ExternalLink className="h-4 w-4" />
            Open Official Page
          </a>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">

        {/* ── Left: Provider card + CTAs (desktop only) ── */}
        <aside className="hidden lg:block space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
            {/* Provider identity */}
            <div className="flex items-center gap-3">
              <ProviderLogo
                slug={cert.providerSlug}
                name={cert.provider}
                size="h-14 w-14"
                iconSize="h-8 w-8"
                className="rounded-2xl"
              />
              <div>
                <div className="text-[11px] text-muted-foreground">Provider</div>
                <div className="text-sm font-semibold text-foreground">{cert.provider}</div>
              </div>
            </div>

            {/* Key pills */}
            <div className="flex flex-wrap gap-1.5">
              <span
                className={[
                  'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
                  costColors.bg, costColors.text, costColors.border,
                ].join(' ')}
              >
                {CERT_COST_LABELS[cert.costType as keyof typeof CERT_COST_LABELS]}
              </span>
              <span className="inline-flex items-center rounded-full border border-border bg-input/30 px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                {CERT_LEVEL_LABELS[cert.level as keyof typeof CERT_LEVEL_LABELS]}
              </span>
              {cert.examRequired ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-input/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  <ShieldCheck className="h-3 w-3" />
                  Exam required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-border bg-input/30 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  No exam
                </span>
              )}
            </div>

            {/* Portfolio value */}
            <div
              className={[
                'flex items-center gap-2 rounded-xl px-3 py-2.5',
                pvColors.bg,
              ].join(' ')}
            >
              <Award className={['h-4 w-4', pvColors.text].join(' ')} />
              <div>
                <div className={['text-xs font-semibold', pvColors.text].join(' ')}>
                  {CERT_PORTFOLIO_VALUE_LABELS[cert.portfolioValue as keyof typeof CERT_PORTFOLIO_VALUE_LABELS]} Portfolio Value
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                  {cert.portfolioNote}
                </div>
              </div>
            </div>

            {/* LinkedIn + Resume */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                {cert.linkedinSupported ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                )}
                <span className={cert.linkedinSupported ? 'text-foreground' : 'text-muted-foreground'}>
                  LinkedIn Licenses & Certifications
                </span>
                {cert.linkedinSupported ? (
                  <svg className="h-3 w-3 text-sky-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {cert.resumeRecommended ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 text-muted-foreground/40" />
                )}
                <span className={cert.resumeRecommended ? 'text-foreground' : 'text-muted-foreground'}>
                  Resume recommended
                </span>
              </div>
            </div>

            {/* Expiration */}
            {cert.expiration ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5" />
                <span>
                  Validity: <strong className="text-foreground">{cert.expiration}</strong>
                </span>
              </div>
            ) : null}

            {/* Duration */}
            {cert.estimatedHours ? (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  Estimated: <strong className="text-foreground">~{cert.estimatedHours} hours</strong>
                </span>
              </div>
            ) : null}

            {/* Verified date */}
            <div className="border-t border-border/60 pt-3 text-[10px] text-muted-foreground/60">
              <time dateTime={cert.lastVerifiedAt}>
                Information verified: {verifiedLabel}
              </time>
            </div>
          </div>

          {/* CTAs */}
          <div className="space-y-2">
            <a
              href={cert.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hq-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              aria-label={`Open official ${cert.name} page (opens in new tab)`}
            >
              <ExternalLink className="h-4 w-4" />
              Open Official Page
            </a>
            {cert.credentialUrl && cert.credentialUrl !== cert.officialUrl ? (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hq-btn-outline flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
                aria-label="View credential verification page (opens in new tab)"
              >
                <ShieldCheck className="h-4 w-4" />
                Verify Credential
              </a>
            ) : null}
          </div>

          <p className="text-center text-[10px] leading-relaxed text-muted-foreground/60">
            HireQuest is not affiliated with this provider. Always verify current pricing and
            availability on the official website.
          </p>
        </aside>

        {/* ── Right: Detail sections ── */}
        <div className="space-y-6">

          {/* Name + credential type (desktop) */}
          <div className="hidden lg:block">
            <h1 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">
              {cert.name}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>{CERT_CREDENTIAL_LABELS[cert.credentialType as keyof typeof CERT_CREDENTIAL_LABELS]}</span>
              <span>·</span>
              <span>{CERT_CATEGORY_LABELS[cert.category as keyof typeof CERT_CATEGORY_LABELS]}</span>
            </div>
          </div>

          {/* Description */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <SectionHeading icon={BookOpen}>What is this?</SectionHeading>
            <p className="text-sm leading-relaxed text-muted-foreground">{cert.description}</p>
          </section>

          {/* Why it matters */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <SectionHeading icon={Info}>Why it matters</SectionHeading>
            <p className="text-sm leading-relaxed text-muted-foreground">{cert.whyItMatters}</p>
          </section>

          {/* Who is it for */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <SectionHeading icon={Briefcase}>Who is it for?</SectionHeading>
            {cert.roles.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {cert.roles.map((r) => (
                  <span
                    key={r}
                    className="rounded-full border border-border bg-input/30 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {r}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">General audience</p>
            )}
          </section>

          {/* Skills */}
          {cert.skills.length > 0 ? (
            <section className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <SectionHeading icon={Tag}>Skills demonstrated</SectionHeading>
              <div className="flex flex-wrap gap-2">
                {cert.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-border bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* ── At-a-glance summary card (replaces DetailRow list) ── */}
          <section className="rounded-2xl border border-border bg-card p-5 space-y-4">
            <SectionHeading icon={FileText}>At a glance</SectionHeading>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <GlanceCell
                icon={DollarSign}
                label="Cost"
                value={CERT_COST_LABELS[cert.costType as keyof typeof CERT_COST_LABELS]}
                valueClass={
                  cert.costType === 'free' ? 'text-emerald-400' :
                  cert.costType === 'free-exam' || cert.costType === 'partially-free' ? 'text-amber-400' :
                  'text-rose-400'
                }
              />
              <GlanceCell
                icon={Clock}
                label="Time"
                value={cert.estimatedHours ? `~${cert.estimatedHours} hrs` : 'Varies'}
              />
              <GlanceCell
                icon={ShieldCheck}
                label="Exam"
                value={cert.examRequired ? 'Required' : 'Not required'}
                valueClass={cert.examRequired ? 'text-amber-400' : 'text-emerald-400'}
              />
              <GlanceCell
                icon={CalendarClock}
                label="Validity"
                value={cert.expiration ?? 'No expiry'}
              />
            </div>

            {/* Additional details */}
            <div className="grid grid-cols-1 gap-2 border-t border-border/60 pt-3 sm:grid-cols-2 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-3.5 w-3.5 shrink-0" />
                <span>
                  Credential:{' '}
                  <strong className="text-foreground">
                    {CERT_CREDENTIAL_LABELS[cert.credentialType as keyof typeof CERT_CREDENTIAL_LABELS]}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {cert.linkedinSupported ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                )}
                <span className={cert.linkedinSupported ? 'text-foreground' : ''}>
                  {cert.linkedinSupported ? 'LinkedIn supported' : 'No LinkedIn badge'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                {cert.resumeRecommended ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                )}
                <span className={cert.resumeRecommended ? 'text-foreground' : ''}>
                  {cert.resumeRecommended ? 'Resume recommended' : 'Not resume-recommended'}
                </span>
              </div>
            </div>

            {/* Data quality notice */}
            <div className="rounded-xl border border-border bg-input/5 px-3 py-2.5 text-[10px] leading-relaxed text-muted-foreground/70">
              <strong className="text-muted-foreground">Data accuracy:</strong> Last verified{' '}
              {verifiedLabel}. Always confirm details on the official provider page before enrolling.
              {stale ? (
                <span className="ml-1 text-amber-400 font-medium">
                  This record is over 6 months old — please double-check the official page.
                </span>
              ) : null}
            </div>
          </section>

          {/* Mobile CTAs (below content, hidden on lg) */}
          <div className="space-y-2 lg:hidden">
            <a
              href={cert.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hq-btn-primary flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
            >
              <ExternalLink className="h-4 w-4" />
              Open Official Page
            </a>
            {cert.credentialUrl && cert.credentialUrl !== cert.officialUrl ? (
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hq-btn-outline flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold"
              >
                <ShieldCheck className="h-4 w-4" />
                Verify Credential
              </a>
            ) : null}
            <p className="text-center text-[10px] leading-relaxed text-muted-foreground/60">
              HireQuest is not affiliated with this provider. Always verify current pricing and
              availability on the official website.
            </p>
          </div>

        </div>
      </div>

      {relatedPaths.length > 0 ? (
        <section className="space-y-3">
          <SectionHeading icon={Route}>Practice on these paths</SectionHeading>
          <p className="text-xs text-muted-foreground">
            Learning paths that match this credential&apos;s stack, category, or role.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {relatedPaths.map((path) => {
              const categoryLabel =
                PATH_CATEGORY_LABELS[path.category as PathCategory] ?? path.category
              return (
                <li key={path.id}>
                  <Link
                    href={`/app/learning-paths/${path.id}`}
                    className="flex items-start justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition hover:border-primary/40"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-foreground">{path.title}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{categoryLabel}</span>
                    </span>
                    <ArrowLeft className="mt-0.5 h-4 w-4 shrink-0 rotate-180 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
