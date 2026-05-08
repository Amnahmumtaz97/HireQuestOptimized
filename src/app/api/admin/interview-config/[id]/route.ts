import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewConfigModel } from '@/models/InterviewConfig'
import {
  interviewConfigPayloadSchema,
  normalizeInterviewConfigPayload,
  validateInterviewConfigUniqueness,
} from '@/lib/interview-config'
import { requireAdminSession } from '@/lib/admin-auth'

function validateId(id: string): NextResponse | null {
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid config id' }, { status: 400 })
  }

  return null
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
  const idError = validateId(id)
  if (idError) {
    return idError
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

    const duplicateIndustry = await InterviewConfigModel.findOne({
      industryKey: normalizedPayload.industryKey,
      _id: { $ne: id },
    }).lean()
    if (duplicateIndustry) {
      return NextResponse.json(
        { message: 'Industry key already used by another config' },
        { status: 409 },
      )
    }

    const updated = await InterviewConfigModel.findByIdAndUpdate(id, normalizedPayload, {
      returnDocument: 'after',
      runValidators: true,
    }).lean()

    if (!updated) {
      return NextResponse.json({ message: 'Config not found' }, { status: 404 })
    }

    return NextResponse.json({ config: updated })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update config' },
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
  const idError = validateId(id)
  if (idError) {
    return idError
  }

  await connectToDatabase()

  const deleted = await InterviewConfigModel.findByIdAndDelete(id).lean()
  if (!deleted) {
    return NextResponse.json({ message: 'Config not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Config deleted successfully' })
}
