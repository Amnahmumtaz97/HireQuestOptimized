import { BookOpen, Code2, Layers3 } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Docs — HireQuest',
  description: 'Find product documentation, setup guidance, and developer notes for HireQuest.',
}

const items = [
  { title: 'Getting Started', description: 'Quick guidance for using the app and starting your first interview.', icon: <BookOpen className="h-5 w-5" /> },
  { title: 'Product Workflows', description: 'A place for feature guides, usage examples, and user flows.', icon: <Layers3 className="h-5 w-5" /> },
  { title: 'Technical Notes', description: 'Helpful implementation notes for integrators and maintainers.', icon: <Code2 className="h-5 w-5" /> },
]

export default function DocsPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Docs"
        title={<>Product documentation and setup help</>}
        description="The docs area collects the core usage and technical references for the platform."
        items={items}
      />
    </MarketingPageShell>
  )
}