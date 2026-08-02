import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { LearningPathsAdmin } from '@/components/dashboard/LearningPathsAdmin'

export const metadata = {
  title: 'Learning Paths — HireQuest Admin',
}

export default function AdminLearningPathsPage() {
  return (
    <main className="min-h-screen px-4 pb-10 pt-24 sm:px-6">
      <DashboardNavbar />
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-border glass-strong">
          <LearningPathsAdmin />
        </div>
      </div>
    </main>
  )
}
