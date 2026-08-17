import type { Types } from 'mongoose'
import type { ICertification } from '@/models/Certification'

export type SerializedCertification = {
  id: string
  name: string
  provider: string
  providerSlug: string
  category: string
  subcategories: string[]
  roles: string[]
  level: string
  costType: string
  credentialType: string
  examRequired: boolean
  description: string
  whyItMatters: string
  skills: string[]
  estimatedHours: number | null
  portfolioValue: string
  portfolioNote: string
  linkedinSupported: boolean
  resumeRecommended: boolean
  officialUrl: string
  credentialUrl: string | null
  expiration: string | null
  isFeatured: boolean
  tags: string[]
  lastVerifiedAt: string
  /** sourceNotes is excluded from user-facing serialization */
  isPublished: boolean
  createdAt: string | null
  updatedAt: string | null
}

export function serializeCertification(
  cert: ICertification & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date },
): SerializedCertification {
  return {
    id: String(cert._id),
    name: cert.name,
    provider: cert.provider,
    providerSlug: cert.providerSlug,
    category: cert.category,
    subcategories: cert.subcategories ?? [],
    roles: cert.roles ?? [],
    level: cert.level,
    costType: cert.costType,
    credentialType: cert.credentialType,
    examRequired: Boolean(cert.examRequired),
    description: cert.description,
    whyItMatters: cert.whyItMatters,
    skills: cert.skills ?? [],
    estimatedHours: typeof cert.estimatedHours === 'number' ? cert.estimatedHours : null,
    portfolioValue: cert.portfolioValue,
    portfolioNote: cert.portfolioNote,
    linkedinSupported: Boolean(cert.linkedinSupported),
    resumeRecommended: Boolean(cert.resumeRecommended),
    officialUrl: cert.officialUrl,
    credentialUrl: cert.credentialUrl ?? null,
    expiration: cert.expiration ?? null,
    isFeatured: Boolean(cert.isFeatured),
    tags: cert.tags ?? [],
    lastVerifiedAt: cert.lastVerifiedAt,
    isPublished: Boolean(cert.isPublished),
    createdAt: cert.createdAt ? cert.createdAt.toISOString() : null,
    updatedAt: cert.updatedAt ? cert.updatedAt.toISOString() : null,
  }
}

/** Admin serialization includes sourceNotes */
export function serializeCertificationAdmin(
  cert: ICertification & { _id: Types.ObjectId; createdAt?: Date; updatedAt?: Date },
): SerializedCertification & { sourceNotes: string | null } {
  return {
    ...serializeCertification(cert),
    sourceNotes: cert.sourceNotes ?? null,
  }
}
