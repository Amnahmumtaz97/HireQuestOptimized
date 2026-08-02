/**
 * Central Technical / Non-Technical interview taxonomy.
 * Resume configure UI and generation may ONLY use topics from this file.
 */

export type TaxonomyTrack = 'technical' | 'non_technical'

export type TaxonomyCategory = {
  key: string
  label: string
  track: TaxonomyTrack
  topics: string[]
}

export const INTERVIEW_TAXONOMY: TaxonomyCategory[] = [
  // —— Technical ——
  {
    key: 'dsa',
    label: 'Data Structures & Algorithms',
    track: 'technical',
    topics: [
      'Arrays',
      'Strings',
      'Linked Lists',
      'Trees',
      'Graphs',
      'Dynamic Programming',
      'Recursion',
      'Searching',
      'Sorting',
    ],
  },
  {
    key: 'system_design',
    label: 'System Design',
    track: 'technical',
    topics: [
      'Scalability',
      'Load Balancing',
      'Caching',
      'Database Design',
      'Message Queues',
      'Rate Limiting',
      'CAP Theorem',
      'Microservices',
    ],
  },
  {
    key: 'design_patterns',
    label: 'Design Patterns',
    track: 'technical',
    topics: ['Creational', 'Structural', 'Behavioral'],
  },
  {
    key: 'frontend',
    label: 'Frontend',
    track: 'technical',
    topics: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind'],
  },
  {
    key: 'backend',
    label: 'Backend',
    track: 'technical',
    topics: ['Node.js', 'Express', 'FastAPI', 'Django', 'Spring Boot'],
  },
  {
    key: 'databases',
    label: 'Databases',
    track: 'technical',
    topics: [
      'SQL',
      'MySQL',
      'PostgreSQL',
      'MongoDB',
      'Redis',
      'Indexing',
      'Transactions',
      'Normalization',
    ],
  },
  {
    key: 'devops_cloud',
    label: 'DevOps & Cloud',
    track: 'technical',
    topics: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD'],
  },
  {
    key: 'operating_systems',
    label: 'Operating Systems',
    track: 'technical',
    topics: ['Processes', 'Threads', 'Memory Management', 'Deadlocks'],
  },
  {
    key: 'networking',
    label: 'Networking',
    track: 'technical',
    topics: ['HTTP', 'HTTPS', 'TCP/IP', 'DNS', 'REST APIs', 'WebSockets'],
  },
  {
    key: 'security',
    label: 'Security',
    track: 'technical',
    topics: ['Authentication', 'Authorization', 'JWT', 'OAuth', 'OWASP'],
  },
  {
    key: 'ai_ml',
    label: 'AI / ML',
    track: 'technical',
    topics: ['Machine Learning', 'Deep Learning', 'LLMs', 'Prompt Engineering'],
  },
  // —— Non-Technical ——
  {
    key: 'behavioral',
    label: 'Behavioral',
    track: 'non_technical',
    topics: ['Behavioral'],
  },
  {
    key: 'hr',
    label: 'Screening HR',
    track: 'non_technical',
    topics: ['HR'],
  },
  {
    key: 'leadership',
    label: 'Leadership',
    track: 'non_technical',
    topics: ['Leadership'],
  },
  {
    key: 'teamwork',
    label: 'Teamwork',
    track: 'non_technical',
    topics: ['Teamwork'],
  },
  {
    key: 'communication',
    label: 'Communication',
    track: 'non_technical',
    topics: ['Communication'],
  },
  {
    key: 'conflict_resolution',
    label: 'Conflict Resolution',
    track: 'non_technical',
    topics: ['Conflict Resolution'],
  },
  {
    key: 'situational_judgment',
    label: 'Situational Judgment',
    track: 'non_technical',
    topics: ['Situational Judgment'],
  },
  {
    key: 'resume_discussion',
    label: 'Resume Discussion',
    track: 'non_technical',
    topics: ['Resume Discussion'],
  },
  {
    key: 'project_discussion',
    label: 'Project Discussion',
    track: 'non_technical',
    topics: ['Project Discussion'],
  },
  {
    key: 'career_goals',
    label: 'Career Goals',
    track: 'non_technical',
    topics: ['Career Goals'],
  },
]

export const ALL_TAXONOMY_TOPICS: string[] = [
  ...new Set(INTERVIEW_TAXONOMY.flatMap((c) => c.topics)),
]

export const TAXONOMY_TOPIC_SET = new Set(ALL_TAXONOMY_TOPICS)

export function getCategoryForTopic(topic: string): TaxonomyCategory | undefined {
  return INTERVIEW_TAXONOMY.find((c) => c.topics.includes(topic))
}

export function topicsInTrack(track: TaxonomyTrack): string[] {
  return INTERVIEW_TAXONOMY.filter((c) => c.track === track).flatMap((c) => c.topics)
}

export function categoriesForTrack(track: TaxonomyTrack): TaxonomyCategory[] {
  return INTERVIEW_TAXONOMY.filter((c) => c.track === track)
}
