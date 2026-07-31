'use client'

import { useState } from 'react'
import { useReveal } from '@/hooks/use-reveal'

const faqs = [
  {
    q: 'How does AI generate interview questions?',
    a: 'HireQuest combines a large question bank informed by real interview loops with a generative model that adapts questions to your chosen role, seniority, and topics. Every session produces a fresh, non-repeating set.',
  },
  {
    q: 'Which interview categories are available?',
    a: 'Technical (coding + system design), Behavioral (STAR-format), MCQ assessments, and Mixed loops that mirror an on-site interview day.',
  },
  {
    q: 'How does behavioral analysis work?',
    a: 'We evaluate your answers against the STAR framework — Situation, Task, Action, Result — and flag missing structure, weak impact statements, or answers that ramble instead of resolving.',
  },
  {
    q: 'How does voice analysis work?',
    a: 'When you speak an answer, HireQuest measures pace, tone, filler words, and long pauses, then returns coaching notes so you can sound more confident on the next take.',
  },
  {
    q: 'Are coding challenges and MCQ assessments supported?',
    a: 'Yes. Coding challenges run in a live editor with complexity and edge-case commentary. MCQ assessments give you timed, topic-scoped questions with per-question explanations.',
  },
  {
    q: 'Can I retake mock interviews and track my improvement?',
    a: 'Every session is saved. You can retake any interview, compare attempts side-by-side, and track topic-level trends across weeks in your dashboard.',
  },
  {
    q: 'How are feedback reports generated?',
    a: 'After each session, the AI scores your answers on correctness, clarity, and communication, then compiles a detailed report with strengths, gaps, and specific improvement actions.',
  },
  {
    q: 'Is it really free to start?',
    a: 'Yes. Create and complete your first interview without a credit card. Paid plans unlock unlimited sessions and deeper analytics.',
  },
]

export function FAQ() {
  const ref = useReveal<HTMLElement>()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section
      ref={ref}
      id="faq"
      className="relative overflow-hidden py-24 sm:py-28 scroll-mt-24"
    >
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[70%] -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(37, 99, 235, 0.14), transparent 65%)',
          filter: 'blur(90px)',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-10 h-[240px] w-[240px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16), transparent 70%)',
          filter: 'blur(80px)',
        }}
        aria-hidden
      />
      <span className="section-stripes-node" style={{ left: '10%', top: '18%' }} aria-hidden />
      <span
        className="section-stripes-node"
        style={{ left: '86%', top: '24%', animationDelay: '1.2s' }}
        aria-hidden
      />
      <span
        className="section-stripes-node"
        style={{ left: '14%', bottom: '18%', animationDelay: '2.4s' }}
        aria-hidden
      />
      <span
        className="section-stripes-node"
        style={{ left: '82%', bottom: '20%', animationDelay: '0.6s' }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="reveal mx-auto mb-14 max-w-[620px] text-center">
          <div className="text-[13px] font-semibold uppercase tracking-[0.06em] text-primary mb-3.5">
            FAQ
          </div>
          <h2 className="text-[2rem] sm:text-[2.375rem] font-extrabold tracking-[-0.02em] leading-[1.15] text-foreground">
            Questions, answered.
          </h2>
        </div>

        <div
          className="reveal mx-auto max-w-[760px] rounded-2xl border border-border bg-card backdrop-blur-xl"
          style={{
            background: 'color-mix(in oklab, var(--card) 90%, transparent)',
            boxShadow: '0 20px 60px -30px color-mix(in oklab, var(--primary) 25%, transparent)',
          }}
        >
          {faqs.map((item, i) => {
            const open = openIndex === i
            return (
              <div
                key={item.q}
                className={i < faqs.length - 1 ? 'border-b border-border' : ''}
              >
                <button
                  type="button"
                  className="w-full flex items-center justify-between gap-4 py-6 px-6 text-left text-[16px] font-semibold text-foreground hover:bg-[var(--secondary)] transition-colors"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="relative h-[22px] w-[22px] shrink-0" aria-hidden>
                    <span className="absolute left-1 top-[10px] h-0.5 w-[14px] bg-foreground rounded-full" />
                    <span
                      className={[
                        'absolute left-[10px] top-1 h-[14px] w-0.5 bg-foreground rounded-full transition-transform duration-200',
                        open ? 'rotate-90 opacity-0' : '',
                      ].join(' ')}
                    />
                  </span>
                </button>
                <div
                  className={[
                    'grid transition-[grid-template-rows] duration-200 ease-out',
                    open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  ].join(' ')}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-[15px] leading-[1.65] text-muted-foreground">
                      {item.a}
                    </p>
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
