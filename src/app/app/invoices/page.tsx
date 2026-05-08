import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { InvoicesPage as BillingInvoicesPage } from '@/components/app/billing/InvoicesPage'

export const metadata = {
  title: 'Invoices — HireQuest',
}

export default function InvoicesPage() {
  return (
    <>
      <DashboardPageHeader
        title="Invoices"
        description="Track billing history and download invoice records."
      />
      <BillingInvoicesPage />
    </>
  )
}
