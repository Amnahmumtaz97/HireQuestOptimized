import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongoose'
import { requireAdminSession } from '@/lib/admin-auth'
import { CertificationModel } from '@/models/Certification'
import { serializeCertificationAdmin } from '@/lib/certifications/serialize'
import { certWriteSchema } from '../route'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdminSession()
  if (check.ok === false) {
    return NextResponse.json({ message: check.message }, { status: check.status })
  }

  try {
    const { id } = await params
    await connectToDatabase()
    const cert = await CertificationModel.findById(id).lean()
    if (!cert) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ certification: serializeCertificationAdmin(cert) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load' },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdminSession()
  if (check.ok === false) {
    return NextResponse.json({ message: check.message }, { status: check.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const parsed = certWriteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    const updated = await CertificationModel.findByIdAndUpdate(
      id,
      { $set: parsed.data },
      { new: true, runValidators: true },
    ).lean()

    if (!updated) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ certification: serializeCertificationAdmin(updated) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to update' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const check = await requireAdminSession()
  if (check.ok === false) {
    return NextResponse.json({ message: check.message }, { status: check.status })
  }

  try {
    const { id } = await params
    await connectToDatabase()
    const deleted = await CertificationModel.findByIdAndDelete(id).lean()
    if (!deleted) {
      return NextResponse.json({ message: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to delete' },
      { status: 500 },
    )
  }
}
