import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { LegalPage } from '@/components/landing/legal/LegalPage'
import { PRIVACY_POLICY } from '@/components/landing/legal/privacy-content'

export const metadata = {
  title: 'Privacy Policy — HireQuest',
  description:
    'Learn how HireQuest collects, uses, and protects account, resume, and interview session data.',
}

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <LegalPage content={PRIVACY_POLICY} />
    </MarketingPageShell>
  )
}
