import type { DepartmentConfig, InterviewCatalog, SpecializationConfig } from '@/lib/interview-catalog/types'
import { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'

export const SCOPE_REF_SEP = '::'

export type InterviewTypeScope = 'technical' | 'behavioral' | 'both'

export type ScopedSpecialization = SpecializationConfig & {
  departmentKey: string
  departmentLabel: string
  ref: string
}

export type ResolvedInterviewScope = {
  departmentKeys: string[]
  departmentLabels: string[]
  specializationRefs: string[]
  specializationKeys: string[]
  specializationLabels: string[]
  technicalTopics: string[]
  behavioralTopics: string[]
  topics: string[]
}

export const INTERVIEW_CATALOG: InterviewCatalog = {
  departments: INTERVIEW_CATALOG_DEPARTMENTS,
}

export function toSpecializationRef(departmentKey: string, specializationKey: string): string {
  return `${departmentKey}${SCOPE_REF_SEP}${specializationKey}`
}

export function parseSpecializationRef(
  ref: string,
): { departmentKey: string; specializationKey: string } | null {
  const idx = ref.indexOf(SCOPE_REF_SEP)
  if (idx <= 0) return null
  const departmentKey = ref.slice(0, idx)
  const specializationKey = ref.slice(idx + SCOPE_REF_SEP.length)
  if (!departmentKey || !specializationKey) return null
  return { departmentKey, specializationKey }
}

/** @deprecated Use toSpecializationRef */
export const toRoleRef = toSpecializationRef

/** @deprecated Use parseSpecializationRef */
export const parseRoleRef = parseSpecializationRef

export function resolveDepartmentKeys(
  departments: Array<{ key: string }>,
  options: { selectAllDepartments: boolean; departmentKeys: string[] },
): string[] {
  const allKeys = departments.map((d) => d.key).filter(Boolean)
  if (options.selectAllDepartments) return allKeys
  const valid = new Set(allKeys)
  return options.departmentKeys.filter((key) => valid.has(key))
}

export function buildScopedSpecializations(
  departments: DepartmentConfig[],
  departmentKeys: string[],
): ScopedSpecialization[] {
  const departmentSet = new Set(departmentKeys)
  return departments
    .filter((department) => departmentSet.has(department.key))
    .flatMap((department) =>
      (department.specializations ?? []).map((specialization) => ({
        ...specialization,
        departmentKey: department.key,
        departmentLabel: department.label,
        ref: toSpecializationRef(department.key, specialization.key),
      })),
    )
}

export function resolveSpecializationRefs(
  scopedOptions: ScopedSpecialization[],
  options: { selectAllSpecializations: boolean; specializationRefs: string[] },
): string[] {
  const allRefs = scopedOptions.map((option) => option.ref)
  if (options.selectAllSpecializations) return allRefs
  const valid = new Set(allRefs)
  return options.specializationRefs.filter((ref) => valid.has(ref))
}

export function resolveSpecializationsFromRefs(
  scopedOptions: ScopedSpecialization[],
  specializationRefs: string[],
): ScopedSpecialization[] {
  const refSet = new Set(specializationRefs)
  return scopedOptions.filter((option) => refSet.has(option.ref))
}

export function mergeTopicsFromSpecializations(
  specializations: SpecializationConfig[],
  interviewType: InterviewTypeScope,
): { technicalTopics: string[]; behavioralTopics: string[]; topics: string[] } {
  const technicalTopics = [
    ...new Set(
      specializations.flatMap((s) => s.technicalTopics ?? []).map((t) => t.trim()).filter(Boolean),
    ),
  ]
  const behavioralTopics = [
    ...new Set(
      specializations.flatMap((s) => s.behavioralTopics ?? []).map((t) => t.trim()).filter(Boolean),
    ),
  ]

  let topics: string[] = []
  if (interviewType === 'technical') topics = technicalTopics
  else if (interviewType === 'behavioral') topics = behavioralTopics
  else topics = [...new Set([...technicalTopics, ...behavioralTopics])]

  return { technicalTopics, behavioralTopics, topics }
}

export function normalizeSpecializationRefs(
  departments: DepartmentConfig[],
  options: {
    departmentKey?: string
    departmentKeys?: string[]
    selectAllDepartments?: boolean
    specializationKey?: string
    specializationKeys?: string[]
    specializationRefs?: string[]
    /** Legacy session fields */
    industryKey?: string
    industryKeys?: string[]
    roleCategoryKey?: string
    roleCategoryKeys?: string[]
    roleRefs?: string[]
  },
): string[] {
  if (options.specializationRefs?.length) return options.specializationRefs
  if (options.roleRefs?.length) return options.roleRefs

  const departmentKeys = resolveDepartmentKeys(departments, {
    selectAllDepartments: Boolean(options.selectAllDepartments),
    departmentKeys:
      options.departmentKeys?.length
        ? options.departmentKeys
        : options.industryKeys?.length
          ? options.industryKeys
          : options.departmentKey
            ? [options.departmentKey]
            : options.industryKey
              ? [options.industryKey]
              : [],
  })

  const scopedOptions = buildScopedSpecializations(departments, departmentKeys)
  const bareKeys =
    options.specializationKeys?.length
      ? options.specializationKeys
      : options.roleCategoryKeys?.length
        ? options.roleCategoryKeys
        : options.specializationKey
          ? [options.specializationKey]
          : options.roleCategoryKey
            ? [options.roleCategoryKey]
            : []

  if (bareKeys.length === 0) return []

  if (departmentKeys.length === 1) {
    return bareKeys.map((key) => toSpecializationRef(departmentKeys[0], key))
  }

  return scopedOptions
    .filter((option) => bareKeys.includes(option.key))
    .map((option) => option.ref)
}

export function resolveTopicsForInterview(
  departments: DepartmentConfig[],
  options: {
    selectAllDepartments: boolean
    departmentKeys: string[]
    interviewType: InterviewTypeScope
    selectAllSpecializations: boolean
    specializationRefs: string[]
    selectAllTopics: boolean
    topics: string[]
  },
): ResolvedInterviewScope {
  const resolvedDepartmentKeys = resolveDepartmentKeys(departments, {
    selectAllDepartments: options.selectAllDepartments,
    departmentKeys: options.departmentKeys,
  })

  const scopedOptions = buildScopedSpecializations(departments, resolvedDepartmentKeys)
  const resolvedSpecializationRefs = resolveSpecializationRefs(scopedOptions, {
    selectAllSpecializations: options.selectAllSpecializations,
    specializationRefs: options.specializationRefs,
  })
  const specializations = resolveSpecializationsFromRefs(scopedOptions, resolvedSpecializationRefs)
  const merged = mergeTopicsFromSpecializations(specializations, options.interviewType)

  const explicitTopics = options.topics.map((t) => t.trim()).filter(Boolean)
  const availableSet = new Set(merged.topics)
  const filteredExplicit = explicitTopics.filter((t) => availableSet.has(t))
  const topics = options.selectAllTopics ? merged.topics : filteredExplicit

  const departmentLabels = resolvedDepartmentKeys.map(
    (key) => departments.find((department) => department.key === key)?.label?.trim() || key,
  )

  return {
    departmentKeys: resolvedDepartmentKeys,
    departmentLabels,
    specializationRefs: resolvedSpecializationRefs,
    specializationKeys: specializations.map((s) => s.key),
    specializationLabels: specializations.map((s) =>
      resolvedDepartmentKeys.length > 1
        ? `${s.departmentLabel} / ${s.label?.trim() || s.key}`
        : s.label?.trim() || s.key,
    ),
    technicalTopics: merged.technicalTopics,
    behavioralTopics: merged.behavioralTopics,
    topics,
  }
}

export function assignTopicsEvenly(questionCount: number, topics: string[]): string[] {
  const pool = topics.length > 0 ? topics : ['General']
  if (questionCount <= 0) return []

  const perTopic = new Map<string, number>()
  const base = Math.floor(questionCount / pool.length)
  let remainder = questionCount % pool.length
  for (const topic of pool) {
    const extra = remainder > 0 ? 1 : 0
    if (remainder > 0) remainder -= 1
    perTopic.set(topic, base + extra)
  }

  const buckets = pool.map((topic) => ({
    topic,
    remaining: perTopic.get(topic) ?? 0,
  }))

  const result: string[] = []
  while (result.length < questionCount) {
    for (const bucket of buckets) {
      if (bucket.remaining <= 0) continue
      result.push(bucket.topic)
      bucket.remaining -= 1
      if (result.length >= questionCount) break
    }
  }

  return result
}

export function averageTechnicalRatio(specializations: SpecializationConfig[]): number {
  if (specializations.length === 0) return 70
  const sum = specializations.reduce((acc, s) => acc + (s.technicalQuestionRatio ?? 70), 0)
  return Math.round(sum / specializations.length)
}

export function unionDurationOptions(specializations: SpecializationConfig[]): number[] {
  return [...new Set(specializations.flatMap((s) => (s.durationEnabled ? s.durations ?? [] : [])))].sort(
    (a, b) => a - b,
  )
}

export function anySpecializationHasDuration(specializations: SpecializationConfig[]): boolean {
  return specializations.some((s) => s.durationEnabled && (s.durations?.length ?? 0) > 0)
}

export function filterDepartmentsBySearch(
  departments: DepartmentConfig[],
  query: string,
): DepartmentConfig[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return departments
  return departments.filter(
    (department) =>
      department.label.toLowerCase().includes(normalized) ||
      department.key.toLowerCase().includes(normalized),
  )
}

export function filterScopedSpecializationsBySearch(
  options: ScopedSpecialization[],
  query: string,
): ScopedSpecialization[] {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return options
  return options.filter(
    (option) =>
      option.label.toLowerCase().includes(normalized) ||
      option.departmentLabel.toLowerCase().includes(normalized) ||
      option.key.toLowerCase().includes(normalized),
  )
}
