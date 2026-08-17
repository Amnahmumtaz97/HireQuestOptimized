import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { CertificationsAdmin } from '@/components/dashboard/CertificationsAdmin'

export const metadata = {
  title: 'Certifications — HireQuest Admin',
}

export default function AdminCertificationsPage() {
  return (
    <main className="min-h-screen px-4 pb-10 pt-24 sm:px-6">
      <DashboardNavbar />
      <div className="mx-auto max-w-7xl">
        <div className="overflow-hidden rounded-3xl border border-border glass-strong">
          <CertificationsAdmin />
        </div>
      </div>
    </main>
  )
}
