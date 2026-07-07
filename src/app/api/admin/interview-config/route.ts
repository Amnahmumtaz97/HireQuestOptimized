import { NextResponse } from 'next/server'
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
import { syncCatalogFromStatic, LEGACY_FLAT_INDUSTRY_KEYS } from '@/lib/interview-catalog/load'

export async function GET() {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

  await connectToDatabase()
  await syncCatalogFromStatic()

  const docs = await InterviewConfigModel.find({
    isActive: { $ne: false },
    industryKey: { $nin: [...LEGACY_FLAT_INDUSTRY_KEYS] },
  })
    .sort({ industryLabel: 1 })
    .lean()
  const departments = docs.map((doc) =>
    mongoDocToDepartmentDto(doc as Parameters<typeof mongoDocToDepartmentDto>[0]),
  )

  return NextResponse.json({
    departments,
    /** @deprecated Use `departments` */
    configs: departments.map(departmentToLegacyConfig),
  })
}

export async function POST(request: Request) {
  const adminCheck = await requireAdminSession()
  if (adminCheck.ok === false) {
    return NextResponse.json({ message: adminCheck.message }, { status: adminCheck.status })
  }

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

    const existing = await InterviewConfigModel.findOne({ industryKey: normalized.key }).lean()
    if (existing) {
      return NextResponse.json({ message: 'Department key already exists' }, { status: 409 })
    }

    const created = await InterviewConfigModel.create(departmentConfigToMongoPayload(normalized))
    const department = mongoDocToDepartmentDto(created.toObject() as Parameters<typeof mongoDocToDepartmentDto>[0])

    return NextResponse.json(
      { department, config: departmentToLegacyConfig(department) },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create department' },
      { status: 500 },
    )
  }
}
