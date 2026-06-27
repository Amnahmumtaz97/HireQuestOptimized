'use client'

import Image from 'next/image'
import { Volume2, Brain, CheckCircle2 } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

export function Features() {
  const ref = useReveal<HTMLElement>()

  const features = [
    {
      title: 'Voice & Sentiment Analysis',
      description:
        'Our AI processes your tone, pacing, and vocabulary in real-time, providing actionable insights to project absolute confidence and authority.',
      icon: Volume2,
      bullets: ['Pitch modulation tracking', 'Filler word detection'],
      accent: 'feature-accent-cyan',
      iconWrap: 'feature-icon-wrap feature-icon-wrap--cyan from-cyan-600/30 to-cyan-500/10',
      visualPanel: 'feature-visual-panel',
      image: '/voice.png',
      imageAlt: 'Real-time voice waveform and sentiment analysis dashboard',
    },
    {
      title: 'Behavioral Coaching',
      description:
        'Simulate complex technical and behavioral interviews tailored to specific target companies. The engine adapts to your responses dynamically.',
      icon: Brain,
      bullets: ['Company-specific question banks', 'STAR method structuring feedback'],
      accent: 'feature-accent-purple',
      iconWrap: 'feature-icon-wrap feature-icon-wrap--purple from-purple-600/30 to-purple-500/10',
      visualPanel: 'feature-visual-panel feature-visual-panel--purple',
      image: '/behavioral.png',
      imageAlt: 'AI behavioral coaching and interview analysis visualization',
    },
  ]

  return (
    <section ref={ref} className="relative py-16 sm:py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/3 h-72 w-96 bg-gradient-radial from-primary/15 to-transparent blur-3xl rounded-full opacity-20" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 bg-gradient-radial from-accent/12 to-transparent blur-3xl rounded-full opacity-15" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="space-y-12 sm:space-y-16 md:space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isEven = index % 2 === 0

            return (
              <div
                key={feature.title}
                className="reveal grid lg:grid-cols-2 gap-8 md:gap-12 items-center"
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border bg-gradient-to-br ${feature.iconWrap}`}
                    >
                      <Icon className={`h-6 w-6 ${feature.accent}`} />
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                    {feature.title}
                  </h2>

                  <p className="text-base sm:text-lg text-muted-foreground mb-6 leading-relaxed max-w-lg">
                    {feature.description}
                  </p>

                  <ul className="space-y-3 max-w-lg">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-3">
                        <CheckCircle2 className={`h-5 w-5 ${feature.accent} flex-shrink-0`} />
                        <span className="text-sm sm:text-base text-foreground font-medium">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`reveal relative ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="feature-visual-frame relative overflow-hidden rounded-[2rem] glass-strong shimmer-border border p-4 sm:p-5 glow-ring-strong">
                    <div
                      className={`${feature.visualPanel} relative overflow-hidden rounded-[1.75rem] min-h-[400px] sm:min-h-[500px]`}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.imageAlt}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(2,6,23,0.35),transparent_45%)]" />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
