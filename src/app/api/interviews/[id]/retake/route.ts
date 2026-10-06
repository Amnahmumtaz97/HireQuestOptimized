import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { retakeSessionPayload } from '@/lib/interview/retake'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid interview id' }, { status: 400 })
  }

  try {
    await connectToDatabase()
    const doc = await InterviewSessionModel.findOne({
      _id: id,
      userId: session.user.id,
    }).lean()

    if (!doc) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }

    const payload = retakeSessionPayload(doc as unknown as Record<string, unknown>, session.user.id)
    if (!payload) {
      return NextResponse.json(
        { message: 'This interview has no questions to reuse.' },
        { status: 400 },
      )
    }

    const created = await InterviewSessionModel.create(payload)
    return NextResponse.json({ sessionId: String(created._id) }, { status: 201 })
  } catch (error) {
    console.error('[interviews/retake]', error)
    return NextResponse.json(
      { message: 'Could not start a retake. Please try again.' },
      { status: 500 },
    )
  }
}
