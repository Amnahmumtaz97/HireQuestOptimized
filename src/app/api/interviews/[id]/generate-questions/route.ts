import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { generateInterviewQuestions } from '@/lib/interview-questions/generate'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import {
  normalizeSpecializationRefs,
  resolveTopicsForInterview,
} from '@/lib/interview-catalog'
import { loadInterviewCatalogDepartments } from '@/lib/interview-catalog/load'
import { resumeContextSchema } from '@/lib/interview/resume-context-schema'
import { validatePathStageLinkage } from '@/lib/learning-paths/validate-link'
import { checkRateLimit } from '@/lib/rate-limit'

const generateBodySchema = z.object({
  resumeContext: resumeContextSchema,
  learningPathId: z.string().trim().min(1).optional(),
  learningStageId: z.string().trim().min(1).optional(),
})

function asResumeContext(
  value: unknown,
): InterviewGenerationParams['resumeContext'] {
  const parsed = resumeContextSchema.safeParse(value)
  if (!parsed.success || !parsed.data) return null
  return parsed.data
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
      {
        message: `Too many question generations. Try again in ${rate.retryAfterSec}s.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rate.retryAfterSec) },
      },
    )
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid interview id' }, { status: 400 })
  }

  try {
    await connectToDatabase()
    const doc = await InterviewSessionModel.findOne({
      _id: id,
      userId: session.user.id,
    }).lean()

    if (!doc) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }

    let bodyResume: InterviewGenerationParams['resumeContext'] = null
    let bodyPathId: string | undefined
    let bodyStageId: string | undefined
    try {
      const raw = await request.json()
      const parsed = generateBodySchema.safeParse(raw ?? {})
      if (parsed.success) {
        if (parsed.data.resumeContext) bodyResume = parsed.data.resumeContext
        if (parsed.data.learningPathId && isValidObjectId(parsed.data.learningPathId)) {
          bodyPathId = parsed.data.learningPathId
        }
        if (parsed.data.learningStageId && isValidObjectId(parsed.data.learningStageId)) {
          bodyStageId = parsed.data.learningStageId
        }
      }
    } catch {
      // empty body is fine
    }

    const resumeContext =
      bodyResume ?? asResumeContext(doc.resumeContext) ?? null

    // Path linkage: prefer existing session values; body may only set when session empty,
    // and must pass enrollment + current-stage checks.
    let learningPathId =
      doc.learningPathId && isValidObjectId(doc.learningPathId)
        ? doc.learningPathId
        : null
    let learningStageId =
      doc.learningStageId && isValidObjectId(doc.learningStageId)
        ? doc.learningStageId
        : null

    if ((!learningPathId || !learningStageId) && bodyPathId && bodyStageId) {
      const link = await validatePathStageLinkage({
        userId: session.user.id,
        learningPathId: bodyPathId,
        learningStageId: bodyStageId,
        requireCurrentStage: true,
      })
      if (link.ok === false) {
        return NextResponse.json({ message: link.message }, { status: link.status })
      }
      learningPathId = bodyPathId
      learningStageId = bodyStageId
    } else if (bodyPathId || bodyStageId) {
      // Reject attempts to rewrite an existing or partial path linkage via regenerate.
      if (
        (bodyPathId && bodyPathId !== learningPathId) ||
        (bodyStageId && bodyStageId !== learningStageId)
      ) {
        return NextResponse.json(
          {
            message:
              'Cannot change learning path linkage on regenerate. Create a new path-linked interview.',
          },
          { status: 400 },
        )
      }
    }

    let learningPathTitle: string | null = null
    let learningStageTitle: string | null = null
    let learningStageType: InterviewGenerationParams['learningStageType'] = null
    let stageSuggestedTopics: string[] = []

    if (learningPathId) {
      const { LearningPathModel } = await import('@/models/LearningPath')
      const path = await LearningPathModel.findById(learningPathId).lean()
      learningPathTitle = path?.title ?? null
    }
    if (learningStageId) {
      const { StageModel } = await import('@/models/Stage')
      const stage = await StageModel.findById(learningStageId).lean()
      if (stage) {
        learningStageTitle = stage.title ?? null
        learningStageType = stage.type ?? null
        stageSuggestedTopics = (stage.suggestedTopics || []).filter(Boolean)
      }
    }

    const persistSet: Record<string, unknown> = {}
    if (bodyResume) persistSet.resumeContext = bodyResume
    if (bodyPathId && bodyStageId && !doc.learningPathId) {
      persistSet.learningPathId = bodyPathId
      persistSet.learningStageId = bodyStageId
    }
    if (Object.keys(persistSet).length > 0) {
      await InterviewSessionModel.updateOne(
        { _id: id, userId: session.user.id },
        { $set: persistSet },
      )
    }

    const sessionTopics = (doc.topics ?? []).map((t) => t.trim()).filter(Boolean)
    const isCatalogTechnical =
      doc.interviewType === 'technical' &&
      doc.departmentKey !== 'practice' &&
      doc.industryKey !== 'practice'

    let finalTopics = sessionTopics
    let industryLabels: string[] = []
    let specializationLabels: string[] = []
    let departmentKeys = [doc.departmentKey || doc.industryKey].filter(Boolean) as string[]
    let specializationKeys = [doc.specializationKey || doc.roleCategoryKey].filter(Boolean)

    if (isCatalogTechnical) {
      const departments = await loadInterviewCatalogDepartments()
      const departmentKey =
        doc.departmentKey?.trim() ||
        doc.industryKey?.trim() ||
        doc.departmentKeys?.[0]?.trim() ||
        doc.industryKeys?.[0]?.trim() ||
        ''
      departmentKeys = departmentKey ? [departmentKey] : []

      const specializationRefs = normalizeSpecializationRefs(departments, {
        departmentKeys,
        selectAllDepartments: false,
        specializationRefs: doc.specializationRefs,
        roleRefs: doc.roleRefs,
        specializationKeys: doc.specializationKeys,
        roleCategoryKeys: doc.roleCategoryKeys,
        specializationKey: doc.specializationKey,
        roleCategoryKey: doc.roleCategoryKey,
      })

      const resolved = resolveTopicsForInterview(departments, {
        selectAllDepartments: false,
        departmentKeys,
        interviewType: 'technical',
        interviewTypes: ['technical'],
        selectAllSpecializations: Boolean(
          doc.selectAllSpecializations ?? doc.selectAllRoleCategories,
        ),
        specializationRefs,
        selectAllTopics: Boolean(doc.selectAllTopics),
        topics: doc.topics ?? [],
      })

      const catalogTopicSet = new Set(resolved.topics.map((t) => t.trim()).filter(Boolean))
      const mergedTopics = [
        ...new Set([
          ...(doc.selectAllTopics
            ? resolved.topics
            : sessionTopics.length
              ? sessionTopics
              : resolved.topics),
          ...stageSuggestedTopics.filter(
            (t) => catalogTopicSet.has(t) || resolved.topics.includes(t),
          ),
        ]),
      ]
      const topicBank =
        mergedTopics.length > 0
          ? mergedTopics.filter(
              (t) =>
                catalogTopicSet.size === 0 ||
                catalogTopicSet.has(t) ||
                resolved.topics.includes(t),
            )
          : resolved.topics

      finalTopics = topicBank.length > 0 ? topicBank : resolved.topics
      industryLabels = resolved.departmentLabels
      specializationLabels = resolved.specializationLabels
      departmentKeys = resolved.departmentKeys
      specializationKeys = resolved.specializationKeys
    } else if (sessionTopics.length === 0) {
      return NextResponse.json(
        { message: 'No confirmed topics/categories on this interview' },
        { status: 400 },
      )
    }

    const result = await generateInterviewQuestions({
      industryKey: departmentKeys[0] || doc.industryKey,
      industryKeys: departmentKeys,
      industryLabels,
      roleCategoryKey: specializationKeys[0] || doc.roleCategoryKey,
      roleCategoryKeys: specializationKeys,
      roleCategoryLabels: specializationLabels,
      interviewType: doc.interviewType as InterviewGenerationParams['interviewType'],
      interviewTypes: doc.interviewTypes as InterviewGenerationParams['interviewTypes'],
      topics: finalTopics,
      difficulty: doc.difficulty,
      totalQuestions: doc.totalQuestions,
      technicalQuestionRatio: doc.technicalQuestionRatio,
      resumeContext,
      learningPathTitle,
      learningStageTitle,
      learningStageType,
      preferredQuestionFormat: doc.preferredQuestionFormat ?? null,
      configPayload: (doc as { configPayload?: Record<string, unknown> | null }).configPayload ?? null,
      // All interview types use Gemini when GEMINI_API_KEY is set.
      allowTemplateFallback: false,
    })

    const updated = await InterviewSessionModel.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        $set: {
          questions: result.questions,
          questionSource: result.source,
        },
      },
      { returnDocument: 'after' },
    ).lean()

    if (!updated) {
      return NextResponse.json({ message: 'Failed to update interview' }, { status: 500 })
    }

    return NextResponse.json({
      session: updated,
      source: result.source,
      warnings: result.warnings,
    })
  } catch (error) {
    console.error('[generate-questions]', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 },
    )
  }
}
