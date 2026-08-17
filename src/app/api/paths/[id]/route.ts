import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { LearningPathModel } from '@/models/LearningPath'
import { StageModel } from '@/models/Stage'
import { UserPathProgressModel } from '@/models/UserPathProgress'
import { CertificationModel } from '@/models/Certification'
import { serializePath, serializeProgress } from '@/lib/learning-paths/serialize'
import { serializeCertification } from '@/lib/certifications/serialize'
import { visibilityQuery } from '@/lib/learning-paths/constants'
import {
  pathMatchInputFromDoc,
  selectRelatedCertifications,
} from '@/lib/learning-paths/related-certs'

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
    if (!isValidObjectId(id)) {
      return NextResponse.json({ message: 'Invalid path id' }, { status: 400 })
    }

    await connectToDatabase()
    // Visibility filter prevents reading other users' private (resume) paths.
    const path = await LearningPathModel.findOne({
      _id: id,
      ...visibilityQuery(session.user.id),
    }).lean()
    if (!path) {
      return NextResponse.json({ message: 'Path not found' }, { status: 404 })
    }

    const [stages, progress, publishedCerts] = await Promise.all([
      StageModel.find({ pathId: id }).sort({ order: 1 }).lean(),
      UserPathProgressModel.findOne({
        userId: session.user.id,
        pathId: id,
      }).lean(),
      CertificationModel.find({ isPublished: true }).lean(),
    ])

    const related = selectRelatedCertifications(
      pathMatchInputFromDoc({
        title: path.title,
        slug: path.slug,
        category: path.category,
        subcategory: path.subcategory,
        tags: path.tags,
        stages,
      }),
      publishedCerts,
    )

    return NextResponse.json({
      path: serializePath(path, stages),
      progress: progress ? serializeProgress(progress, stages) : null,
      relatedCertifications: related.map((cert) => serializeCertification(cert)),
    })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load learning path' },
      { status: 500 },
    )
  }
}
