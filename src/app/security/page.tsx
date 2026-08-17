import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { LegalPage } from '@/components/landing/legal/LegalPage'
import { SECURITY_OVERVIEW } from '@/components/landing/legal/security-content'

export const metadata = {
  title: 'Security — HireQuest',
  description:
    'Learn how HireQuest protects accounts, sessions, resumes, and AI-processed interview data.',
}

export default function SecurityPage() {
  return (
    <MarketingPageShell>
      <LegalPage content={SECURITY_OVERVIEW} />
    </MarketingPageShell>
  )
}
