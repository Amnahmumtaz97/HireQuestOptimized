'use client'

import { FeaturesHero } from '@/components/landing/features/FeaturesHero'
import { VoiceBehaviorAnalysis } from '@/components/landing/features/VoiceBehaviorAnalysis'
import { CapabilityDeepDives } from '@/components/landing/features/CapabilityDeepDives'
import { InSessionFlow } from '@/components/landing/features/InSessionFlow'
import { LiveVsRoadmap } from '@/components/landing/features/LiveVsRoadmap'
import { FeaturesCTA } from '@/components/landing/features/FeaturesCTA'

export function FeaturesShowcase() {
  return (
    <>
      <FeaturesHero />
      <VoiceBehaviorAnalysis />
      <CapabilityDeepDives />
      <InSessionFlow />
      <LiveVsRoadmap />
      <FeaturesCTA />
    </>
  )
}
