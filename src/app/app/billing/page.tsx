import { DashboardPageHeader } from '@/components/app/dashboard/DashboardPageHeader'
import { InvoicesPage } from '@/components/app/billing/InvoicesPage'
import { SubscriptionPlansPage } from '@/components/app/subscription/SubscriptionPlansPage'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata = {
  title: 'Billing — HireQuest',
}

export default function BillingPage() {
  return (
    <>
      <DashboardPageHeader
        title="Billing"
        description="Manage plan, payment, and invoice history."
      />

      <div className="dashboard-card p-5 sm:p-6">
        <Tabs defaultValue="plan">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="plan" className="flex-1 sm:flex-none">
                Subscription
              </TabsTrigger>
              <TabsTrigger value="invoices" className="flex-1 sm:flex-none">
                Invoices
              </TabsTrigger>
            </TabsList>
            <div className="text-xs text-muted-foreground">
              Tip: invoices are generated after successful payments.
            </div>
          </div>

          <TabsContent value="plan">
            <SubscriptionPlansPage />
          </TabsContent>
          <TabsContent value="invoices">
            <InvoicesPage />
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

