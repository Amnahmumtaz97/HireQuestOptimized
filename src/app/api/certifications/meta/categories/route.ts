import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { CertificationModel } from '@/models/Certification'
import { CERT_CATEGORIES, CERT_CREDENTIAL_TYPES, KNOWN_PROVIDERS } from '@/lib/certifications/constants'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    await connectToDatabase()

    const [categoryCounts, providerCounts, credentialTypeCounts] = await Promise.all([
      CertificationModel.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      CertificationModel.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$providerSlug', provider: { $first: '$provider' }, count: { $sum: 1 } } },
      ]),
      CertificationModel.aggregate([
        { $match: { isPublished: true } },
        { $group: { _id: '$credentialType', count: { $sum: 1 } } },
      ]),
    ])

    const catMap = new Map<string, number>()
    for (const row of categoryCounts) catMap.set(row._id as string, row.count as number)

    const provMap = new Map<string, { provider: string; count: number }>()
    for (const row of providerCounts) {
      provMap.set(row._id as string, { provider: row.provider as string, count: row.count as number })
    }

    const credTypeMap = new Map<string, number>()
    for (const row of credentialTypeCounts) credTypeMap.set(row._id as string, row.count as number)

    const categories = CERT_CATEGORIES.map((key) => ({
      key,
      count: catMap.get(key) ?? 0,
    })).filter((c) => c.count > 0)

    // Credential types in canonical order with counts
    const credentialTypes = CERT_CREDENTIAL_TYPES.map((key) => ({
      key,
      count: credTypeMap.get(key) ?? 0,
    })).filter((c) => c.count > 0)

    // Return known providers first (in defined order), then any others
    const providers: Array<{ slug: string; name: string; count: number }> = KNOWN_PROVIDERS
      .filter((slug) => provMap.has(slug))
      .map((slug) => ({
        slug,
        name: provMap.get(slug)!.provider,
        count: provMap.get(slug)!.count,
      }))

    // Add any providers not in KNOWN_PROVIDERS list
    for (const [slug, { provider, count }] of provMap) {
      if (!KNOWN_PROVIDERS.includes(slug as never)) {
        providers.push({ slug, name: provider, count })
      }
    }

    return NextResponse.json({ categories, credentialTypes, providers })
  } catch {
    return NextResponse.json({ message: 'Failed to load categories' }, { status: 500 })
  }
}
