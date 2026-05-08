import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { UserModel } from '@/models/User'

const updateAccountSchema = z.object({
  firstName: z.string().trim().min(1).max(60),
  lastName: z.string().trim().min(1).max(60),
  email: z.string().trim().email(),
  phoneNumber: z.string().trim().max(30).optional().default(''),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const sessionEmail = session?.user?.email?.toLowerCase().trim()

    if (!sessionEmail) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const user = await UserModel.findOne({ email: sessionEmail }).lean()

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    })
  } catch {
    return NextResponse.json(
      { message: 'Failed to load account settings' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const sessionEmail = session?.user?.email?.toLowerCase().trim()

    if (!sessionEmail) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const json = await request.json()
    const parsed = updateAccountSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const currentUser = await UserModel.findOne({ email: sessionEmail }).lean()
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const existingEmailOwner = await UserModel.findOne({
      email: parsed.data.email.toLowerCase(),
      _id: { $ne: currentUser._id },
    }).lean()

    if (existingEmailOwner) {
      return NextResponse.json(
        { message: 'Email is already in use' },
        { status: 409 },
      )
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: currentUser._id },
      {
        $set: {
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
          email: parsed.data.email.toLowerCase(),
          phoneNumber: parsed.data.phoneNumber,
        },
      },
      { returnDocument: 'after', runValidators: true },
    ).lean()

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: 'Account updated successfully',
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        email: updatedUser.email || '',
        phoneNumber: updatedUser.phoneNumber || '',
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json(
      { message: 'Failed to update account settings' },
      { status: 500 },
    )
  }
}
