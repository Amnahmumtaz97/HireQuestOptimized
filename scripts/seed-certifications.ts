/**
 * Seed script for Certifications collection.
 * Idempotent: upserts by { name, provider } composite key.
 *
 * Run: npm run seed:certifications
 */

import * as fs from 'fs'
import * as path from 'path'
import mongoose from 'mongoose'
import { CERT_SEED_DATA } from '../src/lib/certifications/seed-data'

// Load .env manually (mirrors seed-learning-paths.js pattern)
function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return
  const content = fs.readFileSync(envPath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    if (!line || line.startsWith('#')) continue
    const separatorIndex = line.indexOf('=')
    if (separatorIndex < 0) continue
    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (key && process.env[key] === undefined) process.env[key] = value
  }
}
loadEnvFile()

const MONGODB_URI = process.env.MONGODB_URI
if (!MONGODB_URI) {
  console.error('ERROR: MONGODB_URI environment variable is not set.')
  process.exit(1)
}

// Inline schema — avoids Next.js module resolution issues in scripts
type CertificationSeedDocument = Record<string, unknown>

const certSchema = new mongoose.Schema<CertificationSeedDocument>(
  {
    name: String,
    provider: String,
    providerSlug: String,
    category: String,
    subcategories: [String],
    roles: [String],
    level: String,
    costType: String,
    credentialType: String,
    examRequired: Boolean,
    description: String,
    whyItMatters: String,
    skills: [String],
    estimatedHours: { type: Number, default: null },
    portfolioValue: String,
    portfolioNote: String,
    linkedinSupported: Boolean,
    resumeRecommended: Boolean,
    officialUrl: String,
    credentialUrl: String,
    expiration: { type: String, default: null },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    lastVerifiedAt: String,
    sourceNotes: String,
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true },
)

certSchema.index({ name: 'text', provider: 'text', description: 'text', skills: 'text', tags: 'text' })

const CertModel: mongoose.Model<CertificationSeedDocument> =
  (mongoose.models.Certification as mongoose.Model<CertificationSeedDocument> | undefined) ??
  mongoose.model<CertificationSeedDocument>('Certification', certSchema)

async function main() {
  await mongoose.connect(MONGODB_URI as string)
  console.log(`Connected to MongoDB. Seeding ${CERT_SEED_DATA.length} certifications…`)

  let created = 0
  let updated = 0

  for (const cert of CERT_SEED_DATA) {
    const nameFilter = cert.name
    const providerFilter = cert.provider
    const existing = await CertModel.findOne({ name: nameFilter, provider: providerFilter }).lean()

    if (existing) {
      await CertModel.updateOne({ name: nameFilter, provider: providerFilter }, { $set: cert })
      updated++
    } else {
      await CertModel.create(cert)
      created++
    }
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`)
  await mongoose.disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
