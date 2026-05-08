'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'

export default function CTASection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-3xl overflow-hidden px-8 py-20 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(15,30,60,0.95) 0%, rgba(10,20,45,0.98) 50%, rgba(15,30,60,0.95) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          {/* Background grid pattern */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />

          {/* Glow center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-32 bg-blue-600/15 blur-3xl pointer-events-none" />

          {/* Top border line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

          {/* Content */}
          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center border border-slate-700/60 bg-slate-800/40 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="text-slate-300 text-sm font-medium tracking-wider">READY WHEN YOU ARE</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight"
            >
              Ready to ace your{' '}
              <span className="text-gradient-blue">next interview?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-slate-400 text-lg mb-10"
            >
              Start practicing in under a minute. No credit card required.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(59,130,246,0.6)' }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary inline-flex items-center gap-2.5 text-white font-semibold text-base px-10 py-4 rounded-full"
              >
                Start Your First Interview
                <ArrowRight size={18} strokeWidth={2.5} />
              </motion.button>
            </motion.div>
          </div>

          {/* Bottom border line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
        </motion.div>
      </div>
    </section>
  )
}
