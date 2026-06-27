import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Stats } from '@/components/landing/Stats'
import { Features } from '@/components/landing/Features'
import { Testimonials } from '@/components/landing/Testimonials'
import { Process } from '@/components/landing/Process'
import { CTA } from '@/components/landing/CTA'
import { Footer } from '@/components/landing/Footer'
import { ConstellationBackground } from '@/components/landing/ConstellationBackground'

export default function LandingPage() {
  return (
    <main className="landing-page-shell relative min-h-screen overflow-x-clip">
      <ConstellationBackground className="absolute inset-0 z-0 min-h-full w-full pointer-events-none opacity-70" intensity={0.55} />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Stats />
        <Process />
        <Features />
        <Testimonials />
        <CTA />
        <Footer />
      </div>
    </main>
  )
}
