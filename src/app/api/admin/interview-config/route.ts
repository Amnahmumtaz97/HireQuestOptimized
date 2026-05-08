import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewConfigModel } from '@/models/InterviewConfig'
import {
  interviewConfigPayloadSchema,
  normalizeInterviewConfigPayload,
  validateInterviewConfigUniqueness,
} from '@/lib/interview-config'
import { requireAdminSession } from '@/lib/admin-auth'

export async function GET() {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  await connectToDatabase()

  const configs = await InterviewConfigModel.find()
    .sort({ industryLabel: 1 })
    .lean()

  return NextResponse.json({ configs })
}

export async function POST(request: Request) {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  try {
    const body = await request.json()
    const parsed = interviewConfigPayloadSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      )
    }

    const normalizedPayload = normalizeInterviewConfigPayload(parsed.data)
    const uniquenessError = validateInterviewConfigUniqueness(normalizedPayload)
    if (uniquenessError) {
      return NextResponse.json({ message: uniquenessError }, { status: 400 })
    }

    await connectToDatabase()

    const existing = await InterviewConfigModel.findOne({
      industryKey: normalizedPayload.industryKey,
    }).lean()
    if (existing) {
      return NextResponse.json(
        { message: 'Industry config already exists' },
        { status: 409 },
      )
    }

    const created = await InterviewConfigModel.create(normalizedPayload)
    return NextResponse.json({ config: created }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create config' },
      { status: 500 },
    )
  }
}
