import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import {
  normalizeSpecializationRefs,
  parseSpecializationRef,
  resolveTopicsForInterview,
} from '@/lib/interview-catalog'
import { loadInterviewCatalogDepartments } from '@/lib/interview-catalog/load'
import {
  NON_CATALOG_SCOPE,
  preferredFormatForType,
  selectionLabels,
  validateBankSelection,
  type InterviewConfigByType,
} from '@/lib/interview-config/type-config'
import { hrSectionLabel } from '@/lib/interview-config/banks/hr-sections'
import { STORED_INTERVIEW_TYPE_KEYS } from '@/lib/interview-config/interview-types'
import { SESSION_DIFFICULTIES } from '@/lib/interview-config/difficulty'
import { QUESTION_COUNT_MAX } from '@/lib/interview-config/question-counts'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { resumeContextSchema } from '@/lib/interview/resume-context-schema'
import { validatePathStageLinkage } from '@/lib/learning-paths/validate-link'
import { sanitizeSessionForClient, sanitizeSessionsForClient } from '@/lib/interview/sanitize-session'

const MAX_QUESTIONS = QUESTION_COUNT_MAX

const mixSectionSchema = z.object({
  kind: z.enum(['technical', 'coding', 'behavioral', 'hr', 'system_design']),
  weight: z.number().int().min(0).max(100),
  selection: z.array(z.string().trim().min(1)).min(1),
})

const createInterviewSchema = z
  .object({
    departmentKey: z.string().trim().min(1).optional(),
    departmentKeys: z.array(z.string().trim().min(1)).optional(),
    selectAllDepartments: z.boolean().optional().default(false),
    industryKey: z.string().trim().min(1).optional(),
    industryKeys: z.array(z.string().trim().min(1)).optional(),
    selectAllIndustries: z.boolean().optional().default(false),
    specializationKey: z.string().trim().min(1).optional(),
    specializationKeys: z.array(z.string().trim().min(1)).optional(),
    specializationRefs: z.array(z.string().trim().min(1)).optional(),
    selectAllSpecializations: z.boolean().optional().default(false),
    roleCategoryKey: z.string().trim().min(1).optional(),
    roleCategoryKeys: z.array(z.string().trim().min(1)).optional(),
    roleRefs: z.array(z.string().trim().min(1)).optional(),
    selectAllRoleCategories: z.boolean().optional().default(false),
    selectAllTopics: z.boolean().optional().default(false),
    interviewType: z.enum(STORED_INTERVIEW_TYPE_KEYS),
    preferredQuestionFormat: z
      .enum(['mixed', 'coding', 'scenario', 'whiteboard'])
      .nullable()
      .optional(),
    topics: z.array(z.string().trim().min(1)).default([]),
    codingCategories: z.array(z.string().trim().min(1)).optional(),
    behavioralCompetencies: z.array(z.string().trim().min(1)).optional(),
    hrSections: z.array(z.string().trim().min(1)).optional(),
    systemDesignTopics: z.array(z.string().trim().min(1)).optional(),
    mixSections: z.array(mixSectionSchema).optional(),
    configPayload: z.record(z.string(), z.unknown()).nullable().optional(),
    difficulty: z.enum(SESSION_DIFFICULTIES),
    totalQuestions: z.number().int().positive().max(MAX_QUESTIONS),
    technicalQuestionRatio: z.number().int().min(0).max(100).default(70),
    durationMinutes: z.number().int().positive().nullable().optional(),
    entryMode: z.enum(['manual', 'resume', 'path']).optional().default('manual'),
    learningPathId: z.string().trim().min(1).nullable().optional(),
    learningStageId: z.string().trim().min(1).nullable().optional(),
    pathRemediationId: z.string().trim().min(1).nullable().optional(),
    resumeContext: resumeContextSchema,
  })
  .superRefine((data, ctx) => {
    const type = data.interviewType === 'both' ? 'mixed' : data.interviewType

    if (type === 'technical') {
      if (data.selectAllDepartments || data.selectAllIndustries) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Only one department can be selected',
          path: ['departmentKey'],
        })
      }
      const singleKey =
        data.departmentKey?.trim() ||
        data.industryKey?.trim() ||
        data.departmentKeys?.[0]?.trim() ||
        data.industryKeys?.[0]?.trim() ||
        ''
      if (!singleKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select one department',
          path: ['departmentKey'],
        })
      }
      const hasSpecializations =
        data.selectAllSpecializations ||
        data.selectAllRoleCategories ||
        (data.specializationRefs?.length ?? 0) > 0 ||
        (data.roleRefs?.length ?? 0) > 0 ||
        (data.specializationKeys?.length ?? 0) > 0 ||
        (data.roleCategoryKeys?.length ?? 0) > 0 ||
        Boolean(data.specializationKey?.trim()) ||
        Boolean(data.roleCategoryKey?.trim())
      if (!hasSpecializations) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select at least one specialization',
          path: ['specializationRefs'],
        })
      }
      if (!data.selectAllTopics && data.topics.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select at least one topic',
          path: ['topics'],
        })
      }
      return
    }

    if (type === 'coding') {
      const cats = data.codingCategories?.length ? data.codingCategories : data.topics
      const err = validateBankSelection('coding', cats)
      if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err, path: ['codingCategories'] })
      return
    }
    if (type === 'behavioral') {
      const comps = data.behavioralCompetencies?.length
        ? data.behavioralCompetencies
        : data.topics
      const err = validateBankSelection('behavioral', comps)
      if (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
          path: ['behavioralCompetencies'],
        })
      }
      return
    }
    if (type === 'hr') {
      const sections = data.hrSections?.length ? data.hrSections : []
      const err = validateBankSelection('hr', sections)
      if (err) ctx.addIssue({ code: z.ZodIssueCode.custom, message: err, path: ['hrSections'] })
      return
    }
    if (type === 'system_design') {
      const topics = data.systemDesignTopics?.length ? data.systemDesignTopics : data.topics
      const err = validateBankSelection('system_design', topics)
      if (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
          path: ['systemDesignTopics'],
        })
      }
      return
    }
    if (type === 'mixed') {
      const sections = data.mixSections ?? []
      if (sections.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Add at least one mixed section',
          path: ['mixSections'],
        })
        return
      }
      const sum = sections.reduce((a, s) => a + s.weight, 0)
      if (sum !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Mixed section weights must sum to 100',
          path: ['mixSections'],
        })
      }
    }
  })

function buildConfig(data: z.infer<typeof createInterviewSchema>): InterviewConfigByType | null {
  const type = data.interviewType === 'both' ? 'mixed' : data.interviewType
  if (type === 'technical') {
    return {
      type: 'technical',
      departmentKey:
        data.departmentKey?.trim() ||
        data.industryKey?.trim() ||
        data.departmentKeys?.[0]?.trim() ||
        '',
      specializationRefs: data.specializationRefs?.length
        ? data.specializationRefs
        : data.roleRefs?.length
          ? data.roleRefs
          : [],
      topics: data.topics,
      selectAllTopics: data.selectAllTopics,
    }
  }
  if (type === 'coding') {
    return {
      type: 'coding',
      categories: data.codingCategories?.length ? data.codingCategories : data.topics,
    }
  }
  if (type === 'behavioral') {
    return {
      type: 'behavioral',
      competencies: data.behavioralCompetencies?.length
        ? data.behavioralCompetencies
        : data.topics,
    }
  }
  if (type === 'hr') {
    return { type: 'hr', sections: data.hrSections ?? [] }
  }
  if (type === 'system_design') {
    return {
      type: 'system_design',
      topics: data.systemDesignTopics?.length ? data.systemDesignTopics : data.topics,
    }
  }
  if (type === 'mixed' && data.mixSections?.length) {
    return { type: 'mixed', sections: data.mixSections }
  }
  return null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const sessions = await InterviewSessionModel.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ sessions: sanitizeSessionsForClient(sessions) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch interviews' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createInterviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const data = parsed.data
    const storedType = data.interviewType === 'both' ? 'mixed' : data.interviewType
    const preferredQuestionFormat =
      data.preferredQuestionFormat ?? preferredFormatForType(storedType)

    let learningPathId = data.learningPathId ?? null
    let learningStageId = data.learningStageId ?? null
    if (learningPathId || learningStageId) {
      if (!learningPathId || !learningStageId) {
        return NextResponse.json(
          { message: 'Both learningPathId and learningStageId are required when linking a path' },
          { status: 400 },
        )
      }
      const link = await validatePathStageLinkage({
        userId: session.user.id,
        learningPathId,
        learningStageId,
        requireCurrentStage: true,
      })
      if (link.ok === false) {
        return NextResponse.json({ message: link.message }, { status: link.status })
      }
    }

    // —— Technical (catalog) ——
    if (storedType === 'technical') {
      const departments = await loadInterviewCatalogDepartments()
      const departmentKey =
        data.departmentKey?.trim() ||
        data.industryKey?.trim() ||
        data.departmentKeys?.[0]?.trim() ||
        data.industryKeys?.[0]?.trim() ||
        ''
      const specializationRefs = normalizeSpecializationRefs(departments, {
        departmentKeys: [departmentKey],
        selectAllDepartments: false,
        specializationRefs: data.specializationRefs,
        roleRefs: data.roleRefs,
        specializationKeys: data.specializationKeys,
        roleCategoryKeys: data.roleCategoryKeys,
        specializationKey: data.specializationKey,
        roleCategoryKey: data.roleCategoryKey,
      })

      const resolved = resolveTopicsForInterview(departments, {
        selectAllDepartments: false,
        departmentKeys: [departmentKey],
        interviewType: 'technical',
        interviewTypes: ['technical'],
        selectAllSpecializations:
          data.selectAllSpecializations || data.selectAllRoleCategories,
        specializationRefs,
        selectAllTopics: data.selectAllTopics,
        topics: data.topics,
      })

      // Technical interviews: only technicalTopics (resolved already filters by interview type)
      if (resolved.departmentKeys.length !== 1) {
        return NextResponse.json(
          { message: 'Select exactly one valid department' },
          { status: 400 },
        )
      }
      if (resolved.specializationRefs.length === 0) {
        return NextResponse.json({ message: 'No valid specializations selected' }, { status: 400 })
      }
      if (resolved.topics.length === 0) {
        return NextResponse.json(
          { message: 'No topics available for the selected specializations' },
          { status: 400 },
        )
      }

      const primaryDepartmentKey = resolved.departmentKeys[0]
      const primarySpecializationKey =
        parseSpecializationRef(resolved.specializationRefs[0])?.specializationKey ??
        resolved.specializationKeys[0]

      const configPayload: InterviewConfigByType = {
        type: 'technical',
        departmentKey: primaryDepartmentKey,
        specializationRefs: resolved.specializationRefs,
        topics: data.selectAllTopics ? resolved.topics : resolved.topics,
        selectAllTopics: data.selectAllTopics,
      }

      const created = await InterviewSessionModel.create({
        userId: session.user.id,
        industryKey: primaryDepartmentKey,
        departmentKey: primaryDepartmentKey,
        departmentKeys: [primaryDepartmentKey],
        industryKeys: [primaryDepartmentKey],
        selectAllDepartments: false,
        selectAllIndustries: false,
        roleCategoryKey: primarySpecializationKey,
        specializationKey: primarySpecializationKey,
        specializationRefs: resolved.specializationRefs,
        roleRefs: resolved.specializationRefs,
        specializationKeys: resolved.specializationKeys,
        roleCategoryKeys: resolved.specializationKeys,
        selectAllSpecializations:
          data.selectAllSpecializations || data.selectAllRoleCategories,
        selectAllRoleCategories:
          data.selectAllSpecializations || data.selectAllRoleCategories,
        selectAllTopics: data.selectAllTopics,
        interviewType: 'technical',
        interviewTypes: ['technical'],
        topics: data.selectAllTopics ? [] : resolved.topics,
        configPayload,
        difficulty: data.difficulty,
        totalQuestions: data.totalQuestions,
        technicalQuestionRatio: 100,
        durationMinutes: data.durationMinutes ?? null,
        status: 'created',
        entryMode: data.entryMode ?? 'manual',
        learningPathId,
        learningStageId,
        pathRemediationId: data.pathRemediationId ?? null,
        resumeContext: data.resumeContext ?? null,
        preferredQuestionFormat: null,
      })

      return NextResponse.json({ session: sanitizeSessionForClient(created) }, { status: 201 })
    }

    // —— Non-catalog types ——
    const config = buildConfig(data)
    if (!config) {
      return NextResponse.json({ message: 'Invalid interview configuration' }, { status: 400 })
    }

    let topics = selectionLabels(config)
    if (config.type === 'hr') {
      topics = config.sections.map((k) => hrSectionLabel(k))
    }
    if (topics.length === 0) {
      return NextResponse.json({ message: 'Select at least one option' }, { status: 400 })
    }

    const interviewTypes =
      storedType === 'mixed' && config.type === 'mixed'
        ? config.sections.map((s) => s.kind)
        : storedType === 'coding'
          ? (['coding'] as const)
          : storedType === 'system_design'
            ? (['system_design'] as const)
            : storedType === 'behavioral'
              ? (['behavioral'] as const)
              : storedType === 'hr'
                ? (['hr'] as const)
                : (['technical'] as const)

    const ratio =
      storedType === 'mixed' && config.type === 'mixed'
        ? config.sections
            .filter((s) => s.kind === 'technical' || s.kind === 'coding' || s.kind === 'system_design')
            .reduce((a, s) => a + s.weight, 0)
        : storedType === 'behavioral' || storedType === 'hr'
          ? 0
          : 100

    const created = await InterviewSessionModel.create({
      userId: session.user.id,
      industryKey: NON_CATALOG_SCOPE.departmentKey,
      departmentKey: NON_CATALOG_SCOPE.departmentKey,
      departmentKeys: [NON_CATALOG_SCOPE.departmentKey],
      industryKeys: [NON_CATALOG_SCOPE.departmentKey],
      selectAllDepartments: false,
      selectAllIndustries: false,
      roleCategoryKey: NON_CATALOG_SCOPE.specializationKey,
      specializationKey: NON_CATALOG_SCOPE.specializationKey,
      specializationRefs: [],
      roleRefs: [],
      specializationKeys: [NON_CATALOG_SCOPE.specializationKey],
      roleCategoryKeys: [NON_CATALOG_SCOPE.specializationKey],
      selectAllSpecializations: false,
      selectAllRoleCategories: false,
      selectAllTopics: false,
      interviewType: storedType,
      interviewTypes: [...interviewTypes],
      topics,
      configPayload: config,
      codingCategories: config.type === 'coding' ? config.categories : undefined,
      behavioralCompetencies: config.type === 'behavioral' ? config.competencies : undefined,
      hrSections: config.type === 'hr' ? config.sections : undefined,
      systemDesignTopics: config.type === 'system_design' ? config.topics : undefined,
      difficulty: data.difficulty,
      totalQuestions: data.totalQuestions,
      technicalQuestionRatio: ratio,
      durationMinutes: data.durationMinutes ?? null,
      status: 'created',
      entryMode: data.entryMode ?? 'manual',
      learningPathId,
      learningStageId,
      pathRemediationId: data.pathRemediationId ?? null,
      resumeContext: data.resumeContext ?? null,
      preferredQuestionFormat,
    })

    return NextResponse.json({ session: sanitizeSessionForClient(created) }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create interview' },
      { status: 500 },
    )
  }
}
