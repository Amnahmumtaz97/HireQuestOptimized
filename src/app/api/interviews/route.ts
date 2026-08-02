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
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import {
  decodeInterviewTypeKinds,
  encodeInterviewType,
  normalizeInterviewTypeKinds,
} from '@/lib/interview-types'
import { resumeContextSchema } from '@/lib/interview/resume-context-schema'
import { validatePathStageLinkage } from '@/lib/learning-paths/validate-link'

const MAX_QUESTIONS = 40

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
    interviewType: z.enum(['technical', 'behavioral', 'both', 'hr']),
    interviewTypes: z
      .array(z.enum(['technical', 'behavioral', 'hr']))
      .min(1)
      .max(3)
      .optional(),
    topics: z.array(z.string().trim().min(1)).default([]),
    difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Adaptive']),
    totalQuestions: z.number().int().positive().max(MAX_QUESTIONS),
    technicalQuestionRatio: z.number().int().min(0).max(100),
    durationMinutes: z.number().int().positive().nullable().optional(),
    entryMode: z.enum(['manual', 'resume', 'path']).optional().default('manual'),
    learningPathId: z.string().trim().min(1).nullable().optional(),
    learningStageId: z.string().trim().min(1).nullable().optional(),
    pathRemediationId: z.string().trim().min(1).nullable().optional(),
    resumeContext: resumeContextSchema,
  })
  .superRefine((data, ctx) => {
    if (data.selectAllDepartments || data.selectAllIndustries) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only one department can be selected',
        path: ['departmentKey'],
      })
    }

    const multiKeys = data.departmentKeys?.length
      ? data.departmentKeys
      : data.industryKeys?.length
        ? data.industryKeys
        : []
    if (multiKeys.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Only one department can be selected',
        path: ['departmentKey'],
      })
    }

    const singleKey =
      data.departmentKey?.trim() ||
      data.industryKey?.trim() ||
      multiKeys[0]?.trim() ||
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

    const hasTopics = data.selectAllTopics || data.topics.length > 0
    if (!hasTopics) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Select at least one topic',
        path: ['topics'],
      })
    }
  })

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

    return NextResponse.json({ sessions })
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

    const interviewTypes = normalizeInterviewTypeKinds(
      parsed.data.interviewTypes ??
        decodeInterviewTypeKinds(parsed.data.interviewType),
    )
    const interviewType =
      encodeInterviewType(interviewTypes) ?? parsed.data.interviewType

    const departments = await loadInterviewCatalogDepartments()
    const departmentKey =
      parsed.data.departmentKey?.trim() ||
      parsed.data.industryKey?.trim() ||
      parsed.data.departmentKeys?.[0]?.trim() ||
      parsed.data.industryKeys?.[0]?.trim() ||
      ''
    const departmentKeysInput = departmentKey ? [departmentKey] : []

    const specializationRefs = normalizeSpecializationRefs(departments, {
      departmentKeys: departmentKeysInput,
      selectAllDepartments: false,
      specializationRefs: parsed.data.specializationRefs,
      roleRefs: parsed.data.roleRefs,
      specializationKeys: parsed.data.specializationKeys,
      roleCategoryKeys: parsed.data.roleCategoryKeys,
      specializationKey: parsed.data.specializationKey,
      roleCategoryKey: parsed.data.roleCategoryKey,
    })

    const resolved = resolveTopicsForInterview(departments, {
      selectAllDepartments: false,
      departmentKeys: departmentKeysInput,
      interviewType,
      interviewTypes,
      selectAllSpecializations:
        parsed.data.selectAllSpecializations || parsed.data.selectAllRoleCategories,
      specializationRefs,
      selectAllTopics: parsed.data.selectAllTopics,
      topics: parsed.data.topics,
    })

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
        { message: 'No topics available for the selected interview type and specializations' },
        { status: 400 },
      )
    }

    let learningPathId = parsed.data.learningPathId ?? null
    let learningStageId = parsed.data.learningStageId ?? null
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

    const primaryDepartmentKey = resolved.departmentKeys[0]
    const primarySpecializationKey =
      parseSpecializationRef(resolved.specializationRefs[0])?.specializationKey ??
      resolved.specializationKeys[0]

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
        parsed.data.selectAllSpecializations || parsed.data.selectAllRoleCategories,
      selectAllRoleCategories:
        parsed.data.selectAllSpecializations || parsed.data.selectAllRoleCategories,
      selectAllTopics: parsed.data.selectAllTopics,
      interviewType,
      interviewTypes,
      topics: parsed.data.selectAllTopics ? [] : resolved.topics,
      difficulty: parsed.data.difficulty,
      totalQuestions: parsed.data.totalQuestions,
      technicalQuestionRatio: parsed.data.technicalQuestionRatio,
      durationMinutes: parsed.data.durationMinutes ?? null,
      status: 'created',
      entryMode: parsed.data.entryMode ?? 'manual',
      learningPathId,
      learningStageId,
      pathRemediationId: parsed.data.pathRemediationId ?? null,
      resumeContext: parsed.data.resumeContext ?? null,
    })

    return NextResponse.json({ session: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create interview' },
      { status: 500 },
    )
  }
}
