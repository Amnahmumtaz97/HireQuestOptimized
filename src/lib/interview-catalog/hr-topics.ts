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

export const DEFAULT_INTERVIEW_TYPES = ['Technical', 'Behavioral', 'HR Interview'] as const

export type AdminInterviewTypeLabel = (typeof DEFAULT_INTERVIEW_TYPES)[number]

export function isHrInterviewEnabled(interviewTypes: string[] | undefined): boolean {
  if (!interviewTypes?.length) return true
  return interviewTypes.some((type) => type.trim().toLowerCase().includes('hr'))
}

/**
 * Pre-HR seeds stored only Technical + Behavioral. Upgrade those to include HR Interview
 * without overriding an admin who intentionally removed types from a custom set.
 */
export function withLegacyHrInterviewType(interviewTypes: string[] | undefined): string[] {
  if (!interviewTypes?.length) return [...DEFAULT_INTERVIEW_TYPES]

  const hasHr = interviewTypes.some((type) => type.trim().toLowerCase().includes('hr'))
  if (hasHr) return interviewTypes

  const lower = interviewTypes.map((type) => type.trim().toLowerCase())
  const hasTechnical = lower.some((type) => type.includes('technical'))
  const hasBehavioral = lower.some((type) => type.includes('behavioral'))
  if (hasTechnical && hasBehavioral) {
    return [...interviewTypes, 'HR Interview']
  }

  return interviewTypes
}

export function resolveAvailableInterviewTypes(
  interviewTypesLists: Array<string[] | undefined>,
): Array<'technical' | 'behavioral' | 'both' | 'hr'> {
  const labels = new Set(
    interviewTypesLists
      .flatMap((types) => types ?? [])
      .map((type) => type.trim().toLowerCase()),
  )

  const available: Array<'technical' | 'behavioral' | 'both' | 'hr'> = []
  const hasTechnical = [...labels].some((label) => label.includes('technical'))
  const hasBehavioral = [...labels].some((label) => label.includes('behavioral'))

  if (hasTechnical) available.push('technical')
  if (hasBehavioral) available.push('behavioral')
  if (hasTechnical && hasBehavioral) available.push('both')

  return available.length > 0 ? available : ['technical', 'behavioral', 'both']
}
