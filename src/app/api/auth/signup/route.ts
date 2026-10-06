import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongoose'
import { UserModel } from '@/models/User'

const signupSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, 'First name is required.')
      .max(60, 'First name is too long.'),
    lastName: z
      .string()
      .trim()
      .min(1, 'Last name is required.')
      .max(60, 'Last name is too long.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Please enter a valid email address.'),
    phoneNumber: z.string().trim().max(30, 'Phone number is too long.').optional().default(''),
    password: z
      .string()
      .min(1, 'Password is required.')
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password is too long.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
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
        { message: 'Email is already in use.' },
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
