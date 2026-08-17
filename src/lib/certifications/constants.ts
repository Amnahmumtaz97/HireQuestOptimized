// ── Cost types ──────────────────────────────────────────────────────────────
export const CERT_COST_TYPES = ['free', 'free-exam', 'partially-free', 'paid'] as const
export type CertCostType = (typeof CERT_COST_TYPES)[number]

export const CERT_COST_LABELS: Record<CertCostType, string> = {
  free: 'Free',
  'free-exam': 'Free + Paid Exam',
  'partially-free': 'Partially Free',
  paid: 'Paid',
}

// ── Credential types ─────────────────────────────────────────────────────────
export const CERT_CREDENTIAL_TYPES = [
  'professional-certification',
  'industry-certification',
  'digital-badge',
  'skill-assessment',
  'course-certificate',
  'learning-credential',
] as const
export type CertCredentialType = (typeof CERT_CREDENTIAL_TYPES)[number]

export const CERT_CREDENTIAL_LABELS: Record<CertCredentialType, string> = {
  'professional-certification': 'Professional Certification',
  'industry-certification': 'Industry Certification',
  'digital-badge': 'Digital Badge',
  'skill-assessment': 'Skill Assessment',
  'course-certificate': 'Course Certificate',
  'learning-credential': 'Learning Credential',
}

// ── Levels ───────────────────────────────────────────────────────────────────
export const CERT_LEVELS = ['beginner', 'intermediate', 'advanced'] as const
export type CertLevel = (typeof CERT_LEVELS)[number]

export const CERT_LEVEL_LABELS: Record<CertLevel, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
}

// ── Portfolio value ───────────────────────────────────────────────────────────
export const CERT_PORTFOLIO_VALUES = ['high', 'medium', 'low'] as const
export type CertPortfolioValue = (typeof CERT_PORTFOLIO_VALUES)[number]

export const CERT_PORTFOLIO_VALUE_LABELS: Record<CertPortfolioValue, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

// ── Categories ───────────────────────────────────────────────────────────────
export const CERT_CATEGORIES = [
  'ai',
  'cloud',
  'cybersecurity',
  'data',
  'devops',
  'databases',
  'networking',
  'web-dev',
  'software-dev',
  'project-management',
  'other',
] as const
export type CertCategory = (typeof CERT_CATEGORIES)[number]

export const CERT_CATEGORY_LABELS: Record<CertCategory, string> = {
  ai: 'AI & Machine Learning',
  cloud: 'Cloud',
  cybersecurity: 'Cybersecurity',
  data: 'Data & Analytics',
  devops: 'DevOps',
  databases: 'Databases',
  networking: 'Networking',
  'web-dev': 'Web Development',
  'software-dev': 'Software Development',
  'project-management': 'Project Management',
  other: 'Other',
}

export const CERT_CATEGORY_DESCRIPTIONS: Record<CertCategory, string> = {
  ai: 'Artificial intelligence, machine learning, LLMs, and generative AI credentials.',
  cloud: 'AWS, Azure, GCP, and cloud infrastructure certifications.',
  cybersecurity: 'Security certifications from CompTIA, Cisco, Fortinet, and more.',
  data: 'Data science, analytics, SQL, and business intelligence credentials.',
  devops: 'Kubernetes, Docker, CI/CD, and platform engineering certifications.',
  databases: 'MongoDB, SQL, Oracle, and database management credentials.',
  networking: 'Cisco CCNA, network fundamentals, and infrastructure certifications.',
  'web-dev': 'Frontend, backend, and full-stack web development credentials.',
  'software-dev': 'General software engineering, programming, and computer science credentials.',
  'project-management': 'PMP, Agile, Scrum, and project leadership certifications.',
  other: 'Other technical and professional development credentials.',
}

// ── Category icons (Lucide icon names for dynamic import) ─────────────────────
export const CERT_CATEGORY_ICON_NAMES: Record<CertCategory, string> = {
  ai: 'BrainCircuit',
  cloud: 'Cloud',
  cybersecurity: 'ShieldCheck',
  data: 'BarChart2',
  devops: 'GitBranch',
  databases: 'Database',
  networking: 'Network',
  'web-dev': 'Globe',
  'software-dev': 'Code2',
  'project-management': 'ClipboardList',
  other: 'Layers',
}

// ── Roles ────────────────────────────────────────────────────────────────────
export const CERT_ROLES = [
  'Software Engineer',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'AI Engineer',
  'ML Engineer',
  'Data Analyst',
  'Data Scientist',
  'Data Engineer',
  'Cloud Engineer',
  'DevOps Engineer',
  'Cybersecurity',
  'QA / SQA',
  'Database Administrator',
  'Network Engineer',
  'Product Manager',
] as const
export type CertRole = (typeof CERT_ROLES)[number]

// ── Ordered list of known providers (for display order in the grid) ──────────
export const KNOWN_PROVIDERS = [
  'google',
  'aws',
  'microsoft',
  'ibm',
  'cisco',
  'meta',
  'nvidia',
  'oracle',
  'redhat',
  'comptia',
  'isc2',
  'cncf',
  'docker',
  'hashicorp',
  'github',
  'databricks',
  'mongodb',
  'freecodecamp',
  'hackerrank',
  'fortinet',
  'linux',
  'pmi',
  'scrum',
  'pythoninstitute',
  'anthropic',
  'huggingface',
  'snowflake',
  'salesforce',
  'openai',
  'deeplearningai',
  'langchain',
] as const

// ── Provider slugs (for icon/abbreviation mapping) ───────────────────────────
export const PROVIDER_ABBREVIATIONS: Record<string, string> = {
  google: 'GO',
  aws: 'AWS',
  microsoft: 'MS',
  ibm: 'IBM',
  cisco: 'CSC',
  nvidia: 'NV',
  meta: 'META',
  freecodecamp: 'FCC',
  mongodb: 'MDB',
  oracle: 'ORC',
  hackerrank: 'HR',
  cncf: 'CNCF',
  docker: 'DCK',
  github: 'GH',
  fortinet: 'FTN',
  linux: 'LF',
  coursera: 'CRS',
  anthropic: 'ANT',
  comptia: 'COMP',
  hashicorp: 'HCP',
  redhat: 'RH',
  databricks: 'DBX',
  isc2: 'ISC2',
  scrum: 'SCR',
  pmi: 'PMI',
  pythoninstitute: 'PCI',
  jetbrains: 'JB',
  atlassian: 'ATL',
  salesforce: 'SF',
  huggingface: 'HF',
  snowflake: 'SNW',
  openai: 'OAI',
  deeplearningai: 'DL',
  langchain: 'LC',
}

export function providerAbbr(slug: string): string {
  return PROVIDER_ABBREVIATIONS[slug.toLowerCase()] ?? slug.slice(0, 3).toUpperCase()
}

// ── Provider accent colors (bg / text) ───────────────────────────────────────
export const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  google: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  aws: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
  microsoft: { bg: 'bg-sky-500/15', text: 'text-sky-400' },
  ibm: { bg: 'bg-blue-600/15', text: 'text-blue-500' },
  cisco: { bg: 'bg-blue-700/15', text: 'text-blue-400' },
  nvidia: { bg: 'bg-green-500/15', text: 'text-green-400' },
  meta: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  freecodecamp: { bg: 'bg-emerald-600/15', text: 'text-emerald-400' },
  mongodb: { bg: 'bg-green-600/15', text: 'text-green-400' },
  oracle: { bg: 'bg-red-600/15', text: 'text-red-400' },
  hackerrank: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  cncf: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  docker: { bg: 'bg-sky-600/15', text: 'text-sky-400' },
  github: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  fortinet: { bg: 'bg-red-500/15', text: 'text-red-400' },
  linux: { bg: 'bg-amber-600/15', text: 'text-amber-400' },
  anthropic: { bg: 'bg-violet-600/15', text: 'text-violet-400' },
  comptia: { bg: 'bg-red-700/15', text: 'text-red-400' },
  hashicorp: { bg: 'bg-violet-500/15', text: 'text-violet-400' },
  redhat: { bg: 'bg-red-600/15', text: 'text-red-400' },
  databricks: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
  isc2: { bg: 'bg-indigo-600/15', text: 'text-indigo-400' },
  scrum: { bg: 'bg-blue-600/15', text: 'text-blue-400' },
  pmi: { bg: 'bg-purple-600/15', text: 'text-purple-400' },
  pythoninstitute: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  jetbrains: { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400' },
  atlassian: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  salesforce: { bg: 'bg-sky-500/15', text: 'text-sky-400' },
  huggingface: { bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  snowflake: { bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  openai: { bg: 'bg-emerald-600/15', text: 'text-emerald-400' },
  deeplearningai: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  langchain: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
}

export function providerColors(slug: string): { bg: string; text: string } {
  return PROVIDER_COLORS[slug.toLowerCase()] ?? { bg: 'bg-primary/10', text: 'text-primary' }
}

// ── Cost pill color ───────────────────────────────────────────────────────────
export const CERT_COST_COLORS: Record<CertCostType, { bg: string; text: string; border: string }> = {
  free: {
    bg: 'bg-emerald-500/12',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
  },
  'free-exam': {
    bg: 'bg-amber-500/12',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  'partially-free': {
    bg: 'bg-amber-500/12',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
  },
  paid: {
    bg: 'bg-rose-500/12',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
  },
}

export const CERT_PORTFOLIO_COLORS: Record<CertPortfolioValue, { bg: string; text: string }> = {
  high: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  medium: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  low: { bg: 'bg-muted/30', text: 'text-muted-foreground' },
}
