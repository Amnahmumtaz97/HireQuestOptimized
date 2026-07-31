import { Navbar } from '@/components/landing/Navbar'
import { Pricing } from '@/components/pricing/Pricing'
import { Footer } from '@/components/landing/Footer'

export const metadata = {
  title: 'Pricing — HireQuest',
  description: 'Choose the right plan for your AI-powered interview preparation.',
}

export default function PricingPage() {
  return (
    <main className="landing-page-shell relative min-h-screen overflow-x-clip">
      <Navbar />
      <Pricing />
      <Footer />
    </main>
  )
}
