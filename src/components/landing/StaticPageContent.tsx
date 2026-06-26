import type { ReactNode } from 'react'
import { PageHero } from '@/components/landing/PageHero'
import { FeatureGrid } from '@/components/landing/FeatureGrid'

type StaticPageContentProps = {
  eyebrow: string
  title: ReactNode
  description: string
  items: Array<{
    title: string
    description: string
    icon: ReactNode
  }>
  footer?: ReactNode
}

export function StaticPageContent({ eyebrow, title, description, items, footer }: StaticPageContentProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description}>
        {footer}
      </PageHero>
      <FeatureGrid items={items} />
    </>
  )
}