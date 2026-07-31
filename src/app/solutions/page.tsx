import { MarketingPageShell } from '@/components/landing/MarketingPageShell'
import { SolutionsShowcase } from '@/components/landing/solutions/SolutionsShowcase'

export const metadata = {
  title: 'Solutions — HireQuest',
  description:
    'Audience playbooks for students, career switchers, and working professionals—plus goal-based paths into HireQuest practice.',
}

export default function SolutionsPage() {
  return (
    <MarketingPageShell>
      <SolutionsShowcase />
    </MarketingPageShell>
  )
}
