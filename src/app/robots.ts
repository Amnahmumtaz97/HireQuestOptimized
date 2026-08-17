import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL ?? 'https://hirequest.app'
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/app/learning-paths/certifications',
          '/app/learning-paths/certifications/',
        ],
        disallow: [
          '/app/dashboard',
          '/app/interviews',
          '/app/settings',
          '/app/billing',
          '/app/profile',
          '/app/new-interview',
          '/app/results',
          '/dashboard/',
          '/api/',
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  }
}
