'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  MessageSquare,
  Scale,
  Send,
  Shield,
} from 'lucide-react'
import { StarfieldBackground } from '@/components/landing/StarfieldBackground'
import { useReveal } from '@/hooks/use-reveal'
import { useToast } from '@/components/ui/toast'
import { StyledSelect } from '@/components/ui/styled-select'

const TOPICS = [
  { value: 'general', label: 'General question' },
  { value: 'support', label: 'Product support' },
  { value: 'billing', label: 'Billing / plans' },
  { value: 'privacy', label: 'Privacy request' },
  { value: 'security', label: 'Security report' },
  { value: 'partnership', label: 'Partnership / sales' },
] as const

const CHANNELS = [
  {
    title: 'Product support',
    description: 'Help with interviews, accounts, or learning paths.',
    email: 'support@hirequest.app',
    icon: MessageSquare,
  },
  {
    title: 'Privacy',
    description: 'Access, correction, or deletion requests.',
    email: 'privacy@hirequest.app',
    icon: Shield,
    href: '/privacy',
  },
  {
    title: 'Security',
    description: 'Report a vulnerability privately.',
    email: 'security@hirequest.app',
    icon: Lock,
    href: '/security',
  },
  {
    title: 'Legal',
    description: 'Terms questions and policy notices.',
    email: 'legal@hirequest.app',
    icon: Scale,
    href: '/terms',
  },
] as const

function ContactSeal({ className = '' }: { className?: string }) {
  return (
    <div
      className={['hq-legal-seal pointer-events-none select-none', className].filter(Boolean).join(' ')}
      aria-hidden
    >
      <svg viewBox="0 0 120 120" className="h-28 w-28 sm:h-32 sm:w-32" fill="none">
        <defs>
          <linearGradient id="hqContactSealGrad" x1="20" y1="12" x2="100" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="color-mix(in oklab, var(--primary) 88%, white)" />
            <stop offset="1" stopColor="color-mix(in oklab, var(--primary) 42%, #0f172a)" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="52" fill="url(#hqContactSealGrad)" opacity="0.18" />
        <circle
          cx="60"
          cy="60"
          r="44"
          stroke="color-mix(in oklab, var(--primary) 55%, var(--border))"
          strokeWidth="1.5"
        />
        <rect
          x="34"
          y="42"
          width="52"
          height="36"
          rx="6"
          fill="color-mix(in oklab, var(--primary) 18%, transparent)"
          stroke="color-mix(in oklab, var(--primary) 70%, white)"
          strokeWidth="2"
        />
        <path
          d="M36 46 L60 62 L84 46"
          stroke="color-mix(in oklab, var(--primary) 75%, white)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

const fieldClass =
  'h-11 w-full rounded-xl border border-border bg-input/15 px-3.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:bg-input/25'

export function ContactPageContent() {
  const toast = useToast()
  const ref = useReveal<HTMLDivElement>()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState<(typeof TOPICS)[number]['value']>('general')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedMessage = message.trim()

    if (trimmedName.length < 2) {
      toast.error('Please enter your name')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error('Please enter a valid email')
      return
    }
    if (trimmedMessage.length < 12) {
      toast.error('Please add a bit more detail to your message')
      return
    }

    setSubmitting(true)
    const topicLabel = TOPICS.find((t) => t.value === topic)?.label ?? topic
    const subject = encodeURIComponent(`[HireQuest] ${topicLabel}`)
    const body = encodeURIComponent(
      `Name: ${trimmedName}\nEmail: ${trimmedEmail}\nTopic: ${topicLabel}\n\n${trimmedMessage}`,
    )
    const inbox =
      topic === 'privacy'
        ? 'privacy@hirequest.app'
        : topic === 'security'
          ? 'security@hirequest.app'
          : topic === 'partnership'
            ? 'sales@hirequest.app'
            : 'support@hirequest.app'

    window.location.href = `mailto:${inbox}?subject=${subject}&body=${body}`
    window.setTimeout(() => {
      setSent(true)
      setSubmitting(false)
      toast.success('Opening your email client…')
    }, 200)
  }

  return (
    <div ref={ref}>
      <section className="hq-legal-hero relative isolate overflow-hidden pt-28 sm:pt-32 pb-10 sm:pb-12">
        <StarfieldBackground section overlay />
        <div className="hq-legal-hero-wash pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-[1] mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="reveal min-w-0">
              <span className="inline-flex items-center rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground backdrop-blur-sm">
                Contact
              </span>
              <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.03em] text-foreground sm:text-4xl md:text-[2.65rem] md:leading-[1.08]">
                Talk to the HireQuest team
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Questions about interviews, billing, privacy, or partnerships — send a note and we’ll point
                you to the right place.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {['Support', 'Privacy', 'Security', 'Sales'].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center rounded-full border border-border bg-input/20 px-3 py-1 text-xs font-medium text-muted-foreground"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <ContactSeal className="reveal mx-auto lg:mx-0" />
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="reveal rounded-2xl border border-border bg-card/70 p-5 sm:p-7">
            {sent ? (
              <div className="flex min-h-[22rem] flex-col items-center justify-center text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/15 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h2 className="mt-4 text-xl font-bold text-foreground">Almost there</h2>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                  Your email client should open with the message ready. If it didn’t, copy your note and email{' '}
                  <a className="font-semibold text-primary hover:underline" href="mailto:support@hirequest.app">
                    support@hirequest.app
                  </a>
                  .
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false)
                    setMessage('')
                  }}
                  className="hq-btn-outline mt-6 h-10 rounded-xl px-4 text-xs"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-4" noValidate>
                <div>
                  <h2 className="text-lg font-bold tracking-[-0.02em] text-foreground">Send a message</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We route by topic — privacy and security go to dedicated inboxes.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">Name</span>
                    <input
                      className={fieldClass}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Morgan"
                      autoComplete="name"
                      required
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground">Email</span>
                    <input
                      type="email"
                      className={fieldClass}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      autoComplete="email"
                      required
                    />
                  </label>
                </div>

                <div className="block space-y-1.5">
                  <span className="text-xs font-semibold text-muted-foreground">Topic</span>
                  <StyledSelect
                    value={topic}
                    onChange={(value) =>
                      setTopic(value as (typeof TOPICS)[number]['value'])
                    }
                    options={TOPICS}
                    ariaLabel="Contact topic"
                    className="h-11"
                  />
                </div>

                <label className="block space-y-1.5">
                  <span className="flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground">
                    Message
                    <span className="font-medium text-muted-foreground/70">{message.length}/1200</span>
                  </span>
                  <textarea
                    rows={6}
                    maxLength={1200}
                    className="w-full resize-y rounded-xl border border-border bg-input/15 px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary/50 focus:bg-input/25"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need help with…"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="hq-btn-primary inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm disabled:opacity-60 sm:w-auto sm:px-6"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Opening mail…' : 'Send message'}
                </button>
              </form>
            )}
          </div>

          <div className="space-y-4">
            <div className="reveal rounded-2xl border border-border bg-card/60 p-5">
              <p className="text-sm font-semibold text-foreground">Direct channels</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Prefer email? Use the inbox that matches your request.
              </p>
              <div className="mt-4 space-y-3">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon
                  return (
                    <div
                      key={channel.email}
                      className="rounded-xl border border-border bg-input/10 px-3.5 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground">{channel.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{channel.description}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <a
                              href={`mailto:${channel.email}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                            >
                              <Mail className="h-3.5 w-3.5" />
                              {channel.email}
                            </a>
                            {'href' in channel && channel.href ? (
                              <Link
                                href={channel.href}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
                              >
                                Read more <ArrowRight className="h-3 w-3" />
                              </Link>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="reveal rounded-2xl border border-border bg-primary/8 p-5">
              <p className="text-sm font-semibold text-foreground">Response times</p>
              <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted-foreground">
                <li>Support & general: usually within 1–2 business days.</li>
                <li>Security reports: acknowledged as soon as practical.</li>
                <li>Privacy requests: handled per our Privacy Policy.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
