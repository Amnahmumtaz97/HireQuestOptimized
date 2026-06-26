import { FileText, MessagesSquare, Sparkles } from 'lucide-react'
import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { StaticPageContent } from '@/components/landing/StaticPageContent'

export const metadata = {
  title: 'Blog — HireQuest',
  description: 'Read product notes, interview prep tips, and company updates from HireQuest.',
}

const items = [
  { title: 'Interview Advice', description: 'Practical tips to improve answers, structure, and confidence.', icon: <Sparkles className="h-5 w-5" /> },
  { title: 'Product Notes', description: 'Updates on new workflows, reports, and AI coaching features.', icon: <FileText className="h-5 w-5" /> },
  { title: 'Stories & Insights', description: 'Short reads about building tools that help people perform better.', icon: <MessagesSquare className="h-5 w-5" /> },
]

export default function BlogPage() {
  return (
    <MarketingPageShell>
      <StaticPageContent
        eyebrow="Blog"
        title={<>Ideas, updates, and interview prep insight</>}
        description="A simple editorial hub for helpful content and product updates."
        items={items}
      />
    </MarketingPageShell>
  )
}