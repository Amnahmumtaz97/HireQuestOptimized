import { Brain, Building2, Users } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'About — HireQuest',
  description: 'Learn what HireQuest is and why it exists.',
}

const items = [
  { title: 'Our Mission', description: 'Make interview practice more approachable, structured, and effective.', icon: <Brain className="h-5 w-5" /> },
  { title: 'For Candidates', description: 'Help people rehearse with confidence before high-stakes interviews.', icon: <Users className="h-5 w-5" /> },
  { title: 'Built for Modern Teams', description: 'A product mindset focused on clarity, feedback, and measurable progress.', icon: <Building2 className="h-5 w-5" /> },
]

export default function AboutPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="About"
        title={<>A focused interview prep platform</>}
        description="HireQuest helps candidates practice smarter with structured sessions, feedback, and progress tracking."
        items={items}
      />
    </MarketingPageShell>
  )
}