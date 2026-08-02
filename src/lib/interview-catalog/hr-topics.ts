import { INTERVIEW_TYPE_LABELS, INTERVIEW_TYPE_UI_ORDER, type InterviewTypeKey } from '@/lib/interview-config/interview-types'

/** Default HR question categories used when a specialization has no custom HR topics. */
export const DEFAULT_HR_TOPICS = [
  'Self Introduction',
  'Strengths & Weaknesses',
  'Career Goals',
  'Teamwork',
  'Communication',
  'Conflict Resolution',
  'Leadership',
  'Time Management',
  'Adaptability',
  'Problem Solving',
  'Motivation',
  'Handling Pressure',
  'Workplace Ethics',
  'Company Knowledge',
  'Relocation',
  'Salary Expectations',
  'Availability',
  'Common HR Scenarios',
] as const

/** Labels stored on specializations and toggled in Track Config admin (from SSoT). */
export const DEFAULT_INTERVIEW_TYPES = [
  INTERVIEW_TYPE_LABELS.technical,
  INTERVIEW_TYPE_LABELS.behavioral,
  INTERVIEW_TYPE_LABELS.hr,
  INTERVIEW_TYPE_LABELS.coding,
  INTERVIEW_TYPE_LABELS.system_design,
] as const

export type AdminInterviewTypeLabel = (typeof DEFAULT_INTERVIEW_TYPES)[number]

/** Keys exposed when Track Config gates the wizard (includes legacy `both`). */
export type ResolvedInterviewType = InterviewTypeKey | 'both'

export function isHrInterviewEnabled(interviewTypes: string[] | undefined): boolean {
  if (!interviewTypes?.length) return true
  return interviewTypes.some((type) => type.trim().toLowerCase().includes('hr'))
}

export function isCodingInterviewEnabled(interviewTypes: string[] | undefined): boolean {
  if (!interviewTypes?.length) return true
  return interviewTypes.some((type) => type.trim().toLowerCase().includes('coding'))
}

/**
 * Upgrade older seeds (Technical + Behavioral only) to include Screening HR + Coding
 * without wiping intentional admin customizations that already include them.
 */
export function withLegacyHrInterviewType(interviewTypes: string[] | undefined): string[] {
  if (!interviewTypes?.length) return [...DEFAULT_INTERVIEW_TYPES]

  let next = [...interviewTypes]
  const lower = next.map((type) => type.trim().toLowerCase())
  const hasHr = lower.some((type) => type.includes('hr'))
  const hasTechnical = lower.some((type) => type.includes('technical'))
  const hasBehavioral = lower.some((type) => type.includes('behavioral'))
  const hasCoding = lower.some((type) => type.includes('coding'))
  const hasSystemDesign = lower.some(
    (type) => type.includes('system design') || type.includes('system_design'),
  )

  if (!hasHr && hasTechnical && hasBehavioral) {
    next = [...next, INTERVIEW_TYPE_LABELS.hr]
  }
  if (!hasCoding && hasTechnical) {
    next = [...next, INTERVIEW_TYPE_LABELS.coding]
  }
  if (!hasSystemDesign && hasTechnical) {
    next = [...next, INTERVIEW_TYPE_LABELS.system_design]
  }

  return next
}

export function resolveAvailableInterviewTypes(
  interviewTypesLists: Array<string[] | undefined>,
): ResolvedInterviewType[] {
  const labels = new Set(
    interviewTypesLists
      .flatMap((types) => types ?? [])
      .map((type) => type.trim().toLowerCase()),
  )

  if (labels.size === 0) {
    return [...INTERVIEW_TYPE_UI_ORDER]
  }

  const hasTechnical = [...labels].some((label) => label.includes('technical'))
  const hasBehavioral = [...labels].some((label) => label.includes('behavioral'))
  const hasHr = [...labels].some((label) => label.includes('hr'))
  const hasCoding = [...labels].some((label) => label.includes('coding'))
  const hasSystemDesign = [...labels].some(
    (label) => label.includes('system design') || label.includes('system_design'),
  )
  const hasMixed = [...labels].some((label) => label.includes('mixed') || label === 'both')

  const available: ResolvedInterviewType[] = []
  for (const key of INTERVIEW_TYPE_UI_ORDER) {
    if (key === 'technical' && hasTechnical) available.push(key)
    else if (key === 'coding' && hasCoding) available.push(key)
    else if (key === 'system_design' && hasSystemDesign) available.push(key)
    else if (key === 'behavioral' && hasBehavioral) available.push(key)
    else if (key === 'hr' && hasHr) available.push(key)
    else if (key === 'mixed' && (hasMixed || (hasTechnical && hasBehavioral))) available.push(key)
  }

  // Legacy alias for older callers that still check `both`
  if (hasTechnical && hasBehavioral && !available.includes('mixed')) {
    available.push('both')
  } else if (available.includes('mixed')) {
    // keep mixed; callers that filter OPTIONS also accept `both` via availableTypes
  }

  return available.length > 0 ? available : [...INTERVIEW_TYPE_UI_ORDER]
}
