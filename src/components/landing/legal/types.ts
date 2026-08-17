export type LegalSection = {
  id: string
  title: string
  paragraphs?: string[]
  bullets?: string[]
}

export type LegalPageContent = {
  slug: 'privacy' | 'terms' | 'security'
  eyebrow: string
  title: string
  summary: string
  lastUpdated: string
  chips: string[]
  sealVariant: 'privacy' | 'terms' | 'security'
  sections: LegalSection[]
  disclaimer: string
}
