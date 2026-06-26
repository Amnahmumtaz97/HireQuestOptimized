import { FileCheck2, Scale, BadgeInfo } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Terms — HireQuest',
  description: 'Review the basic terms for using HireQuest.',
}

const items = [
  { title: 'Acceptable Use', description: 'The service should be used responsibly and lawfully.', icon: <FileCheck2 className="h-5 w-5" /> },
  { title: 'Service Scope', description: 'These terms cover access to the platform and its related features.', icon: <Scale className="h-5 w-5" /> },
  { title: 'Policy Notes', description: 'A simple reference point for basic legal and product expectations.', icon: <BadgeInfo className="h-5 w-5" /> },
]

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Terms"
        title={<>Terms of use for the platform</>}
        description="A concise terms page for the app’s public-facing footer link."
        items={items}
      />
    </MarketingPageShell>
  )
}