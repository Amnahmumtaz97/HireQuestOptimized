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
import {
  NON_CATALOG_SCOPE,
  preferredFormatForType,
} from '@/lib/interview-config/type-config'
import { normalizeSessionDifficulty } from '@/lib/interview-config/difficulty'
import { generateInterviewQuestions } from '@/lib/interview-questions/generate'
import { validatePathStageLinkage } from '@/lib/learning-paths/validate-link'
import { checkRateLimit } from '@/lib/rate-limit'

const bodySchema = z.object({
  setup: interviewSetupConfigSchema,
  learningPathId: z.string().nullable().optional(),
  learningStageId: z.string().nullable().optional(),
  pathRemediationId: z.string().nullable().optional(),
})

function resolveSetupInterviewType(setup: {
  interviewType?: string | null
  interviewRoundType?: string | null
}): {
  storedType: 'technical' | 'behavioral' | 'both' | 'hr' | 'coding' | 'system_design' | 'mixed'
  interviewTypes: Array<'technical' | 'behavioral' | 'hr' | 'coding' | 'system_design'>
  preferredQuestionFormat: 'coding' | 'scenario' | 'whiteboard' | 'mixed' | null
  technicalQuestionRatio: number
} {
  let raw = setup.interviewType
  if (!raw && setup.interviewRoundType === 'system_design') raw = 'system_design'
  if (!raw && setup.interviewRoundType === 'behavioral') raw = 'behavioral'
  if (!raw && setup.interviewRoundType === 'managerial') raw = 'hr'
  if (!raw) raw = 'technical'
  if (raw === 'both') raw = 'mixed'

  if (raw === 'coding') {
    return {
      storedType: 'coding',
      interviewTypes: ['coding'],
      preferredQuestionFormat: 'coding',
      technicalQuestionRatio: 100,
    }
  }
  if (raw === 'system_design') {
    return {
      storedType: 'system_design',
      interviewTypes: ['system_design'],
      preferredQuestionFormat: null,
      technicalQuestionRatio: 100,
    }
  }
  if (raw === 'mixed') {
    return {
      storedType: 'mixed',
      interviewTypes: ['technical', 'behavioral'],
      preferredQuestionFormat: null,
      technicalQuestionRatio: 70,
    }
  }
  if (raw === 'technical' || raw === 'behavioral' || raw === 'hr') {
    return {
      storedType: raw,
      interviewTypes: [raw],
      preferredQuestionFormat: null,
      technicalQuestionRatio:
        raw === 'technical' ? 100 : 0,
    }
  }
  return {
    storedType: 'technical',
    interviewTypes: ['technical'],
    preferredQuestionFormat: null,
    technicalQuestionRatio: 100,
  }
}

function difficultyFromSetup(
  d: 'Easy' | 'Medium' | 'Hard' | 'Mixed' | 'Adaptive' | null | undefined,
): 'Easy' | 'Medium' | 'Hard' | 'Adaptive' {
  return normalizeSessionDifficulty(d, 'Medium')
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
    const resolved = resolveSetupInterviewType(setup)
    const interviewType = resolved.storedType
    const interviewTypes = resolved.interviewTypes
    const preferredQuestionFormat =
      preferredFormatForType(interviewType) ??
      (setup.preferredQuestionFormat === 'coding' ? 'coding' : null)
    const difficulty = difficultyFromSetup(setup.difficulty)
    const departmentKey = NON_CATALOG_SCOPE.departmentKey
    const specializationKey = NON_CATALOG_SCOPE.specializationKey

    const created = await InterviewSessionModel.create({
      userId: session.user.id,
      industryKey: departmentKey,
      departmentKey,
      departmentKeys: [departmentKey],
      industryKeys: [departmentKey],
      roleCategoryKey: specializationKey,
      specializationKey,
      specializationRefs: [],
      roleRefs: [],
      specializationKeys: [specializationKey],
      roleCategoryKeys: [specializationKey],
      selectAllSpecializations: false,
      selectAllTopics: false,
      interviewType,
      interviewTypes,
      preferredQuestionFormat,
      topics,
      codingCategories: setup.codingCategories?.length ? setup.codingCategories : undefined,
      behavioralCompetencies: setup.behavioralCompetencies?.length
        ? setup.behavioralCompetencies
        : undefined,
      hrSections: setup.hrSections?.length ? setup.hrSections : undefined,
      systemDesignTopics: setup.systemDesignTopics?.length
        ? setup.systemDesignTopics
        : undefined,
      configPayload: {
        type: interviewType,
        topics,
        codingCategories: setup.codingCategories,
        behavioralCompetencies: setup.behavioralCompetencies,
        hrSections: setup.hrSections,
        systemDesignTopics: setup.systemDesignTopics,
      },
      difficulty,
      totalQuestions: setup.numberOfQuestions ?? 12,
      technicalQuestionRatio: resolved.technicalQuestionRatio,
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
        preferredQuestionFormat,
        targetCompanyType: setup.targetCompanyType,
        focusAreas: setup.focusAreas,
        language: setup.language,
      },
    })

    const sessionId = String(created._id)

    const result = await generateInterviewQuestions({
      industryKey: departmentKey,
      industryKeys: [departmentKey],
      industryLabels: [setup.domain || setup.targetRole || 'Practice'],
      roleCategoryKey: specializationKey,
      roleCategoryKeys: [specializationKey],
      roleCategoryLabels: [setup.targetRole || setup.currentRole || 'Candidate'],
      interviewType,
      interviewTypes,
      preferredQuestionFormat,
      topics,
      difficulty,
      totalQuestions: setup.numberOfQuestions ?? 12,
      technicalQuestionRatio: resolved.technicalQuestionRatio,
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
        topicCategories: Object.fromEntries(topics.map((t) => [t, t])),
        difficulty: setup.difficulty,
        interviewRoundType: setup.interviewRoundType,
        preferredQuestionFormat,
        targetCompanyType: setup.targetCompanyType,
        focusAreas: setup.focusAreas || [],
        language: setup.language || 'English',
        targetRole: setup.targetRole,
        companies: setup.companies,
        achievements: setup.achievements,
      },
      allowTemplateFallback: false,
      configPayload: {
        type: interviewType,
        topics,
      },
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
      { message: 'Failed to create interview from setup. Please try again.' },
      { status: 500 },
    )
  }
}
