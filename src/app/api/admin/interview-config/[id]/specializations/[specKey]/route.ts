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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; specKey: string }> },
) {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  const { id, specKey } = await params
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

    const index = doc.roleCategories.findIndex((entry) => entry.key === specKey)
    if (index === -1) {
      return NextResponse.json({ message: 'Specialization not found' }, { status: 404 })
    }

    const next = specializationToRoleCategory(parsed.data)
    if (next.key !== specKey && doc.roleCategories.some((entry) => entry.key === next.key)) {
      return NextResponse.json({ message: 'Specialization key already exists' }, { status: 409 })
    }

    doc.roleCategories[index] = next
    await doc.save()

    const department = mongoDocToDepartmentDto(doc.toObject() as Parameters<typeof mongoDocToDepartmentDto>[0])
    return NextResponse.json({ department, config: departmentToLegacyConfig(department) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update specialization' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; specKey: string }> },
) {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  const { id, specKey } = await params
  const idError = validateId(id)
  if (idError) return idError

  await connectToDatabase()
  const doc = await InterviewConfigModel.findById(id)
  if (!doc) {
    return NextResponse.json({ message: 'Department not found' }, { status: 404 })
  }

  const before = doc.roleCategories.length
  doc.roleCategories = doc.roleCategories.filter((entry) => entry.key !== specKey)
  if (doc.roleCategories.length === before) {
    return NextResponse.json({ message: 'Specialization not found' }, { status: 404 })
  }

  await doc.save()
  const department = mongoDocToDepartmentDto(doc.toObject() as Parameters<typeof mongoDocToDepartmentDto>[0])
  return NextResponse.json({ department, config: departmentToLegacyConfig(department) })
}
