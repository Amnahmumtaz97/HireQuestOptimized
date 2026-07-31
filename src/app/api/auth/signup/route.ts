import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongoose'
import { UserModel } from '@/models/User'

const signupSchema = z
  .object({
    firstName: z.string().trim().min(1).max(60),
    lastName: z.string().trim().min(1).max(60),
    email: z.string().email(),
    phoneNumber: z.string().trim().max(30).optional().default(''),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = signupSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()

    const normalizedEmail = parsed.data.email.toLowerCase().trim()

    const existingUser = await UserModel.findOne({ email: normalizedEmail })
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already in use' },
        { status: 409 },
      )
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    await UserModel.create({
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email: normalizedEmail,
      phoneNumber: parsed.data.phoneNumber,
      passwordHash,
      authProvider: 'credentials',
      role: 'user',
    })

    return NextResponse.json(
      { message: 'Account created successfully' },
      { status: 201 },
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create account'

    return NextResponse.json(
      { message },
      { status: 500 },
    )
  }
}
