'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Shield, Scale, Lock } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import type { LegalPageContent } from './types'

const CROSS_LINKS = [
  { href: '/privacy', label: 'Privacy Policy', icon: Shield },
  { href: '/terms', label: 'Terms of Use', icon: Scale },
  { href: '/security', label: 'Security Overview', icon: Lock },
] as const

type LegalDocumentProps = Pick<LegalPageContent, 'sections' | 'disclaimer' | 'slug'>

export function LegalDocument({ sections, disclaimer, slug }: LegalDocumentProps) {
  const ref = useReveal<HTMLElement>()
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  useEffect(() => {
    const nodes = sections
      .map((s) => sectionRefs.current.get(s.id))
      .filter(Boolean) as HTMLElement[]
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [sections])

  return (
    <section ref={ref} className="hq-legal-doc pb-16 sm:pb-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:z-10 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
            <nav aria-label="On this page" className="hq-legal-toc rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">On this page</p>
              <ul className="mt-3 space-y-1">
                {sections.map((section) => {
                  const active = activeId === section.id
                  return (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        className={[
                          'block rounded-lg px-2.5 py-2 text-xs font-medium leading-snug transition-colors',
                          active
                            ? 'bg-primary/12 text-primary'
                            : 'text-muted-foreground hover:bg-input/20 hover:text-foreground',
                        ].join(' ')}
                      >
                        {section.title}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </aside>

          <article className="min-w-0">
            <p className="reveal rounded-xl border border-border/80 bg-input/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
              {disclaimer}
            </p>

            <div className="mt-8 space-y-10">
              {sections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  ref={(el) => {
                    if (el) sectionRefs.current.set(section.id, el)
                    else sectionRefs.current.delete(section.id)
                  }}
                  className="reveal scroll-mt-28"
                >
                  <h2 className="text-lg font-bold tracking-[-0.02em] text-foreground sm:text-xl">{section.title}</h2>
                  {section.paragraphs?.map((p) => (
                    <p key={p.slice(0, 40)} className="mt-3 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                      {p}
                    </p>
                  ))}
                  {section.bullets?.length ? (
                    <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-muted-foreground sm:text-[15px]">
                      {section.bullets.map((item) => (
                        <li key={item.slice(0, 48)}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <div className="reveal mt-12 rounded-2xl border border-border bg-card/70 p-5 sm:p-6">
              <p className="text-sm font-semibold text-foreground">Related policies</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {CROSS_LINKS.filter((link) => !link.href.endsWith(`/${slug}`)).map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-input/10 px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/35 hover:bg-primary/8"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        {link.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
