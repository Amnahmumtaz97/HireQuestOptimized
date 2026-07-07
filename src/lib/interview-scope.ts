/**
 * Backward-compatible re-exports. Prefer `@/lib/interview-catalog` for new code.
 */
export {
  SCOPE_REF_SEP as ROLE_REF_SEP,
  assignTopicsEvenly,
  averageTechnicalRatio as averageTechnicalRatio,
  anySpecializationHasDuration as anyRoleHasDuration,
  buildScopedSpecializations as buildScopedRoleOptions,
  filterDepartmentsBySearch,
  filterScopedSpecializationsBySearch,
  mergeTopicsFromSpecializations as mergeTopicsFromRoles,
  normalizeSpecializationRefs as normalizeRoleRefs,
  parseSpecializationRef as parseRoleRef,
  resolveDepartmentKeys as resolveIndustryKeys,
  resolveSpecializationRefs as resolveRoleRefs,
  resolveSpecializationsFromRefs as resolveRolesFromRefs,
  resolveTopicsForInterview,
  toSpecializationRef as toRoleRef,
  unionDurationOptions,
  type InterviewTypeScope,
  type ResolvedInterviewScope,
  type ScopedSpecialization as ScopedRoleCategory,
} from '@/lib/interview-catalog/resolve'
