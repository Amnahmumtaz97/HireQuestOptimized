import { Schema, model, models, type Model } from 'mongoose'
import {
  CERT_COST_TYPES,
  CERT_CREDENTIAL_TYPES,
  CERT_LEVELS,
  CERT_PORTFOLIO_VALUES,
  CERT_CATEGORIES,
  type CertCostType,
  type CertCredentialType,
  type CertLevel,
  type CertPortfolioValue,
  type CertCategory,
} from '@/lib/certifications/constants'

export interface ICertification {
  /** Display name, e.g. "AWS Certified Cloud Practitioner" */
  name: string
  /** Provider display name, e.g. "Amazon Web Services" */
  provider: string
  /** Slug for icon/color mapping, e.g. "aws" */
  providerSlug: string
  category: CertCategory
  subcategories?: string[]
  /** Relevant job roles for this certification */
  roles: string[]
  level: CertLevel
  costType: CertCostType
  credentialType: CertCredentialType
  /** True if the credential requires a formal exam */
  examRequired: boolean
  /** 1–3 sentence factual description */
  description: string
  /** Plain-English explanation of why this credential matters */
  whyItMatters: string
  /** Skills or technologies this credential demonstrates */
  skills: string[]
  estimatedHours?: number | null
  portfolioValue: CertPortfolioValue
  /** Brief note for users, e.g. "Recognized entry-level cloud credential." */
  portfolioNote: string
  /** Can be added to LinkedIn Licenses & Certifications section */
  linkedinSupported: boolean
  resumeRecommended: boolean
  /** Direct URL to the official enrollment or information page */
  officialUrl: string
  /** Direct badge/credential verification URL if different from officialUrl */
  credentialUrl?: string
  /** "3 years" | "No expiration" | null = unknown */
  expiration?: string | null
  isFeatured?: boolean
  tags?: string[]
  /** ISO date string "2025-01-15" of last manual verification */
  lastVerifiedAt: string
  /** Source notes for admin context, e.g. "Verified via official pricing page" */
  sourceNotes?: string
  /** Soft-delete: unpublish instead of delete */
  isPublished: boolean
}

const certificationSchema = new Schema<ICertification>(
  {
    name: { type: String, required: true, trim: true },
    provider: { type: String, required: true, trim: true },
    providerSlug: { type: String, required: true, trim: true, lowercase: true, index: true },
    category: { type: String, enum: CERT_CATEGORIES, required: true, index: true },
    subcategories: { type: [String], default: [] },
    roles: { type: [String], default: [], index: true },
    level: { type: String, enum: CERT_LEVELS, required: true, index: true },
    costType: { type: String, enum: CERT_COST_TYPES, required: true, index: true },
    credentialType: { type: String, enum: CERT_CREDENTIAL_TYPES, required: true, index: true },
    examRequired: { type: Boolean, required: true, default: false },
    description: { type: String, required: true, trim: true },
    whyItMatters: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    estimatedHours: { type: Number, default: null },
    portfolioValue: { type: String, enum: CERT_PORTFOLIO_VALUES, required: true },
    portfolioNote: { type: String, required: true, trim: true },
    linkedinSupported: { type: Boolean, default: false },
    resumeRecommended: { type: Boolean, default: false },
    officialUrl: { type: String, required: true, trim: true },
    credentialUrl: { type: String, trim: true },
    expiration: { type: String, default: null },
    isFeatured: { type: Boolean, default: false, index: true },
    tags: { type: [String], default: [] },
    lastVerifiedAt: { type: String, required: true },
    sourceNotes: { type: String, trim: true },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
)

certificationSchema.index({
  name: 'text',
  provider: 'text',
  description: 'text',
  skills: 'text',
  tags: 'text',
})

certificationSchema.index({ isPublished: 1, category: 1 })
certificationSchema.index({ isPublished: 1, costType: 1 })
certificationSchema.index({ isPublished: 1, level: 1 })

export const CertificationModel: Model<ICertification> =
  models.Certification || model<ICertification>('Certification', certificationSchema)
