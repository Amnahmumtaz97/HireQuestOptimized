import { NextResponse } from 'next/server'
import { isValidObjectId, Types } from 'mongoose'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongoose'
import { requireAdminSession } from '@/lib/admin-auth'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { serializePath } from '@/lib/learning-paths/serialize'

const stageSchema = z.object({
  id: z.string().optional(),
  order: z.number().int().positive(),
  title: z.string().trim().min(1).max(200),
  type: z.enum(['concept', 'practice', 'mock_interview', 'ai_feedback']),
  contentRef: z.string().trim().max(5000).optional().default(''),
  unlockMinScore: z.number().min(0).max(100).nullable().optional(),
  level: z.number().int().min(1).max(6).nullable().optional(),
  departmentKey: z.string().trim().optional().default(''),
  specializationKeys: z.array(z.string().trim()).optional().default([]),
  interviewType: z
    .enum(['technical', 'behavioral', 'both', 'hr'])
    .nullable()
    .optional(),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Adaptive']).nullable().optional(),
  suggestedTopics: z.array(z.string().trim()).optional().default([]),
  totalQuestions: z.number().int().positive().nullable().optional(),
  technicalQuestionRatio: z.number().int().min(0).max(100).nullable().optional(),
})

const replaceStagesSchema = z.object({
  stages: z.array(stageSchema).min(1),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid path id' }, { status: 400 })
  }

  try {
    const body = await request.json()
    const parsed = replaceStagesSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    const path = await LearningPathModel.findById(id).lean()
    if (!path) {
      return NextResponse.json({ message: 'Path not found' }, { status: 404 })
    }

    const now = new Date()
    const pathOid = new Types.ObjectId(id)
    await StageModel.deleteMany({ pathId: pathOid })

    const docs = parsed.data.stages.map((s) => ({
      _id:
        s.id && isValidObjectId(s.id) ? new Types.ObjectId(s.id) : new Types.ObjectId(),
      pathId: pathOid,
      order: s.order,
      title: s.title,
      type: s.type,
      contentRef: s.contentRef || '',
      unlockMinScore:
        typeof s.unlockMinScore === 'number' ? s.unlockMinScore : null,
      level: typeof s.level === 'number' ? s.level : null,
      departmentKey: s.departmentKey || '',
      specializationKeys: s.specializationKeys || [],
      ...(s.interviewType ? { interviewType: s.interviewType } : {}),
      ...(s.difficulty ? { difficulty: s.difficulty } : {}),
      suggestedTopics: s.suggestedTopics || [],
      totalQuestions:
        typeof s.totalQuestions === 'number' ? s.totalQuestions : null,
      technicalQuestionRatio:
        typeof s.technicalQuestionRatio === 'number'
          ? s.technicalQuestionRatio
          : null,
      createdAt: now,
      updatedAt: now,
    }))

    await StageModel.insertMany(docs)
    const stages = await StageModel.find({ pathId: id }).sort({ order: 1 }).lean()
    return NextResponse.json({ path: serializePath(path, stages) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to save stages' },
      { status: 500 },
    )
  }
}
