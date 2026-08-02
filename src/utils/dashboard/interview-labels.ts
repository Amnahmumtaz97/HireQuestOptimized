import type { InterviewConfig } from '@/components/app/dashboard/types'
import { INDUSTRY_ICONS, ROLE_ICONS } from '@/lib/icon-mapping'
import { parseRoleRef } from '@/lib/interview-scope'
import { formatInterviewTypeKeyLabel } from '@/lib/interview-config/interview-types'
import { formatSessionDifficultyLabel } from '@/lib/interview-config/difficulty'

/** Consistent Title Case labels for session metadata (match difficulty style). */

const QUESTION_TYPE_LABELS: Record<string, string> = {
  technical: 'Technical',
  behavioral: 'Behavioral',
  hr: 'Screening HR',
  coding: 'Coding',
  system_design: 'System Design',
}

export function formatInterviewTypeLabel(value: string | null | undefined): string {
  return formatInterviewTypeKeyLabel(value)
}

export function formatQuestionTypeLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const k = value.trim().toLowerCase()
  if (QUESTION_TYPE_LABELS[k]) return QUESTION_TYPE_LABELS[k]
  return formatInterviewTypeKeyLabel(value)
}

export function formatDifficultyLabel(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  return formatSessionDifficultyLabel(value)
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

  if (rc === 'general') return 'General practice'

  const ind = industryKey?.trim() ?? ''
  const industry = configs?.find((c) => c.industryKey === ind)
  const fromConfig = industry?.roleCategories.find((r) => r.key === rc)?.label?.trim()
  if (fromConfig) return fromConfig

  const fromIcons = ROLE_ICONS[rc]?.label
  if (fromIcons) return fromIcons

  return humanizeSlugKey(rc)
}

export function formatDepartmentsDisplay(
  departmentKeys: string[] | null | undefined,
  configs?: InterviewConfig[] | null,
  options?: { selectAll?: boolean; totalAvailable?: number },
): string {
  if (options?.selectAll) {
    const total = options.totalAvailable
    return total != null && total > 0 ? `All departments (${total})` : 'All departments'
  }

  const keys = (departmentKeys ?? []).filter(Boolean)
  if (keys.length === 0) return '—'
  if (keys.length === 1) return formatIndustryDisplay(keys[0], configs)
  const labels = keys.map((key) => formatIndustryDisplay(key, configs))
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`
}

/** @deprecated Use formatDepartmentsDisplay */
export const formatIndustriesDisplay = formatDepartmentsDisplay

export function formatSpecializationRefDisplay(ref: string, configs?: InterviewConfig[] | null): string {
  return formatRoleRefDisplay(ref, configs)
}

export function formatSpecializationsDisplay(
  departmentKey: string,
  specializationKeys: string[] | null | undefined,
  configs?: InterviewConfig[] | null,
  options?: { selectAll?: boolean; totalAvailable?: number; specializationRefs?: string[] },
): string {
  if (options?.selectAll) {
    const total = options.totalAvailable
    return total != null && total > 0 ? `All specializations (${total})` : 'All specializations'
  }

  const refs = options?.specializationRefs?.filter(Boolean)
  if (refs && refs.length > 0) {
    if (refs.length === 1) return formatSpecializationRefDisplay(refs[0], configs)
    const labels = refs.map((ref) => formatSpecializationRefDisplay(ref, configs))
    if (labels.length <= 2) return labels.join(', ')
    return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`
  }

  const keys = (specializationKeys ?? []).filter(Boolean)
  if (keys.length === 0) return '—'
  if (keys.length === 1) {
    return formatRoleCategoryDisplay(departmentKey, keys[0], configs)
  }
  const labels = keys.map((key) => formatRoleCategoryDisplay(departmentKey, key, configs))
  if (labels.length <= 2) return labels.join(', ')
  return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`
}

export function formatRoleRefDisplay(ref: string, configs?: InterviewConfig[] | null): string {
  const parsed = parseRoleRef(ref)
  if (!parsed) {
    return formatRoleCategoryDisplay('', ref, configs)
  }
  const roleLabel = formatRoleCategoryDisplay(parsed.departmentKey, parsed.specializationKey, configs)
  if (!configs || configs.length <= 1) return roleLabel
  const industryLabel = formatIndustryDisplay(parsed.departmentKey, configs)
  return `${industryLabel} / ${roleLabel}`
}

/** @deprecated Use formatSpecializationsDisplay */
export function formatRoleCategoriesDisplay(
  industryKey: string,
  roleCategoryKeys: string[] | null | undefined,
  configs?: InterviewConfig[] | null,
  options?: { selectAll?: boolean; totalAvailable?: number; roleRefs?: string[] },
): string {
  return formatSpecializationsDisplay(industryKey, roleCategoryKeys, configs, {
    selectAll: options?.selectAll,
    totalAvailable: options?.totalAvailable,
    specializationRefs: options?.roleRefs,
  })
}

export function formatTopicsDisplay(
  topics: string[],
  options?: { selectAll?: boolean; totalAvailable?: number },
): string {
  if (options?.selectAll) {
    const total = options.totalAvailable
    return total != null && total > 0 ? `All topics (${total})` : 'All topics'
  }
  if (topics.length === 0) return '—'
  if (topics.length <= 4) return topics.join(', ')
  return `${topics.slice(0, 4).join(', ')} +${topics.length - 4} more`
}

/** Human-readable industry name (prefers config label, then industry icon map, then slug). */
export function formatIndustryDisplay(industryKey: string, configs?: InterviewConfig[] | null): string {
  const ik = industryKey?.trim() ?? ''
  if (!ik) return '—'

  if (ik === 'practice') return 'Coding practice'

  const fromConfig = configs?.find((c) => c.industryKey === ik)?.industryLabel?.trim()
  if (fromConfig) return fromConfig

  const fromIcons = INDUSTRY_ICONS[ik]?.label
  if (fromIcons) return fromIcons

  return humanizeSlugKey(ik)
}

/**
 * Title line for interview list/cards. Coding / non-catalog sessions show type + categories
 * instead of Practice · General placeholders.
 */
export function formatInterviewSessionTitle(session: {
  interviewType?: string | null
  industryKey?: string | null
  roleCategoryKey?: string | null
  topics?: string[] | null
  codingCategories?: string[] | null
  behavioralCompetencies?: string[] | null
  systemDesignTopics?: string[] | null
  hrSections?: string[] | null
}, configs?: InterviewConfig[] | null): string {
  const type = (session.interviewType || '').trim().toLowerCase()

  if (type === 'coding') {
    const cats = (session.codingCategories?.length
      ? session.codingCategories
      : session.topics) ?? []
    const scope = formatTopicsDisplay(cats.filter(Boolean))
    return scope === '—' ? 'Coding' : `Coding · ${scope}`
  }

  if (type === 'behavioral') {
    const cats = (session.behavioralCompetencies?.length
      ? session.behavioralCompetencies
      : session.topics) ?? []
    const scope = formatTopicsDisplay(cats.filter(Boolean))
    return scope === '—' ? 'Behavioral' : `Behavioral · ${scope}`
  }

  if (type === 'hr') {
    const cats = (session.hrSections?.length ? session.hrSections : session.topics) ?? []
    const scope = formatTopicsDisplay(cats.filter(Boolean))
    return scope === '—' ? 'Screening HR' : `Screening HR · ${scope}`
  }

  if (type === 'system_design') {
    const cats = (session.systemDesignTopics?.length
      ? session.systemDesignTopics
      : session.topics) ?? []
    const scope = formatTopicsDisplay(cats.filter(Boolean))
    return scope === '—' ? 'System Design' : `System Design · ${scope}`
  }

  if (type === 'mixed' || type === 'both') {
    const cats = session.topics ?? []
    const scope = formatTopicsDisplay(cats.filter(Boolean))
    return scope === '—' ? 'Mixed' : `Mixed · ${scope}`
  }

  const industry = session.industryKey || ''
  const role = session.roleCategoryKey || ''
  if (industry === 'practice' || role === 'general') {
    const scope = formatTopicsDisplay((session.topics ?? []).filter(Boolean))
    const typeLabel = formatInterviewTypeLabel(session.interviewType)
    return scope === '—' ? typeLabel : `${typeLabel} · ${scope}`
  }

  return formatRoleCategoryDisplay(industry, role, configs)
}
