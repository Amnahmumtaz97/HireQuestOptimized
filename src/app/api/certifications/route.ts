import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { CertificationModel } from '@/models/Certification'
import { serializeCertification } from '@/lib/certifications/serialize'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 36

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const category = searchParams.get('category')?.trim()
    const cost = searchParams.get('cost')?.trim()
    const level = searchParams.get('level')?.trim()
    const credentialType = searchParams.get('credentialType')?.trim()
    const provider = searchParams.get('provider')?.trim()
    const role = searchParams.get('role')?.trim()
    const linkedin = searchParams.get('linkedin')
    const exam = searchParams.get('exam')
    const sort = (searchParams.get('sort') || 'featured').trim()
    const pageRaw = Number(searchParams.get('page') || '1')
    const limitRaw = Number(searchParams.get('limit') || String(DEFAULT_PAGE_SIZE))
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : DEFAULT_PAGE_SIZE),
    )
    const skip = (page - 1) * limit

    await connectToDatabase()

    const query: Record<string, unknown> = { isPublished: true }

    const idsParam = searchParams.get('ids')?.trim()
    if (idsParam) {
      const ids = idsParam
        .split(',')
        .map((id) => id.trim())
        .filter((id) => isValidObjectId(id))
      query._id = { $in: ids }
    }

    if (category) query.category = category
    if (cost) query.costType = cost
    if (level) query.level = level
    if (credentialType) query.credentialType = credentialType
    if (provider) query.providerSlug = provider.toLowerCase()
    if (role) query.roles = { $in: [role] }
    if (linkedin === 'true') query.linkedinSupported = true
    if (exam === 'true') query.examRequired = true
    if (exam === 'false') query.examRequired = false

    if (q) {
      query.$and = [
        ...(Array.isArray(query.$and) ? (query.$and as object[]) : []),
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { provider: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { skills: { $elemMatch: { $regex: q, $options: 'i' } } },
            { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
            { roles: { $elemMatch: { $regex: q, $options: 'i' } } },
          ],
        },
      ]
    }

    let sortSpec: Record<string, 1 | -1> = { isFeatured: -1, name: 1 }
    if (sort === 'newest') sortSpec = { createdAt: -1 }
    if (sort === 'shortest') sortSpec = { estimatedHours: 1, name: 1 }

    const [total, certs] = await Promise.all([
      CertificationModel.countDocuments(query),
      CertificationModel.find(query).sort(sortSpec).skip(skip).limit(limit).lean(),
    ])

    const totalPages = Math.max(1, Math.ceil(total / limit))

    return NextResponse.json({
      certifications: certs.map(serializeCertification),
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
      { message: 'Failed to load certifications' },
      { status: 500 },
    )
  }
}
