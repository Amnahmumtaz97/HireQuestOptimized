'use client'

import { useState, type CSSProperties } from 'react'
import {
  Sparkles,
  Building2,
  BarChart3,
  MessageCircle,
  Code2,
  FileText,
  type LucideIcon,
} from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'

type Feature = {
  icon: LucideIcon
  title: string
  label: string
  description: string
  rotation: number
}

const features: Feature[] = [
  {
    icon: Sparkles,
    title: 'AI Feedback',
    label: 'AI Feedback',
    description: 'Structured feedback on correctness, clarity, and communication — not just a pass/fail.',
    rotation: -25,
  },
  {
    icon: Building2,
    title: 'Real Company Questions',
    label: 'Companies',
    description: 'Sourced from actual interview loops at top engineering organizations.',
    rotation: -15,
  },
  {
    icon: BarChart3,
    title: 'Performance Analytics',
    label: 'Analytics',
    description: 'Track accuracy, speed, and topic mastery across every session.',
    rotation: -5,
  },
  {
    icon: MessageCircle,
    title: 'Behavioral Interviews',
    label: 'Behavioral',
    description: 'Practice the human side of the loop with structured STAR-format prompts.',
    rotation: 5,
  },
  {
    icon: Code2,
    title: 'Coding Challenges',
    label: 'Coding',
    description: 'Live coding environment with real-time complexity and edge-case analysis.',
    rotation: 15,
  },
  {
    icon: FileText,
    title: 'Resume Insights',
    label: 'Resume',
    description: 'Get interview questions generated directly from your own resume and projects.',
    rotation: 25,
  },
]

export function LandingFeatures() {
  const ref = useReveal<HTMLElement>()
  const [active, setActive] = useState(0)

  return (
    <section
      ref={ref}
      id="features"
      className="toolkit-band relative overflow-hidden py-24 sm:py-28 scroll-mt-24"
    >
      <div className="toolkit-band-bg" aria-hidden />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto mb-12 max-w-[620px] text-center">
          <div className="toolkit-eyebrow text-[13px] font-semibold uppercase tracking-[0.06em] mb-3.5">
            Your complete interview toolkit
          </div>
          <h2 className="toolkit-heading text-[2rem] sm:text-[2.375rem] font-extrabold tracking-[-0.02em] leading-[1.15]">
            Everything you need, nothing you don&apos;t.
          </h2>
        </div>

        <div className="reveal">
          <div className="hq-glass-fan" aria-label="Interview toolkit features">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <button
                  key={f.title}
                  type="button"
                  className="hq-glass-fan-card"
                  data-text={f.label}
                  aria-label={f.title}
                  aria-describedby="toolkit-fan-desc"
                  style={{ '--r': f.rotation } as CSSProperties}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <Icon strokeWidth={1.5} aria-hidden />
                </button>
              )
            })}
          </div>
          <p id="toolkit-fan-desc" className="hq-glass-fan-desc" aria-live="polite">
            {features[active]?.description}
          </p>
        </div>
      </div>
    </section>
  )
}
