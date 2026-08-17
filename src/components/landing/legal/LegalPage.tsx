'use client'

import { ReadingProgress } from './ReadingProgress'
import { LegalHero } from './LegalHero'
import { LegalDocument } from './LegalDocument'
import type { LegalPageContent } from './types'

export function LegalPage({ content }: { content: LegalPageContent }) {
  return (
    <>
      <ReadingProgress />
      <LegalHero
        eyebrow={content.eyebrow}
        title={content.title}
        summary={content.summary}
        lastUpdated={content.lastUpdated}
        chips={content.chips}
        sealVariant={content.sealVariant}
      />
      <LegalDocument sections={content.sections} disclaimer={content.disclaimer} slug={content.slug} />
    </>
  )
}
