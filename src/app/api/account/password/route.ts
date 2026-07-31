import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { UserModel } from '@/models/User'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const sessionEmail = session?.user?.email?.toLowerCase().trim()

    if (!sessionEmail) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = changePasswordSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    const user = await UserModel.findOne({ email: sessionEmail })
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          message:
            'This account uses social sign-in and does not have a password to change.',
        },
        { status: 400 },
      )
    }

    const matches = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    )
    if (!matches) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 },
      )
    }

    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return NextResponse.json(
        { message: 'New password must be different from the current password' },
        { status: 400 },
      )
    }

    user.passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
    await user.save()

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch {
    return NextResponse.json(
      { message: 'Failed to update password' },
      { status: 500 },
    )
  }
}
