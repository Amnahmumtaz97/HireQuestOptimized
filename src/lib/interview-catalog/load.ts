import { connectToDatabase } from '@/lib/mongoose'
import { InterviewConfigModel } from '@/models/InterviewConfig'
import type { IRoleCategoryConfig } from '@/models/InterviewConfig'
import { INTERVIEW_CATALOG_DEPARTMENTS } from '@/lib/interview-catalog/departments-data'
import {
  DEFAULT_HR_TOPICS,
  DEFAULT_INTERVIEW_TYPES,
  withLegacyHrInterviewType,
} from '@/lib/interview-catalog/hr-topics'
import { mongoDocToDepartmentDto } from '@/lib/interview-catalog/admin'
import type { DepartmentConfig, SpecializationConfig } from '@/lib/interview-catalog/types'

/** Pre-hierarchy flat "industry" keys stored in Mongo before Department → Specialization migration. */
export const LEGACY_FLAT_INDUSTRY_KEYS = [
  'software_it',
  'data_ai',
  'product',
  'cybersecurity',
  'mobile_development',
  'systems_networking',
  'databases_backend',
  'computer_science_core',
] as const

export const CANONICAL_DEPARTMENT_KEYS = new Set(
  INTERVIEW_CATALOG_DEPARTMENTS.map((department) => department.key),
)

function staticSpecToRoleCategory(spec: SpecializationConfig): IRoleCategoryConfig {
  return {
    key: spec.key,
    label: spec.label,
    interviewTypes: spec.interviewTypes?.length ? [...spec.interviewTypes] : [...DEFAULT_INTERVIEW_TYPES],
    technicalTopics: [...spec.technicalTopics],
    behavioralTopics: [...spec.behavioralTopics],
    hrTopics: [...(spec.hrTopics?.length ? spec.hrTopics : DEFAULT_HR_TOPICS)],
    technicalQuestionRatio: spec.technicalQuestionRatio,
    durationEnabled: spec.durationEnabled,
    durations: [...spec.durations],
  }
}

function mergeRoleCategory(
  existing: IRoleCategoryConfig,
  staticSpec: SpecializationConfig,
): IRoleCategoryConfig {
  return {
    ...existing,
    label: existing.label || staticSpec.label,
    technicalTopics: [
      ...new Set([...existing.technicalTopics, ...staticSpec.technicalTopics]),
    ],
    behavioralTopics: [
      ...new Set([...existing.behavioralTopics, ...staticSpec.behavioralTopics]),
    ],
    hrTopics: [
      ...new Set([
        ...(existing.hrTopics?.length ? existing.hrTopics : []),
        ...(staticSpec.hrTopics?.length ? staticSpec.hrTopics : DEFAULT_HR_TOPICS),
      ]),
    ],
    interviewTypes: withLegacyHrInterviewType(
      existing.interviewTypes?.length
        ? existing.interviewTypes
        : staticSpec.interviewTypes?.length
          ? staticSpec.interviewTypes
          : [...DEFAULT_INTERVIEW_TYPES],
    ),
    technicalQuestionRatio: existing.technicalQuestionRatio ?? staticSpec.technicalQuestionRatio,
    durationEnabled: existing.durationEnabled ?? staticSpec.durationEnabled,
    durations:
      existing.durations?.length > 0 ? existing.durations : [...staticSpec.durations],
  }
}

function mergeDepartmentRoles(
  existingRoles: IRoleCategoryConfig[],
  staticDepartment: DepartmentConfig,
): IRoleCategoryConfig[] {
  const roleMap = new Map(existingRoles.map((role) => [role.key, role]))

  for (const staticSpec of staticDepartment.specializations) {
    const current = roleMap.get(staticSpec.key)
    if (!current) {
      roleMap.set(staticSpec.key, staticSpecToRoleCategory(staticSpec))
      continue
    }
    roleMap.set(staticSpec.key, mergeRoleCategory(current, staticSpec))
  }

  return [...roleMap.values()]
}

/**
 * Ensures MongoDB contains every canonical CS/tech department with static
 * specializations and topics. Deactivates departments no longer in the catalog.
 */
export async function syncCatalogFromStatic(): Promise<number> {
  await connectToDatabase()
  const now = new Date()

  await InterviewConfigModel.updateMany(
    { industryKey: { $in: [...LEGACY_FLAT_INDUSTRY_KEYS] } },
    { $set: { isActive: false, updatedAt: now } },
  )

  // Deactivate non-CS departments removed from the static catalog
  await InterviewConfigModel.updateMany(
    { industryKey: { $nin: [...CANONICAL_DEPARTMENT_KEYS] } },
    { $set: { isActive: false, updatedAt: now } },
  )

  for (const department of INTERVIEW_CATALOG_DEPARTMENTS) {
    const existing = await InterviewConfigModel.findOne({ industryKey: department.key })

    if (!existing) {
      await InterviewConfigModel.create({
        industryKey: department.key,
        industryLabel: department.label,
        description: '',
        isActive: true,
        roleCategories: department.specializations.map(staticSpecToRoleCategory),
      })
      continue
    }

    existing.industryLabel = department.label
    existing.isActive = true
    existing.roleCategories = mergeDepartmentRoles(existing.roleCategories ?? [], department)
    await existing.save()
  }

  return INTERVIEW_CATALOG_DEPARTMENTS.length
}

/** @deprecated Use syncCatalogFromStatic */
export const ensureCatalogSeededFromStatic = syncCatalogFromStatic

export async function loadInterviewCatalogDepartments(): Promise<DepartmentConfig[]> {
  try {
    await connectToDatabase()
    await syncCatalogFromStatic()

    const docs = await InterviewConfigModel.find({
      isActive: { $ne: false },
      industryKey: { $nin: [...LEGACY_FLAT_INDUSTRY_KEYS] },
    })
      .sort({ industryLabel: 1 })
      .lean()

    if (docs.length > 0) {
      return docs.map((doc) => {
        const dto = mongoDocToDepartmentDto(doc as Parameters<typeof mongoDocToDepartmentDto>[0])
        return {
          key: dto.key,
          label: dto.label,
          specializations: dto.specializations,
        }
      })
    }
  } catch {
    /* fall through to static catalog */
  }

  return INTERVIEW_CATALOG_DEPARTMENTS
}
