import type { Metadata } from 'next'
import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { CertificationsBrowse } from '@/components/app/certifications/CertificationsBrowse'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

const TITLE = 'IT Certifications — HireQuest'
const DESCRIPTION =
  'Browse 70+ industry-recognised credentials across Cloud, AI, Cybersecurity, DevOps, Data, and more. Find free and paid certifications from AWS, Google, Microsoft, CompTIA, ISC2, and other top providers — searchable by type, level, cost, and LinkedIn support.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    // credential types
    'professional certification', 'industry certification', 'digital badge', 'skill assessment',
    'course certificate', 'free certification', 'paid certification',
    // categories
    'cloud certification', 'AWS certification', 'Azure certification', 'GCP certification',
    'AI certification', 'machine learning certification', 'cybersecurity certification',
    'DevOps certification', 'Kubernetes certification', 'Terraform certification',
    'data analytics certification', 'database certification', 'networking certification',
    'web development certificate', 'software development certification',
    'project management certification', 'PMP', 'Scrum master',
    // providers
    'AWS certified', 'Google certified', 'Microsoft certified', 'CompTIA', 'ISC2 CC',
    'Cisco CCNA', 'MongoDB certification', 'HackerRank certificate',
    // purpose
    'best free IT certifications', 'certifications for software engineers',
    'LinkedIn certifications', 'certifications for resume', 'no exam certification',
    'interview preparation', 'tech career credentials',
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'website',
    url: 'https://hirequest.app/app/learning-paths/certifications',
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
  alternates: {
    canonical: '/app/learning-paths/certifications',
  },
}

export default function CertificationsPage() {
  return (
    <>
      <DashboardPageHeader
        title="Certifications"
        description="Discover industry-recognised credentials — free and paid — to strengthen your portfolio, resume, and LinkedIn profile."
      />

      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
        <Link
          href="/app/learning-paths"
          className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3 w-3" />
          Learning Paths
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">Certifications</span>
      </nav>

      <CertificationsBrowse />
    </>
  )
}
