import type { Metadata } from 'next'
import { CertificationDetailPage } from '@/components/app/certifications/CertificationDetailPage'
import { connectToDatabase } from '@/lib/mongoose'
import { CertificationModel } from '@/models/Certification'
import {
  CERT_CATEGORY_LABELS,
  CERT_CREDENTIAL_LABELS,
  CERT_LEVEL_LABELS,
} from '@/lib/certifications/constants'
import type { CertCategory } from '@/lib/certifications/constants'

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getCertMeta(id: string) {
  try {
    await connectToDatabase()
    const cert = await CertificationModel.findById(id).select(
      'name provider category credentialType level skills roles costType officialUrl description'
    ).lean()
    return cert ?? null
  } catch {
    return null
  }
}

// ── Dynamic metadata ──────────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const cert = await getCertMeta(id)

  if (!cert) {
    return {
      title: 'Certification — HireQuest',
      description: 'View detailed information about this certification on HireQuest.',
    }
  }

  const c = cert as {
    name: string; provider: string; category: string; credentialType: string;
    level: string; skills: string[]; roles: string[]; description: string;
  }

  const categoryLabel = CERT_CATEGORY_LABELS[c.category as CertCategory] ?? c.category
  const credLabel = CERT_CREDENTIAL_LABELS[c.credentialType as keyof typeof CERT_CREDENTIAL_LABELS] ?? c.credentialType
  const levelLabel = CERT_LEVEL_LABELS[c.level as keyof typeof CERT_LEVEL_LABELS] ?? c.level

  const title = `${c.name} — ${c.provider} | HireQuest`
  const description = c.description.slice(0, 160)

  const keywords = [
    c.name,
    c.provider,
    `${c.provider} certification`,
    credLabel,
    categoryLabel,
    levelLabel,
    ...c.skills.slice(0, 8),
    ...c.roles.slice(0, 4),
    'certification preparation',
    'tech credentials',
    'interview preparation',
    'HireQuest',
  ]

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://hirequest.app/app/learning-paths/certifications/${id}`,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `/app/learning-paths/certifications/${id}`,
    },
  }
}

// ── JSON-LD structured data component ────────────────────────────────────────
async function CertJsonLd({ id }: { id: string }) {
  const cert = await getCertMeta(id)
  if (!cert) return null

  const c = cert as {
    name: string; provider: string; category: string; credentialType: string;
    level: string; skills: string[]; description: string;
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalCredential',
    name: c.name,
    description: c.description.slice(0, 250),
    credentialCategory: c.credentialType,
    competencyRequired: c.skills,
    educationalLevel: c.level,
    recognizedBy: {
      '@type': 'Organization',
      name: c.provider,
    },
    about: {
      '@type': 'Thing',
      name: CERT_CATEGORY_LABELS[c.category as CertCategory] ?? c.category,
    },
  }

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function CertificationDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <CertJsonLd id={id} />
      <CertificationDetailPage certId={id} />
    </>
  )
}
