import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { FAQ } from '@/components/landing/FAQ'

export const metadata = {
  title: 'Features — HireQuest',
  description: 'Explore HireQuest features and get answers to common questions about AI-powered interview preparation.',
}

export default function FeaturesPage() {
  return (
    <MarketingPageShell>
      <div className="pt-16 sm:pt-20">
        <FAQ />
      </div>
    </MarketingPageShell>
  )
}
