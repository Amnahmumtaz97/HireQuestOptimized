import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Stats } from '@/components/landing/Stats'
import { Problem } from '@/components/landing/Problem'
import { Process } from '@/components/landing/Process'
import { LandingFeatures } from '@/components/landing/LandingFeatures'
import { AIAnalysis } from '@/components/landing/AIAnalysis'
import { Testimonials } from '@/components/landing/Testimonials'
import { FAQ } from '@/components/landing/FAQ'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'
import { ChatbotWidget } from '@/components/chatbot/ChatbotWidget'

export default function LandingPage() {
  return (
    <main className="landing-page-shell relative min-h-screen overflow-x-clip">
      <Navbar />
      <Hero />
      <Stats />
      <Problem />
      <Process />
      <LandingFeatures />
      <AIAnalysis />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
      <ChatbotWidget />
    </main>
  )
}
