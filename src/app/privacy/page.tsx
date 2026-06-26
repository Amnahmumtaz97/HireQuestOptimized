import { Shield, Eye, Lock } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Privacy — HireQuest',
  description: 'Read how HireQuest handles privacy and user data.',
}

const items = [
  { title: 'Data Minimization', description: 'We keep only the information needed to run the service well.', icon: <Shield className="h-5 w-5" /> },
  { title: 'User Visibility', description: 'Privacy settings and account controls remain easy to understand.', icon: <Eye className="h-5 w-5" /> },
  { title: 'Secure Handling', description: 'Appropriate safeguards are used for storing and processing data.', icon: <Lock className="h-5 w-5" /> },
]

export default function PrivacyPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Privacy"
        title={<>Privacy practices and data handling</>}
        description="A placeholder privacy page that explains the platform’s approach to user data and security."
        items={items}
      />
    </MarketingPageShell>
  )
}