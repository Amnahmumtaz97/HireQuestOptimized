import { ArrowUpRight, Clock3, Target } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Roadmap — HireQuest',
  description: 'Preview the upcoming improvements planned for HireQuest.',
}

const items = [
  { title: 'Near-Term Goals', description: 'Upcoming quality-of-life improvements and workflow refinements.', icon: <Clock3 className="h-5 w-5" /> },
  { title: 'Platform Direction', description: 'A clearer view of where the product is heading next.', icon: <Target className="h-5 w-5" /> },
  { title: 'Future Expansion', description: 'Broader capabilities for more advanced preparation and tracking.', icon: <ArrowUpRight className="h-5 w-5" /> },
]

export default function RoadmapPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Roadmap"
        title={<>What’s next for HireQuest</>}
        description="A simple roadmap page that gives candidates visibility into the product direction and upcoming work."
        items={items}
      />
    </MarketingPageShell>
  )
}