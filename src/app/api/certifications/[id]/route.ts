import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { CertificationModel } from '@/models/Certification'
import { LearningPathModel } from '@/models/LearningPath'
import { serializeCertification } from '@/lib/certifications/serialize'
import { selectRelatedPaths } from '@/lib/learning-paths/related-certs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectToDatabase()

    const cert = await CertificationModel.findOne({ _id: id, isPublished: true }).lean()
    if (!cert) {
      return NextResponse.json({ message: 'Certification not found' }, { status: 404 })
    }

    const catalogPaths = await LearningPathModel.find({
      $or: [{ ownerUserId: null }, { ownerUserId: { $exists: false } }],
    })
      .select('title slug category subcategory tags')
      .lean()

    const relatedPaths = selectRelatedPaths(cert, catalogPaths.map((path) => ({
      id: String(path._id),
      title: path.title,
      slug: path.slug ?? null,
      category: path.category,
      subcategory: path.subcategory,
      tags: path.tags ?? [],
    })))

    return NextResponse.json({
      certification: serializeCertification(cert),
      relatedPaths,
    })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load certification' },
      { status: 500 },
    )
  }
}
