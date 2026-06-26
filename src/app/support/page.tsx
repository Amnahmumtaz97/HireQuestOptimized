import { Headset, LifeBuoy, ShieldAlert } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Support — HireQuest',
  description: 'Get help with using HireQuest and resolving account questions.',
}

const items = [
  { title: 'Help Center', description: 'Common questions and quick solutions for everyday usage.', icon: <LifeBuoy className="h-5 w-5" /> },
  { title: 'Technical Support', description: 'A support entry point for troubleshooting product issues.', icon: <Headset className="h-5 w-5" /> },
  { title: 'Status & Security', description: 'Guidance on service reliability and account safety.', icon: <ShieldAlert className="h-5 w-5" /> },
]

export default function SupportPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Support"
        title={<>Help when you need it</>}
        description="A support page for product help, troubleshooting, and account questions."
        items={items}
      />
    </MarketingPageShell>
  )
}