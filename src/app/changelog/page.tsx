import { Sparkles, RefreshCcw, ShieldCheck } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Changelog — HireQuest',
  description: 'See the latest product updates, fixes, and improvements in HireQuest.',
}

const items = [
  { title: 'Recent Releases', description: 'Track product improvements, polish passes, and new interview workflows.', icon: <RefreshCcw className="h-5 w-5" /> },
  { title: 'Feature Additions', description: 'Review newly shipped capabilities across practice, feedback, and dashboard experiences.', icon: <Sparkles className="h-5 w-5" /> },
  { title: 'Stability Updates', description: 'Follow the fixes and hardening work that keeps the experience reliable.', icon: <ShieldCheck className="h-5 w-5" /> },
]

export default function ChangelogPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Changelog"
        title={<>Product updates built for consistent improvement</>}
        description="A lightweight product history page for users who want to see what changed and what shipped recently."
        items={items}
      />
    </MarketingPageShell>
  )
}