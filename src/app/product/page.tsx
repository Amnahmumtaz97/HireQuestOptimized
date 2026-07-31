import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { AIAnalysis } from '@/components/landing/AIAnalysis'
import { PageHero } from '@/components/landing/PageHero'

export const metadata = {
  title: 'Product — HireQuest',
  description: 'Explore HireQuest product capabilities for AI-powered interview preparation.',
}

export default function ProductPage() {
  return (
    <MarketingPageShell>
      <PageHero
        eyebrow="Product"
        title={<>Everything you need to practice like it&apos;s the real interview.</>}
        description="Voice analysis, behavioral coaching, and adaptive mock interviews in one place."
      />
      <LandingFeatures />
      <AIAnalysis />
    </MarketingPageShell>
  )
}
