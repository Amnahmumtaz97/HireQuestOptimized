import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { ProductShowcase } from '@/components/landing/product/ProductShowcase'

export const metadata = {
  title: 'Product — HireQuest',
  description:
    'Explore HireQuest in depth: AI mock interviews, instant feedback, department-specific practice, progress tracking, and more.',
}

export default function ProductPage() {
  return (
    <MarketingPageShell>
      <ProductShowcase />
    </MarketingPageShell>
  )
}
