'use client'

import { useSession } from 'next-auth/react'
import { useReveal } from '@/hooks/use-reveal'
import { PRODUCT_SURFACES } from '@/components/landing/product/product-data'
import { SectionBand, SectionHeading } from '@/components/landing/product/product-ui'
import { GoCard } from '@/components/landing/GoCard'

export function ProductCapabilityMap() {
  const ref = useReveal<HTMLDivElement>()
  const { status } = useSession()
  const authed = status === 'authenticated'

  return (
    <SectionBand tint id="surfaces">
      <div ref={ref} className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="App surfaces"
          title="Where each part of HireQuest lives"
          description="These map to real routes in the signed-in app—dashboard, interviews, paths, certs, and analytics."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_SURFACES.map((surface, index) => {
            const Icon = surface.icon
            const href = authed ? surface.href : '/auth'
            return (
              <GoCard
                key={surface.title}
                href={href}
                className="reveal p-5"
                style={{ transitionDelay: `${index * 45}ms` }}
              >
                <div className="hq-go-icon inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--hq-display-blue)]/12 text-[var(--hq-display-blue)]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-bold text-foreground">{surface.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{surface.description}</p>
              </GoCard>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}
