'use client'

import { useState, type CSSProperties } from 'react'
import {
  Sparkles,
  Building2,
  BarChart3,
  MessageCircle,
  Route,
  Award,
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
    title: 'Role-scoped questions',
    label: 'Role scope',
    description: 'Department, specialization, and topic filters so practice matches the loop you are targeting.',
    rotation: -15,
  },
  {
    icon: BarChart3,
    title: 'Dashboard & analytics',
    label: 'Analytics',
    description: 'Activity snapshot, completion trends, and skill breakdowns across saved sessions.',
    rotation: -5,
  },
  {
    icon: MessageCircle,
    title: 'Interview list',
    label: 'Interviews',
    description: 'Resume, review results, or start the next session from My Interviews.',
    rotation: 5,
  },
  {
    icon: Route,
    title: 'Learning paths',
    label: 'Paths',
    description: 'Overview, categories, and catalog tracks that line up with your target role.',
    rotation: 15,
  },
  {
    icon: Award,
    title: 'Certifications',
    label: 'Certs',
    description: 'Browse 70+ certs and practice the topics the exam actually tests.',
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
