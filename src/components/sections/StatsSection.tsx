'use client'

import { motion, useInView, useMotionValue, useSpring } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Users, FileText, Building2, Star } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  value: string
  suffix: string
  label: string
  delay: number
  target: number
  decimals?: number
}

function AnimatedNumber({ target, decimals = 0 }: { target: number; decimals?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Number((eased * target).toFixed(decimals)))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, target, decimals])

  return <span ref={ref}>{decimals > 0 ? count.toFixed(1) : Math.round(count).toLocaleString()}</span>
}

function StatCard({ icon, value, suffix, label, delay, target, decimals }: StatCardProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className="card-hover relative rounded-2xl p-6 flex flex-col gap-4"
      style={{
        background: 'linear-gradient(135deg, rgba(10,22,40,0.95) 0%, rgba(7,16,32,0.98) 100%)',
        border: '1px solid rgba(26,45,74,0.8)',
      }}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
          {icon}
        </div>
        <div className="flex items-center gap-1.5">
          <div className="live-dot w-2 h-2 rounded-full bg-green-400" />
          <span className="text-green-400 text-xs font-semibold tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-white font-extrabold" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', lineHeight: 1 }}>
          <AnimatedNumber target={target} decimals={decimals} />
          <span className="text-blue-400">{suffix}</span>
        </p>
        <p className="text-slate-400 text-sm mt-2 font-medium">{label}</p>
      </div>
    </motion.div>
  )
}

export default function StatsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const stats = [
    { icon: <Users size={20} />, value: '10,000', suffix: ' +', label: 'Active Users', target: 10000 },
    { icon: <FileText size={20} />, value: '650,000', suffix: ' +', label: 'Interviews Created', target: 650000 },
    { icon: <Building2 size={20} />, value: '65', suffix: ' +', label: 'Companies', target: 65 },
    { icon: <Star size={20} />, value: '4.8', suffix: '/5', label: 'Average Rating', target: 4.8, decimals: 1 },
  ]

  return (
    <section id="stats" className="py-24 px-4 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center border border-slate-700/60 bg-slate-800/40 rounded-full px-4 py-1.5 mb-6">
            <span className="text-slate-300 text-sm font-medium tracking-wider">BY THE NUMBERS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Trusted by candidates{' '}
            <span className="text-gradient-blue">worldwide</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A growing community using HireQuest to land roles at top companies.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}
