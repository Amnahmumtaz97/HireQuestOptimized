import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { generateInterviewQuestions } from '@/lib/interview-questions/generate'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid interview id' }, { status: 400 })
  }

  try {
    const url = new URL(request.url)
    void url // reserved for future debug flags

    await connectToDatabase()
    const doc = await InterviewSessionModel.findOne({
      _id: id,
      userId: session.user.id,
    }).lean()

    if (!doc) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }

    const result = await generateInterviewQuestions({
      industryKey: doc.industryKey,
      roleCategoryKey: doc.roleCategoryKey,
      interviewType: doc.interviewType,
      topics: doc.topics,
      difficulty: doc.difficulty,
      totalQuestions: doc.totalQuestions,
      technicalQuestionRatio: doc.technicalQuestionRatio,
    })

    const updated = await InterviewSessionModel.findOneAndUpdate(
      { _id: id, userId: session.user.id },
      {
        $set: {
          questions: result.questions,
          questionSource: result.source,
        },
      },
      { returnDocument: 'after' },
    ).lean()

    if (!updated) {
      return NextResponse.json({ message: 'Failed to update interview' }, { status: 500 })
    }

    return NextResponse.json({
      session: updated,
      source: result.source,
      warnings: result.warnings,
    })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to generate questions' },
      { status: 500 },
    )
  }
}
