import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'

const createInterviewSchema = z.object({
  industryKey: z.string().trim().min(1),
  roleCategoryKey: z.string().trim().min(1),
  interviewType: z.enum(['technical', 'behavioral', 'both']),
  topics: z.array(z.string().trim().min(1)).min(1),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  totalQuestions: z.number().int().positive(),
  technicalQuestionRatio: z.number().int().min(0).max(100),
  durationMinutes: z.number().int().positive().nullable().optional(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()
    const sessions = await InterviewSessionModel.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    return NextResponse.json({ sessions })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to fetch interviews' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const parsed = createInterviewSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const created = await InterviewSessionModel.create({
      userId: session.user.id,
      ...parsed.data,
      status: 'created',
    })

    return NextResponse.json({ session: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create interview' },
      { status: 500 },
    )
  }
}

