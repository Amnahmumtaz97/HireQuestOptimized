import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { serializePath } from '@/lib/learning-paths/serialize'
import { visibilityQuery } from '@/lib/learning-paths/constants'
import { popularPathIds, recommendPathsForUser } from '@/lib/learning-paths/recommend'

const DEFAULT_PAGE_SIZE = 8
const MAX_PAGE_SIZE = 24

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const audience = searchParams.get('audience')?.trim()
    const category = searchParams.get('category')?.trim()
    const subcategory = searchParams.get('subcategory')?.trim()
    const tag = searchParams.get('tag')?.trim()
    const difficulty = searchParams.get('difficulty')?.trim()
    const q = searchParams.get('q')?.trim()
    const sort = (searchParams.get('sort') || 'title').trim()
    const pageRaw = Number(searchParams.get('page') || '1')
    const limitRaw = Number(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE))
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : DEFAULT_PAGE_SIZE),
    )
    const skip = (page - 1) * limit

    await connectToDatabase()

    const query: Record<string, unknown> = {
      ...visibilityQuery(session.user.id),
    }
    const idsParam = searchParams.get('ids')?.trim()
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => isValidObjectId(id))
      query._id = { $in: ids }
    }
    if (audience) query.targetAudience = audience
    if (category) query.category = category
    if (subcategory) query.subcategory = subcategory
    if (tag) query.tags = tag
    if (difficulty) query.difficultyLabel = difficulty
    if (q) {
      query.$and = [
        ...(Array.isArray(query.$and) ? (query.$and as object[]) : []),
        {
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
            { subcategory: { $regex: q, $options: 'i' } },
          ],
        },
      ]
    }

    if (sort === 'recommended') {
      const recommended = await recommendPathsForUser(session.user.id, 100)
      let filtered = recommended.map((r) => r.path)
      if (category) filtered = filtered.filter((p) => p.category === category)
      if (subcategory) filtered = filtered.filter((p) => p.subcategory === subcategory)
      if (tag) filtered = filtered.filter((p) => (p.tags || []).includes(tag))
      if (difficulty) filtered = filtered.filter((p) => p.difficultyLabel === difficulty)
      if (q) {
        const needle = q.toLowerCase()
        filtered = filtered.filter(
          (p) =>
            p.title.toLowerCase().includes(needle) ||
            p.description.toLowerCase().includes(needle) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(needle)),
        )
      }
      const total = filtered.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const slice = filtered.slice(skip, skip + limit)
      return NextResponse.json({
        paths: slice,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    }

    let sortSpec: Record<string, 1 | -1> = { title: 1 }
    if (sort === 'new') sortSpec = { createdAt: -1 }
    if (sort === 'popular') {
      const popular = await popularPathIds(200)
      const all = await LearningPathModel.find(query).lean()
      all.sort((a, b) => {
        const ca = popular.get(String(a._id)) || 0
        const cb = popular.get(String(b._id)) || 0
        if (cb !== ca) return cb - ca
        return a.title.localeCompare(b.title)
      })
      const total = all.length
      const totalPages = Math.max(1, Math.ceil(total / limit))
      const pageDocs = all.slice(skip, skip + limit)
      const pathIds = pageDocs.map((p) => p._id)
      const stages = await StageModel.find({ pathId: { $in: pathIds } })
        .sort({ order: 1 })
        .lean()
      const stagesByPath = new Map<string, typeof stages>()
      for (const stage of stages) {
        const key = String(stage.pathId)
        const list = stagesByPath.get(key) ?? []
        list.push(stage)
        stagesByPath.set(key, list)
      }
      return NextResponse.json({
        paths: pageDocs.map((p) =>
          serializePath(p, stagesByPath.get(String(p._id)) ?? []),
        ),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      })
    }

    const [total, paths] = await Promise.all([
      LearningPathModel.countDocuments(query),
      LearningPathModel.find(query).sort(sortSpec).skip(skip).limit(limit).lean(),
    ])

    const pathIds = paths.map((p) => p._id)
    const stages = await StageModel.find({ pathId: { $in: pathIds } })
      .sort({ order: 1 })
      .lean()

    const stagesByPath = new Map<string, typeof stages>()
    for (const stage of stages) {
      const key = String(stage.pathId)
      const list = stagesByPath.get(key) ?? []
      list.push(stage)
      stagesByPath.set(key, list)
    }

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      paths: paths.map((p) =>
        serializePath(p, stagesByPath.get(String(p._id)) ?? []),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load learning paths' },
      { status: 500 },
    )
  }
}
