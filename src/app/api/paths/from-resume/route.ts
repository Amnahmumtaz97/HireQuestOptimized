import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { Types } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel, type IStage, type StageType } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { serializePath, serializeProgress } from '@/lib/learning-paths/serialize'

const bodySchema = z.object({
  skills: z.array(z.string().trim().min(1)).min(1).max(20),
  title: z.string().trim().min(1).max(200).optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    const skills = parsed.data.skills.map((s) => s.trim()).filter(Boolean)
    const slug = `resume-${session.user.id.slice(-8)}-${Date.now().toString(36)}`
    const title = parsed.data.title || 'My Resume Learning Path'

    await connectToDatabase()

    const path = await LearningPathModel.create({
      title,
      description:
        'Personalized path from your confirmed resume skills. Practice, focus weak areas, then take a final mock.',
      targetAudience: 'resume',
      slug,
      category: 'resume',
      tags: skills.slice(0, 8),
      estimatedInterviews: 4,
      ownerUserId: session.user.id,
    })

    const pathId = path._id as Types.ObjectId
    const practiceTopics = skills.slice(0, 8)
    const mid = practiceTopics.slice(0, Math.ceil(practiceTopics.length / 2))
    const rest = practiceTopics.slice(Math.ceil(practiceTopics.length / 2))

    type StageInput = {
      order: number
      level: number
      title: string
      type: StageType
      contentRef: string
      unlockMinScore?: number | null
      departmentKey?: string
      specializationKeys?: string[]
      interviewType?: IStage['interviewType']
      difficulty?: IStage['difficulty']
      suggestedTopics?: string[]
      totalQuestions?: number | null
      technicalQuestionRatio?: number | null
    }

    const stageInputs: StageInput[] = [
      {
        order: 1,
        level: 1,
        title: 'Skills confirmed',
        type: 'concept',
        contentRef: `You confirmed: ${skills.join(', ')}. Complete practice interviews next.`,
      },
      {
        order: 2,
        level: 2,
        title: 'Core skills practice',
        type: 'practice',
        contentRef: 'Practice interviews on your primary confirmed skills.',
        departmentKey: 'software_engineering',
        specializationKeys: ['full_stack'],
        interviewType: 'technical',
        difficulty: 'Easy',
        suggestedTopics: mid.length ? mid : practiceTopics,
        totalQuestions: 10,
        technicalQuestionRatio: 80,
      },
      {
        order: 3,
        level: 3,
        title: 'Extended skills practice',
        type: 'practice',
        contentRef: 'Cover remaining confirmed skills at medium difficulty.',
        departmentKey: 'software_engineering',
        specializationKeys: ['full_stack'],
        interviewType: 'technical',
        difficulty: 'Medium',
        suggestedTopics: rest.length ? rest : practiceTopics,
        totalQuestions: 12,
        technicalQuestionRatio: 80,
      },
      {
        order: 4,
        level: 6,
        title: 'Final mock interview',
        type: 'mock_interview',
        contentRef: 'Full mock across your confirmed skill set.',
        unlockMinScore: 70,
        departmentKey: 'software_engineering',
        specializationKeys: ['full_stack'],
        interviewType: 'both',
        difficulty: 'Hard',
        suggestedTopics: practiceTopics,
        totalQuestions: 15,
        technicalQuestionRatio: 70,
      },
      {
        order: 5,
        level: 6,
        title: 'Review feedback',
        type: 'ai_feedback',
        contentRef: 'Review results and retake weak topics.',
      },
    ]

    await StageModel.insertMany(
      stageInputs.map((s) => ({
        pathId,
        order: s.order,
        level: s.level,
        title: s.title,
        type: s.type,
        contentRef: s.contentRef,
        unlockMinScore: s.unlockMinScore ?? null,
        departmentKey: s.departmentKey || '',
        specializationKeys: s.specializationKeys || [],
        interviewType: s.interviewType,
        difficulty: s.difficulty,
        suggestedTopics: s.suggestedTopics || [],
        totalQuestions: s.totalQuestions ?? null,
        technicalQuestionRatio: s.technicalQuestionRatio ?? null,
      })),
    )

    const stages = await StageModel.find({ pathId }).sort({ order: 1 }).lean()
    const firstStage = stages[0]

    const progress = await UserPathProgressModel.findOneAndUpdate(
      { userId: session.user.id, pathId },
      {
        $setOnInsert: {
          userId: session.user.id,
          pathId,
          currentStageId: firstStage?._id ?? null,
          completedStageIds: [],
          stageScores: {},
          status: 'in_progress',
          startedAt: new Date(),
          lastActivityAt: new Date(),
        },
      },
      { upsert: true, returnDocument: 'after' },
    )

    const pathDoc = await LearningPathModel.findById(pathId).lean()
    return NextResponse.json(
      {
        path: serializePath(pathDoc!, stages),
        progress: progress ? serializeProgress(progress.toObject(), stages) : null,
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create resume path' },
      { status: 500 },
    )
  }
}
