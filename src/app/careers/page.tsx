import { BadgeCheck, BriefcaseBusiness, HeartHandshake } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Careers — HireQuest',
  description: 'Explore career opportunities and what it is like to build HireQuest.',
}

const items = [
  { title: 'Open Roles', description: 'A placeholder careers page for future hiring opportunities and team growth.', icon: <BriefcaseBusiness className="h-5 w-5" /> },
  { title: 'Team Values', description: 'Build with clarity, ship with quality, and respect the user experience.', icon: <BadgeCheck className="h-5 w-5" /> },
  { title: 'How We Work', description: 'Collaborative execution, strong ownership, and practical product thinking.', icon: <HeartHandshake className="h-5 w-5" /> },
]

export default function CareersPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Careers"
        title={<>Join the team building better interview practice</>}
        description="A careers landing page for future hiring and team culture content."
        items={items}
      />
    </MarketingPageShell>
  )
}