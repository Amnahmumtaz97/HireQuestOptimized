'use client'

import { useMemo, useState } from 'react'
import { CreditCard, Download, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

type Invoice = {
  id: string
  date: string
  amount: string
  status: 'paid' | 'due'
}

const SAMPLE_INVOICES: Invoice[] = [
  { id: 'INV-1032', date: '2026-04-08', amount: '$9.99', status: 'paid' },
  { id: 'INV-0991', date: '2026-03-08', amount: '$9.99', status: 'paid' },
  { id: 'INV-0944', date: '2026-02-08', amount: '$9.99', status: 'paid' },
]

export function InvoicesPage() {
  const [showSampleData, setShowSampleData] = useState(true)

  const invoices = useMemo(() => (showSampleData ? SAMPLE_INVOICES : []), [showSampleData])

  return (
    <div className="animate-fade-up space-y-6">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="dashboard-card p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-input/20 text-[var(--hq-display-blue)]">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">Current plan</div>
                <div className="mt-1 text-xs text-muted-foreground">Pro · Renews on May 8, 2026</div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/app/subscription"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-primary px-4 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow btn-micro"
              >
                Upgrade
              </Link>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-input/15 px-4 text-xs font-semibold text-foreground hover:bg-input/25 btn-micro"
              >
                Manage billing
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-border bg-input/10 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">Monthly</div>
              <div className="mt-1 text-2xl font-bold text-foreground">$9.99</div>
              <div className="text-xs text-muted-foreground">Billed monthly</div>
            </div>
            <div className="rounded-2xl border border-border bg-input/10 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">Invoices</div>
              <div className="mt-1 text-2xl font-bold text-foreground">{invoices.length}</div>
              <div className="text-xs text-muted-foreground">Available downloads</div>
            </div>
            <div className="rounded-2xl border border-border bg-input/10 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80">Payment</div>
              <div className="mt-1 text-2xl font-bold text-foreground">Visa</div>
              <div className="text-xs text-muted-foreground">•••• 4242</div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Payment history</div>
              <div className="text-xs text-muted-foreground">Download invoices for records & reimbursements</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Sample data</span>
              <Switch checked={showSampleData} onCheckedChange={setShowSampleData} />
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-border bg-input/10 p-10 text-center">
              <div className="text-sm font-semibold text-foreground">No invoices yet</div>
              <div className="mt-1 text-xs text-muted-foreground">Once you’re billed, your invoices will appear here.</div>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
              <div className="hidden grid-cols-12 gap-3 bg-input/15 px-4 py-3 text-[11px] font-semibold text-muted-foreground md:grid">
                <div className="col-span-5">Invoice</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2 text-right">Amount</div>
                <div className="col-span-2 text-right">Download</div>
              </div>
              <div className="divide-y divide-border/60">
                {invoices.map((inv) => (
                  <div key={inv.id} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-12 md:items-center md:py-3">
                    <div className="md:col-span-5">
                      <div className="text-xs font-semibold text-muted-foreground md:hidden">Invoice</div>
                      <div className="mt-1 text-sm font-semibold text-foreground md:mt-0">{inv.id}</div>
                      <div className="text-xs text-muted-foreground capitalize">{inv.status}</div>
                    </div>
                    <div className="text-sm text-muted-foreground md:col-span-3">
                      <div className="text-xs font-semibold text-muted-foreground md:hidden">Date</div>
                      <div className="md:mt-0 mt-1">
                        {new Date(inv.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </div>
                    <div className="md:col-span-2 text-right text-sm font-semibold text-foreground">
                      <div className="text-xs font-semibold text-muted-foreground md:hidden">Amount</div>
                      <div className="md:mt-0 mt-1">{inv.amount}</div>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <div className="mr-2 text-xs font-semibold text-muted-foreground md:hidden">Download</div>
                      <button
                        type="button"
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-input/10 px-3 text-xs font-semibold text-foreground hover:bg-input/25 btn-micro"
                      >
                        <Download className="h-4 w-4 text-muted-foreground" /> <span className="hidden sm:inline">PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-foreground">Upgrade paths</div>
              <div className="text-xs text-muted-foreground">Unlock premium interview analytics</div>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-input/15 text-muted-foreground">
              <Sparkles className="h-4.5 w-4.5" />
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-border bg-input/10 p-4 hover:bg-input/15 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">Pro</div>
                  <div className="text-xs text-muted-foreground">Best for solo prep</div>
                </div>
                <div className="text-sm font-bold text-foreground">$9.99</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-primary/10 to-transparent p-4 hover:from-primary/15 transition-colors">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">Enterprise</div>
                  <div className="text-xs text-muted-foreground">Teams & cohorts</div>
                </div>
                <div className="text-sm font-bold text-foreground">Custom</div>
              </div>
            </div>
          </div>

          <Link
            href="/app/subscription"
            className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-gradient-primary px-5 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow btn-micro"
          >
            Compare plans
          </Link>
        </div>
      </div>
    </div>
  )
}

