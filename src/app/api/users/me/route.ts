import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { UserModel } from '@/models/User'
import { SESSION_DIFFICULTIES } from '@/lib/interview-config/difficulty'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  await connectToDatabase()
  const user = await UserModel.findById(session.user.id).lean()
  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }
  return NextResponse.json({
    id: String(user._id),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  })
}

const patchSchema = z.object({
  preferences: z
    .object({
      defaultDifficulty: z.enum(SESSION_DIFFICULTIES).optional(),
      reduceMotion: z.boolean().optional(),
    })
    .optional(),
})

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  await connectToDatabase()
  const updates: Record<string, unknown> = {}
  if (parsed.data.preferences) {
    updates.preferences = parsed.data.preferences
  }

  const user = await UserModel.findByIdAndUpdate(
    session.user.id,
    { $set: updates },
    { new: true },
  ).lean()

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: String(user._id),
    preferences: user.preferences ?? {},
  })
}
