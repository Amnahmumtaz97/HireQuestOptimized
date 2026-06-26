import type { ReactNode } from 'react'
import { ConstellationBackground } from '@/components/landing/ConstellationBackground'
import { Footer } from '@/components/landing/Footer'
import { Navbar } from '@/components/landing/Navbar'

type MarketingPageShellProps = {
  children: ReactNode
}

export function MarketingPageShell({ children }: MarketingPageShellProps) {
  return (
    <main className="landing-page-shell relative min-h-screen overflow-x-clip">
      <ConstellationBackground
        className="absolute inset-0 z-0 min-h-full w-full pointer-events-none opacity-70"
        intensity={0.55}
      />
      <div className="relative z-10">
        <Navbar />
        {children}
        <Footer />
      </div>
    </main>
  )
}