'use client'

import { ProductHero } from '@/components/landing/product/ProductHero'
import { ProductCapabilityMap } from '@/components/landing/product/ProductCapabilityMap'
import { ProductCategories } from '@/components/landing/product/ProductCategories'
import { ProductPracticeModes } from '@/components/landing/product/ProductPracticeModes'
import { ProductFeedbackPreview } from '@/components/landing/product/ProductFeedbackPreview'
import { ProductProgressPreview } from '@/components/landing/product/ProductProgressPreview'
import { ProductFAQ } from '@/components/landing/product/ProductFAQ'
import { ProductFinalCTA } from '@/components/landing/product/ProductFinalCTA'

export function ProductShowcase() {
  return (
    <>
      <ProductHero />
      <ProductCapabilityMap />
      <ProductCategories />
      <ProductPracticeModes />
      <ProductFeedbackPreview />
      <ProductProgressPreview />
      <ProductFAQ />
      <ProductFinalCTA />
    </>
  )
}
