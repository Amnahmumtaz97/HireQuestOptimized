export type {
  DepartmentConfig,
  InterviewCatalog,
  SpecializationConfig,
} from '@/lib/interview-catalog/types'

export { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'

export {
  SCOPE_REF_SEP,
  assignTopicsEvenly,
  anySpecializationHasDuration,
  averageTechnicalRatio,
  buildScopedSpecializations,
  filterDepartmentsBySearch,
  filterScopedSpecializationsBySearch,
  mergeTopicsFromSpecializations,
  normalizeSpecializationRefs,
  parseRoleRef,
  parseSpecializationRef,
  resolveDepartmentKeys,
  resolveSpecializationRefs,
  resolveSpecializationsFromRefs,
  resolveTopicsForInterview,
  toRoleRef,
  toSpecializationRef,
  unionDurationOptions,
  type InterviewTypeScope,
  type ResolvedInterviewScope,
  type ScopedSpecialization,
  INTERVIEW_CATALOG,
} from '@/lib/interview-catalog/resolve'

import { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'

export { buildComputerScienceDepartmentFromLegacy } from '@/lib/interview-catalog/legacy-cs'
export { loadInterviewCatalogDepartments, syncCatalogFromStatic, ensureCatalogSeededFromStatic } from '@/lib/interview-catalog/load'
export type { DepartmentDto, DepartmentPayload, SpecializationPayload } from '@/lib/interview-catalog/admin'
