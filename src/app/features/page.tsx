import { Navbar } from '@/components/landing/Navbar'
import { Process } from '@/components/landing/Process'
import { Footer } from '@/components/landing/Footer'
import { ConstellationBackground } from '@/components/landing/ConstellationBackground'

export const metadata = {
  title: 'Features — HireQuest',
  description: 'Explore the key features that make HireQuest an effective interview preparation platform.',
}

export default function FeaturesPage() {
  return (
    <main className="landing-page-shell relative min-h-screen overflow-x-clip">
      <ConstellationBackground
        className="absolute inset-0 z-0 min-h-full w-full pointer-events-none opacity-70"
        intensity={0.55}
      />
      <div className="relative z-10">
        <Navbar />
        <div className="pt-28 sm:pt-32">
          <Process />
        </div>
        <Footer />
      </div>
    </main>
  )
}