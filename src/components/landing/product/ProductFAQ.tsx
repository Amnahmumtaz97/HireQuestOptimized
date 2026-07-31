'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useReveal } from '@/hooks/use-reveal'
import { PRODUCT_FAQS } from '@/components/landing/product/product-data'
import { SectionBand, SectionHeading } from '@/components/landing/product/product-ui'

export function ProductFAQ() {
  const ref = useReveal<HTMLDivElement>()
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <SectionBand tint id="faq">
      <div ref={ref} className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Product mechanics"
          title="Details about scoring, catalog, and limits"
          description="Focused on how the product behaves—not general interview-prep FAQs."
        />
        <div className="mt-10 space-y-3">
          {PRODUCT_FAQS.map((item, index) => {
            const open = openIndex === index
            return (
              <div
                key={item.q}
                className="reveal overflow-hidden rounded-2xl border border-border/70 bg-card/70 backdrop-blur-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  aria-expanded={open}
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span className="text-sm font-semibold text-foreground sm:text-[15px]">
                    {item.q}
                  </span>
                  <ChevronDown
                    className={[
                      'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                      open ? 'rotate-180' : '',
                    ].join(' ')}
                  />
                </button>
                {open ? (
                  <div className="border-t border-border/60 px-5 py-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </SectionBand>
  )
}
