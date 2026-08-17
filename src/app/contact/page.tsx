import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { ContactPageContent } from '@/components/landing/contact/ContactPageContent'

export const metadata = {
  title: 'Contact — HireQuest',
  description:
    'Contact HireQuest for product support, privacy requests, security reports, billing, or partnerships.',
}

export default function ContactPage() {
  return (
    <MarketingPageShell>
      <ContactPageContent />
    </MarketingPageShell>
  )
}
