import { NextResponse } from 'next/server'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewConfigModel } from '@/models/InterviewConfig'
import { requireAdminSession } from '@/lib/admin-auth'
import { departmentToLegacyConfig, mongoDocToDepartmentDto } from '@/lib/interview-catalog/admin'

const topicMutationSchema = z.object({
  kind: z.enum(['technical', 'behavioral']),
  topic: z.string().trim().min(1),
})

function validateId(id: string): NextResponse | null {
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid department id' }, { status: 400 })
  }
  return null
}

export async function POST(
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
    const parsed = topicMutationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid topic payload' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    const doc = await InterviewConfigModel.findById(id)
    if (!doc) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 })
    }

    const spec = doc.roleCategories.find((entry) => entry.key === specKey)
    if (!spec) {
      return NextResponse.json({ message: 'Specialization not found' }, { status: 404 })
    }

    const field = parsed.data.kind === 'technical' ? 'technicalTopics' : 'behavioralTopics'
    if (!spec[field].includes(parsed.data.topic)) {
      spec[field].push(parsed.data.topic)
    }

    await doc.save()
    const department = mongoDocToDepartmentDto(doc.toObject() as Parameters<typeof mongoDocToDepartmentDto>[0])
    return NextResponse.json({ department, config: departmentToLegacyConfig(department) }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to add topic' },
      { status: 500 },
    )
  }
}

export async function DELETE(
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
    const parsed = topicMutationSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid topic payload' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    const doc = await InterviewConfigModel.findById(id)
    if (!doc) {
      return NextResponse.json({ message: 'Department not found' }, { status: 404 })
    }

    const spec = doc.roleCategories.find((entry) => entry.key === specKey)
    if (!spec) {
      return NextResponse.json({ message: 'Specialization not found' }, { status: 404 })
    }

    const field = parsed.data.kind === 'technical' ? 'technicalTopics' : 'behavioralTopics'
    spec[field] = spec[field].filter((entry) => entry !== parsed.data.topic)

    await doc.save()
    const department = mongoDocToDepartmentDto(doc.toObject() as Parameters<typeof mongoDocToDepartmentDto>[0])
    return NextResponse.json({ department, config: departmentToLegacyConfig(department) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to remove topic' },
      { status: 500 },
    )
  }
}
