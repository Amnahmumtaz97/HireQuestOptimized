import type { ReactNode } from 'react'
import { Footer } from '@/components/landing/Footer'
import { Navbar } from '@/components/landing/Navbar'

type MarketingPageShellProps = {
  children: ReactNode
}

export function MarketingPageShell({ children }: MarketingPageShellProps) {
  return (
    <main className="landing-page-shell relative min-h-screen overflow-x-clip">
      <Navbar />
      {children}
      <Footer />
    </main>
  )
}
