import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { TrackConfigManagerClient } from '@/components/dashboard/TrackConfigManagerClient'

export const metadata = {
  title: 'Track Config — HireQuest',
}

export default function TrackConfigPage() {
  return (
    <main className="min-h-screen px-4 pb-10 pt-24 sm:px-6">
      <DashboardNavbar />
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-border glass-strong">
          <TrackConfigManagerClient />
        </div>
      </div>
    </main>
  )
}
