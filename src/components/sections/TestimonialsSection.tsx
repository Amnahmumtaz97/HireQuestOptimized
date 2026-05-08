'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    initials: 'AM',
    name: 'Aarav Mehta',
    role: 'Software Engineer @ Stripe',
    rating: 5,
    title: 'Amazing Experience',
    body: "HireQuest's mock interviews felt incredibly realistic. The AI feedback pinpointed weaknesses I didn't know I had — I landed my offer in three weeks.",
    color: 'from-blue-500 to-cyan-400',
  },
  {
    initials: 'SL',
    name: 'Sofia Lindqvist',
    role: 'Product Designer @ Linear',
    rating: 5,
    title: 'Genuinely game-changing',
    body: "The behavioral practice with real-time tone analysis is unreal. It's like having a senior coach available at midnight before every interview.",
    color: 'from-cyan-500 to-blue-400',
  },
  {
    initials: 'DP',
    name: 'Daniel Park',
    role: 'ML Engineer @ Anthropic',
    rating: 5,
    title: 'Worth every minute',
    body: 'I ran 40+ system design sessions. The structured feedback and follow-up questions were sharper than what I got from human mocks.',
    color: 'from-blue-600 to-indigo-400',
  },
  {
    initials: 'PN',
    name: 'Priya Nair',
    role: 'PM @ Notion',
    rating: 4,
    title: 'Confidence on tap',
    body: 'I went from freezing on case prompts to walking in calm. The replay + transcript feature is a quiet superpower.',
    color: 'from-indigo-500 to-purple-400',
  },
  {
    initials: 'JK',
    name: 'James Kim',
    role: 'Backend Engineer @ Shopify',
    rating: 5,
    title: 'Landed FAANG in 6 weeks',
    body: 'I used HireQuest every day for 6 weeks before my Google loop. The adaptive question engine kept surprising me — no two sessions felt the same.',
    color: 'from-emerald-500 to-cyan-400',
  },
  {
    initials: 'RV',
    name: 'Riya Verma',
    role: 'Data Scientist @ Meta',
    rating: 5,
    title: 'Best prep tool out there',
    body: 'The combination of mock interviews, instant scoring, and personalized study plans is unmatched. I went into Meta feeling genuinely prepared.',
    color: 'from-violet-500 to-blue-400',
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={15} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}/>
      ))}
    </div>
  )
}

function TestimonialCard({ testimonial, delay }: { testimonial: typeof testimonials[0]; delay: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 0 30px rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.4)' }}
      className="rounded-2xl p-6 flex flex-col gap-4 cursor-default transition-colors duration-300"
      style={{
        background: 'linear-gradient(135deg, rgba(10,22,40,0.95) 0%, rgba(7,16,32,0.98) 100%)',
        border: '1px solid rgba(26,45,74,0.8)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${testimonial.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
            {testimonial.initials}
          </div>
          <div>
            <p className="text-white text-sm font-semibold">{testimonial.name}</p>
            <p className="text-slate-400 text-xs">{testimonial.role}</p>
          </div>
        </div>
        <StarRating rating={testimonial.rating} />
      </div>

      <div>
        <h4 className="text-white font-bold mb-2">{testimonial.title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed">{testimonial.body}</p>
      </div>
    </motion.div>
  )
}

export default function TestimonialsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="testimonials" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center border border-slate-700/60 bg-slate-800/40 rounded-full px-4 py-1.5 mb-6">
            <span className="text-slate-300 text-sm font-medium tracking-wider">TESTIMONIALS</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Loved by people who got{' '}
            <span className="text-gradient-blue">hired</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Real stories from candidates who used HireQuest to prep — and won.
          </p>
        </motion.div>

        {/* 2 rows of 3 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} testimonial={t} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}
