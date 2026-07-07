import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewConfigModel } from '@/models/InterviewConfig'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  departmentPayloadSchema,
  departmentToLegacyConfig,
  mongoDocToDepartmentDto,
  normalizeDepartmentPayload,
  validateDepartmentUniqueness,
  departmentConfigToMongoPayload,
} from '@/lib/interview-catalog/admin'

function validateId(id: string): NextResponse | null {
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid department id' }, { status: 400 })
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
  if (idError) return idError

  try {
    const body = await request.json()
    const parsed = departmentPayloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid payload' },
        { status: 400 },
      )
    }

    const normalized = normalizeDepartmentPayload(parsed.data)
    const uniquenessError = validateDepartmentUniqueness(normalized)
    if (uniquenessError) {
      return NextResponse.json({ message: uniquenessError }, { status: 400 })
    }

    await connectToDatabase()

    const duplicate = await InterviewConfigModel.findOne({
      industryKey: normalized.key,
      _id: { $ne: id },
    }).lean()
    if (duplicate) {
      return NextResponse.json({ message: 'Department key already used' }, { status: 409 })
    }

    const updated = await InterviewConfigModel.findByIdAndUpdate(
      id,
      departmentConfigToMongoPayload(normalized),
      { returnDocument: 'after', runValidators: true },
    ).lean()

    if (!updated) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 })
    }

    const department = mongoDocToDepartmentDto(updated as Parameters<typeof mongoDocToDepartmentDto>[0])
    return NextResponse.json({ department, config: departmentToLegacyConfig(department) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update department' },
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
  if (idError) return idError

  await connectToDatabase()

  const deleted = await InterviewConfigModel.findByIdAndDelete(id).lean()
  if (!deleted) {
    return NextResponse.json({ message: 'Department not found' }, { status: 404 })
  }

  return NextResponse.json({ message: 'Department deleted successfully' })
}
