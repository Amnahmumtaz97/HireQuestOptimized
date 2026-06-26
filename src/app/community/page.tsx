import { MessageCircle, Users, UserRoundPlus } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Community — HireQuest',
  description: 'Connect with the HireQuest community and see how others practice.',
}

const items = [
  { title: 'Shared Learning', description: 'A place for users to trade interview prep ideas and feedback patterns.', icon: <Users className="h-5 w-5" /> },
  { title: 'Discussions', description: 'Space for ongoing conversations about roles, industries, and practice.', icon: <MessageCircle className="h-5 w-5" /> },
  { title: 'Invite Others', description: 'Built to encourage collaboration and referral-based growth.', icon: <UserRoundPlus className="h-5 w-5" /> },
]

export default function CommunityPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Community"
        title={<>Learn together with other candidates</>}
        description="A community page for sharing progress, tips, and encouragement."
        items={items}
      />
    </MarketingPageShell>
  )
}