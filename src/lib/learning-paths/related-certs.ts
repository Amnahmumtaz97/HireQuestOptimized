import type { CertCategory } from '@/lib/certifications/constants'

const MIN_SCORE = 3
const MAX_RESULTS = 6
const TOKEN_CAP = 4

/** Path slug (kebab-case) → certification providerSlug values. */
const SLUG_TO_PROVIDERS: Record<string, string[]> = {
  aws: ['aws'],
  azure: ['microsoft'],
  gcp: ['google'],
  mongodb: ['mongodb'],
  'docker-k8s': ['docker', 'cncf'],
  'github-actions': ['github'],
  'oracle-db': ['oracle'],
  python: ['pythoninstitute'],
  'ethical-hacking': ['comptia'],
  'computer-networks': ['cisco', 'comptia'],
  owasp: ['comptia', 'isc2'],
  'web-security': ['comptia', 'isc2', 'cisco'],
  'secure-coding': ['comptia', 'isc2'],
  'prompt-engineering': ['openai', 'anthropic'],
  'ai-agents': ['openai', 'anthropic', 'huggingface', 'langchain'],
  rag: ['huggingface', 'langchain', 'openai'],
  databricks: ['databricks'],
  snowflake: ['snowflake'],
  terraform: ['hashicorp'],
  kubernetes: ['cncf', 'docker'],
  linux: ['linux'],
  ansible: ['redhat'],
}

const SUBCATEGORY_TO_CERT_CATEGORY: Record<string, CertCategory> = {
  cloud: 'cloud',
  devops: 'devops',
  cybersecurity: 'cybersecurity',
  ai_ml: 'ai',
  databases: 'databases',
  frontend: 'web-dev',
  backend: 'software-dev',
  languages: 'software-dev',
}

const ROLE_SLUG_TO_CERT_ROLES: Record<string, string[]> = {
  'frontend-developer': ['Frontend Developer'],
  'backend-developer': ['Backend Developer'],
  'full-stack-developer': ['Full Stack Developer'],
  'software-engineer': ['Software Engineer'],
  'ai-ml-engineer': ['AI Engineer', 'ML Engineer'],
  'data-scientist': ['Data Scientist'],
  'data-analyst': ['Data Analyst'],
  'devops-engineer': ['DevOps Engineer'],
  'cloud-engineer': ['Cloud Engineer'],
  'cybersecurity-analyst': ['Cybersecurity'],
  'qa-engineer': ['QA / SQA'],
  'sqa-automation-engineer': ['QA / SQA'],
  'database-administrator': ['Database Administrator'],
  'network-engineer': ['Network Engineer'],
  'product-manager': ['Product Manager'],
}

const STOP = new Set([
  'the',
  'and',
  'for',
  'with',
  'path',
  'prep',
  'practice',
  'interview',
  'interviews',
  'fundamentals',
  'basics',
  'developer',
  'engineer',
  'certified',
  'certification',
  'course',
])

export type PathMatchInput = {
  id?: string
  title: string
  slug?: string | null
  category?: string
  subcategory?: string
  tags?: string[]
  specializationKeys?: string[]
  suggestedTopics?: string[]
}

export type CertMatchInput = {
  id?: string
  name: string
  providerSlug: string
  category: string
  subcategories?: string[]
  roles?: string[]
  skills?: string[]
  tags?: string[]
  isFeatured?: boolean
}

export type RelatedPathSummary = {
  id: string
  title: string
  slug: string | null
  category: string
}

function kebab(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, '-')
}

function tokenize(...parts: Array<string | null | undefined>): Set<string> {
  const out = new Set<string>()
  for (const part of parts) {
    if (!part) continue
    const lower = part.toLowerCase()
    const joined = lower.replace(/[^a-z0-9]+/g, '')
    if (joined.length > 2 && !STOP.has(joined)) out.add(joined)
    for (const piece of lower.split(/[^a-z0-9]+/)) {
      if (piece.length > 2 && !STOP.has(piece)) out.add(piece)
    }
  }
  return out
}

function providersForPath(path: PathMatchInput): Set<string> {
  const found = new Set<string>()
  const keys = [path.slug, ...(path.tags ?? [])].filter(Boolean).map((k) => kebab(String(k)))
  for (const key of keys) {
    const mapped = SLUG_TO_PROVIDERS[key]
    if (mapped) {
      for (const slug of mapped) found.add(slug)
    }
  }
  return found
}

function pathTokens(path: PathMatchInput): Set<string> {
  return tokenize(
    path.title,
    path.slug ?? '',
    ...(path.tags ?? []),
    ...(path.specializationKeys ?? []),
    ...(path.suggestedTopics ?? []),
  )
}

function certTokens(cert: CertMatchInput): Set<string> {
  return tokenize(
    cert.name,
    cert.providerSlug,
    cert.category,
    ...(cert.subcategories ?? []),
    ...(cert.skills ?? []),
    ...(cert.tags ?? []),
  )
}

export function scorePathCert(path: PathMatchInput, cert: CertMatchInput): number {
  let score = 0

  const wantedProviders = providersForPath(path)
  if (wantedProviders.has(cert.providerSlug.toLowerCase())) {
    score += 5
  }
  if ((cert.subcategories ?? []).some((sub) => wantedProviders.has(sub.toLowerCase()))) {
    score += 3
  }

  const mappedCategory = path.subcategory
    ? SUBCATEGORY_TO_CERT_CATEGORY[path.subcategory]
    : undefined
  if (mappedCategory && cert.category === mappedCategory) {
    score += 3
  }

  const slug = path.slug ? kebab(path.slug) : ''
  const wantedRoles = ROLE_SLUG_TO_CERT_ROLES[slug] ?? []
  if (wantedRoles.length > 0) {
    const certRoles = new Set((cert.roles ?? []).map((r) => r.toLowerCase()))
    if (wantedRoles.some((role) => certRoles.has(role.toLowerCase()))) {
      score += 4
    }
  }

  const pTokens = pathTokens(path)
  const cTokens = certTokens(cert)
  let overlap = 0
  for (const token of pTokens) {
    if (cTokens.has(token)) overlap += 1
    if (overlap >= TOKEN_CAP) break
  }
  score += overlap

  return score
}

function compareHits(
  a: { score: number; featured: boolean; name: string },
  b: { score: number; featured: boolean; name: string },
): number {
  if (b.score !== a.score) return b.score - a.score
  if (a.featured !== b.featured) return a.featured ? -1 : 1
  return a.name.localeCompare(b.name)
}

export function selectRelatedCertifications<T extends CertMatchInput>(
  path: PathMatchInput,
  certs: T[],
  limit = MAX_RESULTS,
): T[] {
  return certs
    .map((cert) => ({
      cert,
      score: scorePathCert(path, cert),
      featured: Boolean(cert.isFeatured),
      name: cert.name,
    }))
    .filter((hit) => hit.score >= MIN_SCORE)
    .sort(compareHits)
    .slice(0, limit)
    .map((hit) => hit.cert)
}

export function selectRelatedPaths<T extends PathMatchInput & { id: string; title: string }>(
  cert: CertMatchInput,
  paths: T[],
  limit = MAX_RESULTS,
): RelatedPathSummary[] {
  return paths
    .map((path) => ({
      path,
      score: scorePathCert(path, cert),
      featured: false,
      name: path.title,
    }))
    .filter((hit) => hit.score >= MIN_SCORE)
    .sort(compareHits)
    .slice(0, limit)
    .map((hit) => ({
      id: hit.path.id,
      title: hit.path.title,
      slug: hit.path.slug ?? null,
      category: hit.path.category ?? 'technology',
    }))
}

export function pathMatchInputFromDoc(path: {
  title: string
  slug?: string | null
  category?: string
  subcategory?: string
  tags?: string[]
  stages?: Array<{ specializationKeys?: string[]; suggestedTopics?: string[] }>
}): PathMatchInput {
  const specializationKeys = new Set<string>()
  const suggestedTopics = new Set<string>()
  for (const stage of path.stages ?? []) {
    for (const key of stage.specializationKeys ?? []) specializationKeys.add(key)
    for (const topic of stage.suggestedTopics ?? []) suggestedTopics.add(topic)
  }
  return {
    title: path.title,
    slug: path.slug ?? null,
    category: path.category,
    subcategory: path.subcategory,
    tags: path.tags ?? [],
    specializationKeys: [...specializationKeys],
    suggestedTopics: [...suggestedTopics],
  }
}
