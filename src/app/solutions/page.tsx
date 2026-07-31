import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { Process } from '@/components/landing/Process'

export const metadata = {
  title: 'Solutions — HireQuest',
  description: 'See how HireQuest guides you from setup to interview-ready feedback.',
}

export default function SolutionsPage() {
  return (
    <MarketingPageShell>
      <div className="pt-16 sm:pt-20">
        <Process />
      </div>
    </MarketingPageShell>
  )
}
