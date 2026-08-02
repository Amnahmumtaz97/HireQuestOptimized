import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { InterviewSetupModel } from '@/models/InterviewSetup'
import {
  interviewSetupConfigSchema,
  validateInterviewSetupForGenerate,
  effectiveTopics,
} from '@/lib/interview-config/setup-types'
import { getCategoryForTopic } from '@/lib/interview-taxonomy/taxonomy'
import { generateInterviewQuestions } from '@/lib/interview-questions/generate'
import { validatePathStageLinkage } from '@/lib/learning-paths/validate-link'
import { checkRateLimit } from '@/lib/rate-limit'
import { toSpecializationRef } from '@/lib/interview-catalog/resolve'

const bodySchema = z.object({
  setup: interviewSetupConfigSchema,
  learningPathId: z.string().nullable().optional(),
  learningStageId: z.string().nullable().optional(),
  pathRemediationId: z.string().nullable().optional(),
})

function interviewTypeFromRound(
  round: string | null | undefined,
): 'technical' | 'behavioral' | 'both' | 'hr' {
  if (round === 'behavioral' || round === 'managerial') return 'behavioral'
  if (round === 'system_design' || round === 'technical_screen') return 'technical'
  return 'technical'
}

function difficultyFromSetup(
  d: 'Easy' | 'Medium' | 'Hard' | 'Mixed' | null | undefined,
): 'Easy' | 'Medium' | 'Hard' | 'Adaptive' {
  if (d === 'Mixed') return 'Adaptive'
  if (d === 'Easy' || d === 'Medium' || d === 'Hard') return d
  return 'Medium'
}

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

  try {
    const raw = await request.json()
    const parsed = bodySchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid setup' },
        { status: 400 },
      )
    }

    const setup = parsed.data.setup
    const issues = validateInterviewSetupForGenerate(setup)
    if (issues.length > 0) {
      return NextResponse.json(
        { message: issues[0].message, issues },
        { status: 400 },
      )
    }

    const topics = effectiveTopics(setup)
    if (topics.length === 0) {
      return NextResponse.json({ message: 'No interview topics selected.' }, { status: 400 })
    }

    await connectToDatabase()

    let learningPathId = parsed.data.learningPathId ?? null
    let learningStageId = parsed.data.learningStageId ?? null
    const pathRemediationId = parsed.data.pathRemediationId ?? null
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
        requireCurrentStage: !pathRemediationId,
      })
      if (link.ok === false) {
        return NextResponse.json({ message: link.message }, { status: link.status })
      }
      const stageTopics = (link.stage.suggestedTopics || []).map((t) => t.trim()).filter(Boolean)
      if (stageTopics.length > 0 && !pathRemediationId) {
        const allowed = new Set(stageTopics.map((t) => t.toLowerCase()))
        const outside = topics.filter((t) => !allowed.has(t.toLowerCase()))
        if (outside.length > 0) {
          return NextResponse.json(
            {
              message: `Path stage topics are locked. Remove: ${outside.slice(0, 5).join(', ')}`,
            },
            { status: 400 },
          )
        }
      }
    }

    await InterviewSetupModel.create({
      userId: session.user.id,
      ...setup,
      topics,
    })

    // Persist as a normal InterviewSession so existing session UI works.
    // Topics are taxonomy topics only — no admin-catalog defaults.
    const interviewType = interviewTypeFromRound(setup.interviewRoundType)
    const difficulty = difficultyFromSetup(setup.difficulty)
    const departmentKey = 'software_engineering'
    const specializationKey = 'full_stack'
    const specializationRefs = [toSpecializationRef(departmentKey, specializationKey)]

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
      roleCategoryKey: specializationKey,
      specializationKey,
      specializationRefs,
      roleRefs: specializationRefs,
      specializationKeys: [specializationKey],
      roleCategoryKeys: [specializationKey],
      selectAllSpecializations: false,
      selectAllTopics: false,
      interviewType,
      interviewTypes,
      topics,
      difficulty,
      totalQuestions: setup.numberOfQuestions ?? 12,
      technicalQuestionRatio:
        interviewType === 'technical'
          ? 100
          : interviewType === 'behavioral' || interviewType === 'hr'
            ? 0
            : 70,
      durationMinutes: setup.interviewDuration ?? 30,
      status: 'created',
      entryMode: learningPathId ? 'path' : 'resume',
      learningPathId,
      learningStageId,
      pathRemediationId,
      resumeContext: {
        name: null,
        yearsExperience: setup.yearsExperience,
        seniorityLevel: setup.seniorityLevel,
        domain: setup.domain || setup.targetRole,
        skills: setup.extractedSkills,
        projects: setup.projects,
        targetRole: setup.targetRole,
        currentRole: setup.currentRole,
        categories: setup.categories,
        interviewRoundType: setup.interviewRoundType,
        preferredQuestionFormat: setup.preferredQuestionFormat,
        targetCompanyType: setup.targetCompanyType,
        focusAreas: setup.focusAreas,
        language: setup.language,
      },
    })

    const sessionId = String(created._id)

    const result = await generateInterviewQuestions({
      industryKey: departmentKey,
      industryKeys: [departmentKey],
      industryLabels: [setup.domain || setup.targetRole || 'Software'],
      roleCategoryKey: specializationKey,
      roleCategoryKeys: [specializationKey],
      roleCategoryLabels: [setup.targetRole || setup.currentRole || 'Candidate'],
      interviewType,
      interviewTypes,
      topics,
      difficulty,
      totalQuestions: setup.numberOfQuestions ?? 12,
      technicalQuestionRatio:
        interviewType === 'technical'
          ? 100
          : interviewType === 'behavioral' || interviewType === 'hr'
            ? 0
            : 70,
      resumeContext: {
        name: null,
        yearsExperience: setup.yearsExperience,
        seniorityLevel: setup.seniorityLevel,
        domain: setup.domain || setup.targetRole,
        skills: setup.extractedSkills,
        projects: setup.projects,
      },
      learningPathTitle: null,
      learningStageTitle: null,
      learningStageType: null,
      interviewSetup: {
        categories: setup.categories,
        topics,
        topicCategories: Object.fromEntries(
          topics.map((t) => [t, getCategoryForTopic(t)?.label ?? t]),
        ),
        difficulty: setup.difficulty,
        interviewRoundType: setup.interviewRoundType,
        preferredQuestionFormat: setup.preferredQuestionFormat,
        targetCompanyType: setup.targetCompanyType,
        focusAreas: setup.focusAreas || [],
        language: setup.language || 'English',
        targetRole: setup.targetRole,
        companies: setup.companies,
        achievements: setup.achievements,
      },
      allowTemplateFallback: false,
    })

    await InterviewSessionModel.updateOne(
      { _id: sessionId, userId: session.user.id },
      {
        $set: {
          questions: result.questions,
          questionSource: result.source,
        },
      },
    )

    return NextResponse.json({
      sessionId,
      source: result.source,
      warnings: result.warnings,
    })
  } catch (error) {
    console.error('[interviews/from-setup]', error)
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : 'Failed to create interview from setup',
      },
      { status: 500 },
    )
  }
}
