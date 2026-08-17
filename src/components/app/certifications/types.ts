import type { SerializedCertification } from '@/lib/certifications/serialize'

export type Certification = SerializedCertification

export type CertFilterState = {
  q: string
  category: string
  cost: string
  level: string
  provider: string
  linkedin: boolean
  exam: string
  sort: string
  page: number
}

export const DEFAULT_CERT_FILTERS: CertFilterState = {
  q: '',
  category: '',
  cost: '',
  level: '',
  provider: '',
  linkedin: false,
  exam: '',
  sort: 'featured',
  page: 1,
}
