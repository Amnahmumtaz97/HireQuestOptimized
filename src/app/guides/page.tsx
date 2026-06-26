import { Compass, ClipboardList, Lightbulb } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Guides — HireQuest',
  description: 'Browse practical guides for making the most of HireQuest.',
}

const items = [
  { title: 'Practice Guides', description: 'Step-by-step help for effective interview preparation.', icon: <ClipboardList className="h-5 w-5" /> },
  { title: 'Role Playbooks', description: 'Suggested ways to tailor practice for different roles and levels.', icon: <Compass className="h-5 w-5" /> },
  { title: 'Tips & Tricks', description: 'Small adjustments that lead to stronger answers and better pacing.', icon: <Lightbulb className="h-5 w-5" /> },
]

export default function GuidesPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Guides"
        title={<>Practical walkthroughs for better prep</>}
        description="A curated set of guides for users who want direct, actionable help."
        items={items}
      />
    </MarketingPageShell>
  )
}