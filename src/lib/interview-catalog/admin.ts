import { z } from 'zod'
import type { DepartmentConfig, SpecializationConfig } from '@/lib/interview-catalog/types'
import type { IInterviewConfig, IRoleCategoryConfig } from '@/models/InterviewConfig'

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export const specializationPayloadSchema = z.object({
  key: z.string().trim().optional().default(''),
  label: z.string().trim().min(1),
  technicalTopics: z.array(z.string().trim().min(1)).default([]),
  behavioralTopics: z.array(z.string().trim().min(1)).default([]),
  technicalQuestionRatio: z.number().int().min(0).max(100).default(70),
  durationEnabled: z.boolean().default(true),
  durations: z.array(z.number().int().positive()).default([20, 30, 45]),
})

export const departmentPayloadSchema = z.object({
  key: z.string().trim().optional().default(''),
  label: z.string().trim().min(1),
  description: z.string().trim().optional().default(''),
  isActive: z.boolean().default(true),
  specializations: z.array(specializationPayloadSchema).default([]),
})

export const topicPayloadSchema = z.object({
  specializationKey: z.string().trim().min(1),
  kind: z.enum(['technical', 'behavioral']),
  topic: z.string().trim().min(1),
})

export type DepartmentPayload = z.infer<typeof departmentPayloadSchema>
export type SpecializationPayload = z.infer<typeof specializationPayloadSchema>

export type DepartmentDto = DepartmentConfig & {
  _id: string
  description?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export function roleCategoryToSpecialization(role: IRoleCategoryConfig): SpecializationConfig {
  return {
    key: role.key,
    label: role.label,
    technicalTopics: role.technicalTopics ?? [],
    behavioralTopics: role.behavioralTopics ?? [],
    technicalQuestionRatio: role.technicalQuestionRatio ?? 70,
    durationEnabled: role.durationEnabled ?? true,
    durations: role.durations ?? [],
  }
}

export function specializationToRoleCategory(spec: SpecializationPayload): IRoleCategoryConfig {
  const key = slugify(spec.key || spec.label)
  return {
    key,
    label: spec.label.trim(),
    interviewTypes: ['Technical', 'Behavioral'],
    technicalTopics: spec.technicalTopics.map((t) => t.trim()).filter(Boolean),
    behavioralTopics: spec.behavioralTopics.map((t) => t.trim()).filter(Boolean),
    technicalQuestionRatio: spec.technicalQuestionRatio,
    durationEnabled: spec.durationEnabled,
    durations: spec.durationEnabled ? spec.durations : [],
  }
}

export function mongoDocToDepartmentDto(doc: IInterviewConfig & { _id: unknown; createdAt?: Date; updatedAt?: Date }): DepartmentDto {
  return {
    _id: String(doc._id),
    key: doc.industryKey,
    label: doc.industryLabel,
    description: doc.description ?? '',
    isActive: doc.isActive !== false,
    specializations: (doc.roleCategories ?? []).map(roleCategoryToSpecialization),
    createdAt: doc.createdAt?.toISOString(),
    updatedAt: doc.updatedAt?.toISOString(),
  }
}

export function departmentConfigToMongoPayload(payload: DepartmentPayload): Omit<IInterviewConfig, never> {
  const key = slugify(payload.key || payload.label)
  return {
    industryKey: key,
    industryLabel: payload.label.trim(),
    description: payload.description?.trim() ?? '',
    isActive: payload.isActive,
    roleCategories: payload.specializations.map(specializationToRoleCategory),
  }
}

export function normalizeDepartmentPayload(payload: DepartmentPayload): DepartmentPayload {
  return {
    ...payload,
    key: slugify(payload.key || payload.label),
    label: payload.label.trim(),
    description: payload.description?.trim() ?? '',
    specializations: payload.specializations.map((spec) => ({
      ...spec,
      key: slugify(spec.key || spec.label),
      label: spec.label.trim(),
      technicalTopics: spec.technicalTopics.map((t) => t.trim()).filter(Boolean),
      behavioralTopics: spec.behavioralTopics.map((t) => t.trim()).filter(Boolean),
      durations: spec.durationEnabled ? spec.durations : [],
    })),
  }
}

export function validateDepartmentUniqueness(
  payload: DepartmentPayload,
  options?: { specializationScope?: 'department' | 'global' },
): string | null {
  const specKeys = new Set<string>()
  for (const spec of payload.specializations) {
    if (specKeys.has(spec.key)) {
      return `Duplicate specialization key in department: ${spec.key}`
    }
    specKeys.add(spec.key)
  }
  void options
  return null
}

export function departmentToLegacyConfig(dto: DepartmentDto) {
  return {
    _id: dto._id,
    industryKey: dto.key,
    industryLabel: dto.label,
    isActive: dto.isActive,
    roleCategories: dto.specializations.map((spec) => ({
      key: spec.key,
      label: spec.label,
      interviewTypes: ['Technical', 'Behavioral'],
      technicalTopics: spec.technicalTopics,
      behavioralTopics: spec.behavioralTopics,
      technicalQuestionRatio: spec.technicalQuestionRatio,
      durationEnabled: spec.durationEnabled,
      durations: spec.durations,
    })),
  }
}

export function countTopics(department: Pick<DepartmentDto, 'specializations'>): number {
  return department.specializations.reduce(
    (sum, spec) => sum + spec.technicalTopics.length + spec.behavioralTopics.length,
    0,
  )
}
