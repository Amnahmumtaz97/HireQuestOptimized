import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { LearningPathModel } from '@/models/LearningPath'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { validatePathStageLinkage } from '@/lib/learning-paths/validate-link'
import { toSpecializationRef } from '@/lib/interview-catalog/resolve'
import { generateInterviewQuestions } from '@/lib/interview-questions/generate'
import { checkRateLimit } from '@/lib/rate-limit'
import { SESSION_DIFFICULTIES } from '@/lib/interview-config/difficulty'
import {
  QUESTION_COUNT_MIN,
  QUESTION_COUNT_MAX,
} from '@/lib/interview-config/question-counts'
import { DURATION_MIN, DURATION_MAX } from '@/lib/interview-config/durations'
import {
  NON_CATALOG_SCOPE,
  preferredFormatForType,
} from '@/lib/interview-config/type-config'
import { normalizeStoredInterviewType } from '@/lib/interview-config/interview-types'
import type { InterviewTypeKind } from '@/lib/interview-types'

function resolvePathInterviewTypes(
  rawType: string,
): {
  storedType: 'technical' | 'behavioral' | 'both' | 'hr' | 'coding' | 'system_design' | 'mixed'
  interviewTypes: InterviewTypeKind[]
  usesCatalog: boolean
} {
  const normalized = normalizeStoredInterviewType(rawType) ?? 'technical'
  if (normalized === 'coding') {
    return { storedType: 'coding', interviewTypes: ['coding'], usesCatalog: false }
  }
  if (normalized === 'system_design') {
    return {
      storedType: 'system_design',
      interviewTypes: ['system_design'],
      usesCatalog: false,
    }
  }
  if (normalized === 'behavioral') {
    return { storedType: 'behavioral', interviewTypes: ['behavioral'], usesCatalog: false }
  }
  if (normalized === 'hr') {
    return { storedType: 'hr', interviewTypes: ['hr'], usesCatalog: false }
  }
  if (normalized === 'mixed' || rawType === 'both') {
    return {
      storedType: rawType === 'both' ? 'both' : 'mixed',
      interviewTypes: ['technical', 'coding', 'behavioral', 'hr'],
      usesCatalog: true,
    }
  }
  return { storedType: 'technical', interviewTypes: ['technical'], usesCatalog: true }
}

const bodySchema = z.object({
  pathId: z.string().trim().min(1),
  stageId: z.string().trim().min(1),
  pathRemediationId: z.string().trim().min(1).nullable().optional(),
  totalQuestions: z.number().int().min(QUESTION_COUNT_MIN).max(QUESTION_COUNT_MAX),
  durationMinutes: z.number().int().min(DURATION_MIN).max(DURATION_MAX).nullable().optional(),
  difficulty: z.enum(SESSION_DIFFICULTIES).optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const rate = checkRateLimit(`generate:${session.user.id}`, {
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  if (rate.ok === false) {
    return NextResponse.json(
      { message: `Too many question generations. Try again in ${rate.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
    )
  }

  let createdId: string | null = null

  try {
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const {
      pathId,
      stageId,
      pathRemediationId,
      totalQuestions,
      durationMinutes,
      difficulty: difficultyOverride,
    } = parsed.data

    await connectToDatabase()

    const link = await validatePathStageLinkage({
      userId: session.user.id,
      learningPathId: pathId,
      learningStageId: stageId,
      requireCurrentStage: !pathRemediationId,
    })
    if (link.ok === false) {
      return NextResponse.json({ message: link.message }, { status: link.status })
    }

    let topics = (link.stage.suggestedTopics || []).map((t) => t.trim()).filter(Boolean)
    let interviewType = link.stage.interviewType || 'technical'
    let departmentKey = link.stage.departmentKey || 'software_engineering'
    let specializationKeys =
      link.stage.specializationKeys?.length
        ? [...link.stage.specializationKeys]
        : ['full_stack']
    let difficulty = difficultyOverride || link.stage.difficulty || 'Medium'
    let technicalQuestionRatio =
      typeof link.stage.technicalQuestionRatio === 'number'
        ? link.stage.technicalQuestionRatio
        : interviewType === 'behavioral' || interviewType === 'hr'
          ? 0
          : interviewType === 'technical'
            ? 100
            : 70

    if (pathRemediationId) {
      const progress = await UserPathProgressModel.findOne({
        userId: session.user.id,
        pathId,
      }).lean()
      const rem = progress?.remediationQueue?.find((r) => r.id === pathRemediationId)
      if (!rem || rem.completed) {
        return NextResponse.json(
          { message: 'Focus practice item not found or already completed' },
          { status: 400 },
        )
      }
      if (progress?.activeRemediationId !== pathRemediationId) {
        return NextResponse.json(
          { message: 'This focus practice is not the active remediation' },
          { status: 400 },
        )
      }
      topics = rem.topics.filter(Boolean)
      if (rem.departmentKey) departmentKey = rem.departmentKey
      if (rem.specializationKeys?.length) specializationKeys = [...rem.specializationKeys]
      if (rem.interviewType) interviewType = rem.interviewType
      if (rem.difficulty) difficulty = rem.difficulty
      if (typeof rem.technicalQuestionRatio === 'number') {
        technicalQuestionRatio = rem.technicalQuestionRatio
      }
    }

    if (topics.length === 0) {
      return NextResponse.json(
        { message: 'This path stage has no topics configured. Ask an admin to bind topics.' },
        { status: 400 },
      )
    }

    const path = await LearningPathModel.findById(pathId).lean()
    const resolvedType = resolvePathInterviewTypes(String(interviewType))
    const storedType = resolvedType.storedType
    const interviewTypes = resolvedType.interviewTypes
    const preferredQuestionFormat = preferredFormatForType(storedType)

    // Non-catalog modalities use practice/general scope
    if (!resolvedType.usesCatalog) {
      departmentKey = NON_CATALOG_SCOPE.departmentKey
      specializationKeys = [NON_CATALOG_SCOPE.specializationKey]
    }

    const specializationRefs = resolvedType.usesCatalog
      ? specializationKeys.map((k) => toSpecializationRef(departmentKey, k))
      : []
    const primarySpec = specializationKeys[0] || NON_CATALOG_SCOPE.specializationKey

    if (storedType === 'behavioral' || storedType === 'hr') {
      technicalQuestionRatio = 0
    } else if (storedType === 'coding' || storedType === 'system_design' || storedType === 'technical') {
      technicalQuestionRatio =
        typeof technicalQuestionRatio === 'number' ? technicalQuestionRatio : 100
    }

    const created = await InterviewSessionModel.create({
      userId: session.user.id,
      industryKey: departmentKey,
      departmentKey,
      departmentKeys: [departmentKey],
      industryKeys: [departmentKey],
      selectAllDepartments: false,
      selectAllIndustries: false,
      roleCategoryKey: primarySpec,
      specializationKey: primarySpec,
      specializationRefs,
      roleRefs: specializationRefs,
      specializationKeys,
      roleCategoryKeys: specializationKeys,
      selectAllSpecializations: false,
      selectAllRoleCategories: false,
      selectAllTopics: false,
      interviewType: storedType === 'both' ? 'mixed' : storedType,
      interviewTypes,
      topics,
      codingCategories: storedType === 'coding' ? topics : undefined,
      behavioralCompetencies: storedType === 'behavioral' ? topics : undefined,
      systemDesignTopics: storedType === 'system_design' ? topics : undefined,
      difficulty,
      totalQuestions,
      technicalQuestionRatio,
      durationMinutes: durationMinutes ?? null,
      status: 'created',
      entryMode: 'path',
      learningPathId: pathId,
      learningStageId: stageId,
      pathRemediationId: pathRemediationId ?? null,
      resumeContext: null,
      preferredQuestionFormat,
    })
    createdId = String(created._id)

    const result = await generateInterviewQuestions({
      industryKey: departmentKey,
      industryKeys: [departmentKey],
      industryLabels: [departmentKey.replace(/_/g, ' ')],
      roleCategoryKey: primarySpec,
      roleCategoryKeys: specializationKeys,
      roleCategoryLabels: specializationKeys.map((k) => k.replace(/_/g, ' ')),
      interviewType: storedType === 'both' ? 'mixed' : storedType,
      interviewTypes,
      topics,
      difficulty: difficulty as 'Easy' | 'Medium' | 'Hard' | 'Adaptive',
      totalQuestions,
      technicalQuestionRatio,
      preferredQuestionFormat,
      resumeContext: null,
      learningPathTitle: path?.title || null,
      learningStageTitle: link.stage.title || null,
      learningStageType: link.stage.type || null,
      // All interview types (including coding + system design) require Gemini.
      allowTemplateFallback: false,
    })

    if (!result.questions?.length) {
      await InterviewSessionModel.deleteOne({ _id: created._id })
      return NextResponse.json(
        { message: 'Question generation returned no questions. Try again.' },
        { status: 502 },
      )
    }

    await InterviewSessionModel.updateOne(
      { _id: created._id },
      {
        $set: {
          questions: result.questions,
          questionSource: result.source,
        },
      },
    )

    return NextResponse.json({
      sessionId: createdId,
      source: result.source,
      warnings: result.warnings || [],
      questionCount: result.questions.length,
    })
  } catch (error) {
    console.error('[interviews/from-path]', error)
    if (createdId) {
      try {
        await InterviewSessionModel.deleteOne({ _id: createdId })
      } catch {
        /* ignore cleanup */
      }
    }
    return NextResponse.json(
      { message: 'Failed to create path interview. Please try again.' },
      { status: 500 },
    )
  }
}
