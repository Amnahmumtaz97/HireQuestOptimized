import {
  INTERVIEW_TAXONOMY,
  TAXONOMY_TOPIC_SET,
  type TaxonomyCategory,
} from '@/lib/interview-taxonomy/taxonomy'

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9.+#]+/g, ' ').trim()
}

/** Aliases from common resume spellings → taxonomy topic labels */
const ALIASES: Record<string, string> = {
  reactjs: 'React',
  react: 'React',
  'react.js': 'React',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  next: 'Next.js',
  node: 'Node.js',
  nodejs: 'Node.js',
  'node.js': 'Node.js',
  expressjs: 'Express',
  express: 'Express',
  typescript: 'TypeScript',
  ts: 'TypeScript',
  javascript: 'JavaScript',
  js: 'JavaScript',
  html5: 'HTML',
  html: 'HTML',
  css3: 'CSS',
  css: 'CSS',
  tailwindcss: 'Tailwind',
  tailwind: 'Tailwind',
  mongodb: 'MongoDB',
  mongo: 'MongoDB',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mysql: 'MySQL',
  redis: 'Redis',
  sql: 'SQL',
  docker: 'Docker',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  'google cloud': 'GCP',
  jwt: 'JWT',
  oauth: 'OAuth',
  oauth2: 'OAuth',
  rest: 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  websocket: 'WebSockets',
  websockets: 'WebSockets',
  django: 'Django',
  fastapi: 'FastAPI',
  'spring boot': 'Spring Boot',
  springboot: 'Spring Boot',
  llm: 'LLMs',
  llms: 'LLMs',
  'machine learning': 'Machine Learning',
  ml: 'Machine Learning',
  'deep learning': 'Deep Learning',
  cicd: 'CI/CD',
  'ci/cd': 'CI/CD',
  devops: 'CI/CD',
  authentication: 'Authentication',
  authorization: 'Authorization',
  microservices: 'Microservices',
  caching: 'Caching',
  arrays: 'Arrays',
  graphs: 'Graphs',
  trees: 'Trees',
  dp: 'Dynamic Programming',
  'dynamic programming': 'Dynamic Programming',
}

export type SkillTaxonomyMatch = {
  topics: string[]
  categories: string[]
  /** topic → matched skill strings */
  topicSources: Record<string, string[]>
}

export function mapSkillsToTaxonomyTopics(skills: string[]): SkillTaxonomyMatch {
  const topicSources: Record<string, string[]> = {}
  const topics = new Set<string>()

  for (const raw of skills) {
    const n = norm(raw)
    if (!n) continue

    const aliasHit = ALIASES[n]
    if (aliasHit && TAXONOMY_TOPIC_SET.has(aliasHit)) {
      topics.add(aliasHit)
      topicSources[aliasHit] = [...(topicSources[aliasHit] || []), raw]
      continue
    }

    for (const topic of TAXONOMY_TOPIC_SET) {
      const tn = norm(topic)
      if (n === tn || n.includes(tn) || tn.includes(n)) {
        topics.add(topic)
        topicSources[topic] = [...(topicSources[topic] || []), raw]
      }
    }
  }

  const categories = INTERVIEW_TAXONOMY.filter((c) =>
    c.topics.some((t) => topics.has(t)),
  ).map((c) => c.key)

  return {
    topics: [...topics],
    categories,
    topicSources,
  }
}

export function categoriesContainingTopics(selectedTopics: string[]): TaxonomyCategory[] {
  const set = new Set(selectedTopics)
  return INTERVIEW_TAXONOMY.filter((c) => c.topics.some((t) => set.has(t)))
}
