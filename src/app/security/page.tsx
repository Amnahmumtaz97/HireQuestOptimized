import { ShieldCheck, KeyRound, ServerCog } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Security — HireQuest',
  description: 'Learn how HireQuest thinks about security and account protection.',
}

const items = [
  { title: 'Account Protection', description: 'Security-conscious defaults for login and account access.', icon: <KeyRound className="h-5 w-5" /> },
  { title: 'Platform Safeguards', description: 'Basic infrastructure and application protections are part of the design.', icon: <ShieldCheck className="h-5 w-5" /> },
  { title: 'Operational Reliability', description: 'The service is intended to be stable, observable, and dependable.', icon: <ServerCog className="h-5 w-5" /> },
]

export default function SecurityPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Security"
        title={<>Security and trust at a glance</>}
        description="A public security page for account safety and platform reliability notes."
        items={items}
      />
    </MarketingPageShell>
  )
}