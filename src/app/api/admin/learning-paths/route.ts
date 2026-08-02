import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongoose'
import { requireAdminSession } from '@/lib/admin-auth'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { serializePath } from '@/lib/learning-paths/serialize'

const pathCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(2000),
  targetAudience: z.string().trim().min(1).max(120),
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
    .optional()
    .default('technology'),
  tags: z.array(z.string().trim()).optional().default([]),
  subcategory: z.string().trim().max(80).optional().default(''),
  difficultyLabel: z.enum(['Beginner', 'Intermediate', 'Advanced']).nullable().optional(),
  estimatedMinutes: z.number().int().positive().nullable().optional(),
  isFeatured: z.boolean().optional().default(false),
  estimatedInterviews: z.number().int().positive().nullable().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase kebab-case')
    .optional()
    .nullable(),
})

export async function GET() {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  try {
    await connectToDatabase()
    const paths = await LearningPathModel.find({}).sort({ title: 1 }).lean()
    const pathIds = paths.map((p) => p._id)
    const stages = await StageModel.find({ pathId: { $in: pathIds } })
      .sort({ order: 1 })
      .lean()
    const byPath = new Map<string, typeof stages>()
    for (const s of stages) {
      const key = String(s.pathId)
      const list = byPath.get(key) ?? []
      list.push(s)
      byPath.set(key, list)
    }
    return NextResponse.json({
      paths: paths.map((p) => serializePath(p, byPath.get(String(p._id)) ?? [])),
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load paths' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  try {
    const body = await request.json()
    const parsed = pathCreateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    if (parsed.data.slug) {
      const existing = await LearningPathModel.findOne({ slug: parsed.data.slug }).lean()
      if (existing) {
        return NextResponse.json({ message: 'Slug already exists' }, { status: 409 })
      }
    }

    const created = await LearningPathModel.create({
      title: parsed.data.title,
      description: parsed.data.description,
      targetAudience: parsed.data.targetAudience,
      category: parsed.data.category,
      tags: parsed.data.tags,
      subcategory: parsed.data.subcategory || '',
      difficultyLabel: parsed.data.difficultyLabel ?? undefined,
      estimatedMinutes: parsed.data.estimatedMinutes ?? null,
      isFeatured: parsed.data.isFeatured ?? false,
      estimatedInterviews: parsed.data.estimatedInterviews ?? null,
      slug: parsed.data.slug || undefined,
    })

    return NextResponse.json(
      { path: serializePath(created.toObject(), []) },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create path' },
      { status: 500 },
    )
  }
}
