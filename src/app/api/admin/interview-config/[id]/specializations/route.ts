import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewConfigModel } from '@/models/InterviewConfig'
import { requireAdminSession } from '@/lib/admin-auth'
import {
  departmentToLegacyConfig,
  mongoDocToDepartmentDto,
  specializationPayloadSchema,
  specializationToRoleCategory,
} from '@/lib/interview-catalog/admin'

function validateId(id: string): NextResponse | null {
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid department id' }, { status: 400 })
  }
  return null
}

export async function POST(
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
    const parsed = specializationPayloadSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid specialization' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    const doc = await InterviewConfigModel.findById(id)
    if (!doc) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 })
    }

    const specialization = specializationToRoleCategory(parsed.data)
    if (doc.roleCategories.some((entry) => entry.key === specialization.key)) {
      return NextResponse.json({ message: 'Specialization key already exists' }, { status: 409 })
    }

    doc.roleCategories.push(specialization)
    await doc.save()

    const department = mongoDocToDepartmentDto(doc.toObject() as Parameters<typeof mongoDocToDepartmentDto>[0])
    return NextResponse.json({ department, config: departmentToLegacyConfig(department) }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to add specialization' },
      { status: 500 },
    )
  }
}
