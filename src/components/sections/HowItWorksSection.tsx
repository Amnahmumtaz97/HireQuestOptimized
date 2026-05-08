'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const steps = [
  {
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="iconGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899"/>
            <stop offset="100%" stopColor="#a855f7"/>
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#iconGrad1)" opacity="0.18"/>
        <path d="M18 8C13.03 8 9 12.03 9 17c0 2.8 1.24 5.3 3.2 7l-.7 3.5 3.5-.7A9 9 0 1 0 18 8Z" fill="url(#iconGrad1)" opacity="0.9"/>
        <circle cx="14" cy="17" r="1.5" fill="white"/>
        <circle cx="18" cy="17" r="1.5" fill="white"/>
        <circle cx="22" cy="17" r="1.5" fill="white"/>
      </svg>
    ),
    iconBg: 'rgba(236,72,153,0.12)',
    iconBorder: 'rgba(236,72,153,0.25)',
    title: 'Generate Questions',
    points: [
      'Tailored to role, level & company',
      'Behavioral, technical & system design',
      'Refreshed from real interview pools',
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="iconGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#ef4444"/>
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#iconGrad2)" opacity="0.18"/>
        <circle cx="18" cy="16" r="7" fill="none" stroke="url(#iconGrad2)" strokeWidth="2.2" opacity="0.9"/>
        <path d="M18 9v7l4 2" stroke="url(#iconGrad2)" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.9"/>
        <path d="M10 25l3-2M26 25l-3-2" stroke="url(#iconGrad2)" strokeWidth="1.8" strokeLinecap="round" opacity="0.7"/>
        <rect x="14" y="26" width="8" height="2.5" rx="1.2" fill="url(#iconGrad2)" opacity="0.8"/>
      </svg>
    ),
    iconBg: 'rgba(245,158,11,0.12)',
    iconBorder: 'rgba(245,158,11,0.25)',
    title: 'Answer Assistance',
    points: [
      'Real-time AI coach guidance',
      'Voice & text answer modes',
      'Structured frameworks (STAR, CIRCLES)',
    ],
  },
  {
    icon: (
      <svg viewBox="0 0 36 36" width="36" height="36" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="iconGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981"/>
            <stop offset="100%" stopColor="#3b82f6"/>
          </linearGradient>
        </defs>
        <rect width="36" height="36" rx="10" fill="url(#iconGrad3)" opacity="0.18"/>
        <rect x="8" y="22" width="4" height="8" rx="1.5" fill="url(#iconGrad3)" opacity="0.7"/>
        <rect x="14" y="17" width="4" height="13" rx="1.5" fill="url(#iconGrad3)" opacity="0.85"/>
        <rect x="20" y="12" width="4" height="18" rx="1.5" fill="url(#iconGrad3)"/>
        <path d="M8 20 L12 16 L17 18 L24 10" stroke="url(#iconGrad3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <circle cx="24" cy="10" r="2" fill="url(#iconGrad3)"/>
      </svg>
    ),
    iconBg: 'rgba(16,185,129,0.12)',
    iconBorder: 'rgba(16,185,129,0.25)',
    title: 'Analyze and Improve',
    points: [
      'Per-question scoring & rubric',
      'Tone, pacing & clarity feedback',
      'Personalized study plan',
    ],
  },
]

function StepCard({ step, delay }: { step: typeof steps[0]; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, borderColor: 'rgba(59,130,246,0.4)', boxShadow: '0 0 30px rgba(59,130,246,0.12)' }}
      className="relative rounded-2xl p-7 flex flex-col gap-6 overflow-hidden cursor-default transition-all duration-300"
      style={{
        background: 'linear-gradient(145deg, rgba(10,22,42,0.97) 0%, rgba(7,16,30,0.99) 100%)',
        border: '1px solid rgba(26,45,74,0.8)',
      }}
    >
      {/* Colorful Icon */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
        style={{ background: step.iconBg, border: `1px solid ${step.iconBorder}` }}
      >
        {step.icon}
      </div>

      {/* Title */}
      <h3 className="text-white font-bold text-xl relative z-10">{step.title}</h3>

      {/* Points */}
      <ul className="flex flex-col gap-2 relative z-10">
        {step.points.map((pt, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: delay + 0.2 + i * 0.08 }}
            className="flex items-center gap-2.5"
          >
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500" />
            <div className="flex-1 bg-slate-800/60 border border-slate-700/40 rounded-full px-4 py-2">
              <span className="text-slate-300 text-sm">{pt}</span>
            </div>
          </motion.li>
        ))}
      </ul>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-px shimmer-line" />
    </motion.div>
  )
}

export default function HowItWorksSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center border border-slate-700/60 bg-slate-800/40 rounded-full px-4 py-1.5 mb-6">
            <span className="text-slate-300 text-sm font-medium tracking-wider">HOW IT WORKS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            A <span className="text-gradient-blue">trusted process</span>{' '}
            <span className="text-white">built for results</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Three steps from cold prep to confident performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <StepCard key={i} step={step} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  )
}
