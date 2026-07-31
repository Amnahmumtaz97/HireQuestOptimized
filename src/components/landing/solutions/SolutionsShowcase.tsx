'use client'

import { SolutionsHero } from '@/components/landing/solutions/SolutionsHero'
import { AudiencePlaybooks } from '@/components/landing/solutions/AudiencePlaybooks'
import { PathByGoal } from '@/components/landing/solutions/PathByGoal'
import { SolutionsCTA } from '@/components/landing/solutions/SolutionsCTA'

export function SolutionsShowcase() {
  return (
    <>
      <SolutionsHero />
      <AudiencePlaybooks />
      <PathByGoal />
      <SolutionsCTA />
    </>
  )
}
