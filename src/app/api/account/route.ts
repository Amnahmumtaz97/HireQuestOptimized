import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { UserModel } from '@/models/User'
import { SESSION_DIFFICULTIES } from '@/lib/interview-config/difficulty'

const preferencesSchema = z
  .object({
    defaultDifficulty: z.enum(SESSION_DIFFICULTIES).optional().nullable(),
    reduceMotion: z.boolean().optional(),
  })
  .optional()

const updateAccountSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  email: z.string().trim().email().optional(),
  phoneNumber: z.string().trim().max(30).optional(),
  preferences: preferencesSchema,
})

function serializeAccount(user: {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  authProvider?: string
  passwordHash?: string
  preferences?: { defaultDifficulty?: string; reduceMotion?: boolean }
}) {
  return {
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    authProvider: user.authProvider || 'credentials',
    hasPassword: Boolean(user.passwordHash),
    preferences: {
      defaultDifficulty: user.preferences?.defaultDifficulty ?? null,
      reduceMotion: Boolean(user.preferences?.reduceMotion),
    },
  }
}

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

    return NextResponse.json(serializeAccount(user))
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

    const currentUser = await UserModel.findOne({ email: sessionEmail })
    if (!currentUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    const data = parsed.data
    const $set: Record<string, unknown> = {}

    if (data.firstName !== undefined) $set.firstName = data.firstName
    if (data.lastName !== undefined) $set.lastName = data.lastName
    if (data.phoneNumber !== undefined) $set.phoneNumber = data.phoneNumber

    if (data.email !== undefined) {
      const nextEmail = data.email.toLowerCase()
      const existingEmailOwner = await UserModel.findOne({
        email: nextEmail,
        _id: { $ne: currentUser._id },
      }).lean()

      if (existingEmailOwner) {
        return NextResponse.json(
          { message: 'Email is already in use' },
          { status: 409 },
        )
      }
      $set.email = nextEmail
    }

    if (data.preferences) {
      if (data.preferences.defaultDifficulty !== undefined) {
        $set['preferences.defaultDifficulty'] =
          data.preferences.defaultDifficulty === null
            ? undefined
            : data.preferences.defaultDifficulty
      }
      if (data.preferences.reduceMotion !== undefined) {
        $set['preferences.reduceMotion'] = data.preferences.reduceMotion
      }
    }

    if (Object.keys($set).length === 0) {
      return NextResponse.json(
        { message: 'No changes provided', ...serializeAccount(currentUser.toObject()) },
        { status: 200 },
      )
    }

    // Clear difficulty when null by unsetting
    const $unset: Record<string, 1> = {}
    if (data.preferences?.defaultDifficulty === null) {
      delete $set['preferences.defaultDifficulty']
      $unset['preferences.defaultDifficulty'] = 1
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: currentUser._id },
      {
        ...(Object.keys($set).length ? { $set } : {}),
        ...(Object.keys($unset).length ? { $unset } : {}),
      },
      { returnDocument: 'after', runValidators: true },
    ).lean()

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: 'Account updated successfully',
        ...serializeAccount(updatedUser),
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
