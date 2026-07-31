import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { ProductShowcase } from '@/components/landing/product/ProductShowcase'

export const metadata = {
  title: 'Product — HireQuest',
  description:
    'HireQuest product inventory: interview wizard, session runner, scored results, department catalog, practice modes, and analytics previews.',
}

export default function ProductPage() {
  return (
    <MarketingPageShell>
      <ProductShowcase />
    </MarketingPageShell>
  )
}
