import type { MetadataRoute } from 'next'
import { connectToDatabase } from '@/lib/mongoose'
import { CertificationModel } from '@/models/Certification'

const BASE_URL = process.env.NEXTAUTH_URL ?? 'https://hirequest.app'

// ── Static public pages ───────────────────────────────────────────────────────
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
  { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/features`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/security`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.4 },
  { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  {
    url: `${BASE_URL}/app/learning-paths/certifications`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.9,
  },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all published certifications for individual detail pages
  let certRoutes: MetadataRoute.Sitemap = []
  try {
    await connectToDatabase()
    const certs = await CertificationModel.find({ isPublished: true })
      .select('_id name lastVerifiedAt')
      .lean()

    certRoutes = certs.map((cert) => ({
      url: `${BASE_URL}/app/learning-paths/certifications/${String(cert._id)}`,
      lastModified: cert.lastVerifiedAt ? new Date(cert.lastVerifiedAt) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  } catch {
    // Non-fatal — sitemap still returns static routes
  }

  return [...STATIC_ROUTES, ...certRoutes]
}
