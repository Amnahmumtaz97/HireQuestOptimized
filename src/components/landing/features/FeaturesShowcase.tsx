'use client'

import { FeaturesHero } from '@/components/landing/features/FeaturesHero'
import { CapabilityDeepDives } from '@/components/landing/features/CapabilityDeepDives'
import { InSessionFlow } from '@/components/landing/features/InSessionFlow'
import { LiveVsRoadmap } from '@/components/landing/features/LiveVsRoadmap'
import { FeaturesCTA } from '@/components/landing/features/FeaturesCTA'

export function FeaturesShowcase() {
  return (
    <>
      <FeaturesHero />
      <CapabilityDeepDives />
      <InSessionFlow />
      <LiveVsRoadmap />
      <FeaturesCTA />
    </>
  )
}
