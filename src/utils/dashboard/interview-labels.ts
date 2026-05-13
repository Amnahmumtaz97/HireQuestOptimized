import type { InterviewConfig } from '@/components/app/dashboard/types'
import { INDUSTRY_ICONS, ROLE_ICONS } from '@/lib/icon-mapping'

/** Consistent Title Case labels for session metadata (match difficulty style). */

const TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  both: 'Both',
}

const DIFF_LABELS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export function formatInterviewTypeLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const k = value.trim().toLowerCase()
  if (TYPE_LABELS[k]) return TYPE_LABELS[k]
  return value.replace(/^\w/, (c) => c.toUpperCase())
}

export function formatDifficultyLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const k = value.trim().toLowerCase()
  if (DIFF_LABELS[k]) return DIFF_LABELS[k]
  return value.replace(/^\w/, (c) => c.toUpperCase())
}

function humanizeSlugKey(key: string): string {
  return key
    .split(/[_\s]+/)
    .filter(Boolean)
    .flatMap((segment) => {
      const splitCamel = segment.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      return splitCamel.split(/[\s_-]+/).filter(Boolean)
    })
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Human-readable role name for UI (prefers admin config label, then icon map, then slug words).
 * Avoids showing raw abbreviations like "appsec" when a full label exists.
 */
export function formatRoleCategoryDisplay(
  industryKey: string,
  roleCategoryKey: string,
  configs?: InterviewConfig[] | null,
): string {
  const rc = roleCategoryKey?.trim() ?? ''
  if (!rc) return '—'

  const ind = industryKey?.trim() ?? ''
  const industry = configs?.find((c) => c.industryKey === ind)
  const fromConfig = industry?.roleCategories.find((r) => r.key === rc)?.label?.trim()
  if (fromConfig) return fromConfig

  const fromIcons = ROLE_ICONS[rc]?.label
  if (fromIcons) return fromIcons

  return humanizeSlugKey(rc)
}

/** Human-readable industry name (prefers config label, then industry icon map, then slug). */
export function formatIndustryDisplay(industryKey: string, configs?: InterviewConfig[] | null): string {
  const ik = industryKey?.trim() ?? ''
  if (!ik) return '—'

  const fromConfig = configs?.find((c) => c.industryKey === ik)?.industryLabel?.trim()
  if (fromConfig) return fromConfig

  const fromIcons = INDUSTRY_ICONS[ik]?.label
  if (fromIcons) return fromIcons

  return humanizeSlugKey(ik)
}
