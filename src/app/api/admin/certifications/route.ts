import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongoose'
import { requireAdminSession } from '@/lib/admin-auth'
import { CertificationModel } from '@/models/Certification'
import { serializeCertificationAdmin } from '@/lib/certifications/serialize'
import {
  CERT_CATEGORIES,
  CERT_COST_TYPES,
  CERT_CREDENTIAL_TYPES,
  CERT_LEVELS,
  CERT_PORTFOLIO_VALUES,
} from '@/lib/certifications/constants'

export const certWriteSchema = z.object({
  name: z.string().trim().min(1).max(200),
  provider: z.string().trim().min(1).max(120),
  providerSlug: z.string().trim().min(1).max(60).toLowerCase(),
  category: z.enum(CERT_CATEGORIES),
  subcategories: z.array(z.string().trim()).optional().default([]),
  roles: z.array(z.string().trim()).optional().default([]),
  level: z.enum(CERT_LEVELS),
  costType: z.enum(CERT_COST_TYPES),
  credentialType: z.enum(CERT_CREDENTIAL_TYPES),
  examRequired: z.boolean().default(false),
  description: z.string().trim().min(1).max(2000),
  whyItMatters: z.string().trim().min(1).max(1000),
  skills: z.array(z.string().trim()).optional().default([]),
  estimatedHours: z.number().positive().nullable().optional(),
  portfolioValue: z.enum(CERT_PORTFOLIO_VALUES),
  portfolioNote: z.string().trim().min(1).max(500),
  linkedinSupported: z.boolean().default(false),
  resumeRecommended: z.boolean().default(false),
  officialUrl: z.string().url().trim(),
  credentialUrl: z.string().url().trim().optional().nullable(),
  expiration: z.string().trim().nullable().optional(),
  isFeatured: z.boolean().optional().default(false),
  tags: z.array(z.string().trim()).optional().default([]),
  lastVerifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  sourceNotes: z.string().trim().max(1000).optional(),
  isPublished: z.boolean().optional().default(true),
})

export async function GET() {
  const check = await requireAdminSession()
  if (check.ok === false) {
    return NextResponse.json({ message: check.message }, { status: check.status })
  }

  try {
    await connectToDatabase()
    const certs = await CertificationModel.find({}).sort({ name: 1 }).lean()
    return NextResponse.json({ certifications: certs.map(serializeCertificationAdmin) })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to load certifications' },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const check = await requireAdminSession()
  if (check.ok === false) {
    return NextResponse.json({ message: check.message }, { status: check.status })
  }

  try {
    const body = await request.json()
    const parsed = certWriteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 },
      )
    }

    await connectToDatabase()
    const created = await CertificationModel.create(parsed.data)
    return NextResponse.json(
      { certification: serializeCertificationAdmin(created.toObject()) },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create certification' },
      { status: 500 },
    )
  }
}
