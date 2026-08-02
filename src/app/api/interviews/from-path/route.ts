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

const bodySchema = z.object({
  pathId: z.string().trim().min(1),
  stageId: z.string().trim().min(1),
  pathRemediationId: z.string().trim().min(1).nullable().optional(),
  totalQuestions: z.number().int().min(5).max(40),
  durationMinutes: z.number().int().min(5).max(180).nullable().optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Adaptive']).optional(),
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
    const specializationRefs = specializationKeys.map((k) =>
      toSpecializationRef(departmentKey, k),
    )
    const primarySpec = specializationKeys[0]
    const interviewTypes: Array<'technical' | 'behavioral' | 'hr'> =
      interviewType === 'both'
        ? ['technical', 'behavioral']
        : interviewType === 'hr'
          ? ['hr']
          : interviewType === 'behavioral'
            ? ['behavioral']
            : ['technical']

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
      interviewType,
      interviewTypes,
      topics,
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
    })
    createdId = String(created._id)

    const result = await generateInterviewQuestions({
      industryKey: departmentKey,
      industryKeys: [departmentKey],
      industryLabels: [departmentKey.replace(/_/g, ' ')],
      roleCategoryKey: primarySpec,
      roleCategoryKeys: specializationKeys,
      roleCategoryLabels: specializationKeys.map((k) => k.replace(/_/g, ' ')),
      interviewType,
      interviewTypes,
      topics,
      difficulty,
      totalQuestions,
      technicalQuestionRatio,
      resumeContext: null,
      learningPathTitle: path?.title || null,
      learningStageTitle: link.stage.title || null,
      learningStageType: link.stage.type || null,
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
      { message: error instanceof Error ? error.message : 'Failed to create path interview' },
      { status: 500 },
    )
  }
}
