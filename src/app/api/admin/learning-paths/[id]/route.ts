import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongoose'
import { requireAdminSession } from '@/lib/admin-auth'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { serializePath } from '@/lib/learning-paths/serialize'

const pathPatchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  targetAudience: z.string().trim().min(1).max(120).optional(),
  category: z
    .enum([
      'technology',
      'role',
      'company',
      'skills',
      'dsa',
      'system_design',
      'project',
      'resume',
    ])
    .optional(),
  tags: z.array(z.string().trim()).optional(),
  subcategory: z.string().trim().max(80).optional(),
  difficultyLabel: z.enum(['Beginner', 'Intermediate', 'Advanced']).nullable().optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  isFeatured: z.boolean().optional(),
  estimatedInterviews: z.number().int().positive().nullable().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .nullable()
    .optional(),
})

export async function GET(
  _request: Request,
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
    await connectToDatabase()
    const path = await LearningPathModel.findById(id).lean()
    if (!path) {
      return NextResponse.json({ message: 'Path not found' }, { status: 404 })
    }
    const stages = await StageModel.find({ pathId: id }).sort({ order: 1 }).lean()
    return NextResponse.json({ path: serializePath(path, stages) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load path' },
      { status: 500 },
    )
  }
}

export async function PATCH(
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
    const parsed = pathPatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    if (parsed.data.slug) {
      const clash = await LearningPathModel.findOne({
        slug: parsed.data.slug,
        _id: { $ne: id },
      }).lean()
      if (clash) {
        return NextResponse.json({ message: 'Slug already exists' }, { status: 409 })
      }
    }

    const updated = await LearningPathModel.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { returnDocument: 'after' },
    ).lean()
    if (!updated) {
      return NextResponse.json({ message: 'Path not found' }, { status: 404 })
    }
    const stages = await StageModel.find({ pathId: id }).sort({ order: 1 }).lean()
    return NextResponse.json({ path: serializePath(updated, stages) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update path' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
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
    await connectToDatabase()
    const deleted = await LearningPathModel.findByIdAndDelete(id).lean()
    if (!deleted) {
      return NextResponse.json({ message: 'Path not found' }, { status: 404 })
    }
    await StageModel.deleteMany({ pathId: id })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete path' },
      { status: 500 },
    )
  }
}
