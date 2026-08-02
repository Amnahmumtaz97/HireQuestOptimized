import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { FeaturesShowcase } from '@/components/landing/features/FeaturesShowcase'

export const metadata = {
  title: 'Features — HireQuest',
  description:
    'HireQuest practice toolkit deep-dive: AI feedback, scoped questions, analytics, behavioral practice, and an honest live vs roadmap view.',
}

export default function FeaturesPage() {
  return (
    <MarketingPageShell>
      <FeaturesShowcase />
    </MarketingPageShell>
  )
}
