import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { LegalPage } from '@/components/landing/legal/LegalPage'
import { TERMS_OF_USE } from '@/components/landing/legal/terms-content'

export const metadata = {
  title: 'Terms of Use — HireQuest',
  description:
    'Review the terms for using HireQuest, including acceptable use, AI disclaimers, and account responsibilities.',
}

export default function TermsPage() {
  return (
    <MarketingPageShell>
      <LegalPage content={TERMS_OF_USE} />
    </MarketingPageShell>
  )
}
