import { defaultInterviewConfigSeed } from '@/lib/interview-config'
import type { DepartmentConfig, SpecializationConfig } from '@/lib/interview-catalog/types'
import { DEFAULT_HR_TOPICS, DEFAULT_INTERVIEW_TYPES } from '@/lib/interview-catalog/hr-topics'

const DEFAULT_BEHAVIORAL = [
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Ownership',
  'Handling Pressure',
]

function baseSpec(
  key: string,
  label: string,
  technicalTopics: string[],
  technicalQuestionRatio = 80,
): SpecializationConfig {
  return {
    key,
    label,
    interviewTypes: [...DEFAULT_INTERVIEW_TYPES],
    technicalTopics,
    behavioralTopics: [...DEFAULT_BEHAVIORAL],
    hrTopics: [...DEFAULT_HR_TOPICS],
    technicalQuestionRatio,
    durationEnabled: true,
    durations: [20, 30, 45, 60],
  }
}

function mergeSpec(
  map: Map<string, SpecializationConfig>,
  specKey: string,
  specLabel: string,
  role: {
    technicalTopics: string[]
    behavioralTopics: string[]
    technicalQuestionRatio: number
    durationEnabled: boolean
    durations: number[]
  },
): void {
  const existing = map.get(specKey)
  if (!existing) {
    map.set(specKey, {
      key: specKey,
      label: specLabel,
      interviewTypes: [...DEFAULT_INTERVIEW_TYPES],
      technicalTopics: [...new Set(role.technicalTopics)],
      behavioralTopics: [...new Set(role.behavioralTopics.length ? role.behavioralTopics : DEFAULT_BEHAVIORAL)],
      hrTopics: [...DEFAULT_HR_TOPICS],
      technicalQuestionRatio: role.technicalQuestionRatio,
      durationEnabled: role.durationEnabled,
      durations: role.durations,
    })
    return
  }

  map.set(specKey, {
    ...existing,
    interviewTypes: existing.interviewTypes?.length
      ? existing.interviewTypes
      : [...DEFAULT_INTERVIEW_TYPES],
    technicalTopics: [...new Set([...existing.technicalTopics, ...role.technicalTopics])],
    behavioralTopics: [
      ...new Set([...existing.behavioralTopics, ...(role.behavioralTopics.length ? role.behavioralTopics : DEFAULT_BEHAVIORAL)]),
    ],
    hrTopics: existing.hrTopics?.length ? existing.hrTopics : [...DEFAULT_HR_TOPICS],
    technicalQuestionRatio: Math.round(
      (existing.technicalQuestionRatio + role.technicalQuestionRatio) / 2,
    ),
    durationEnabled: existing.durationEnabled || role.durationEnabled,
    durations: [...new Set([...existing.durations, ...role.durations])].sort((a, b) => a - b),
  })
}

/** Maps legacy flat "industry" documents into CS department specializations. */
const LEGACY_INDUSTRY_TO_SPEC: Record<string, { key: string; label: string }> = {
  computer_science_core: { key: 'cs_core', label: 'Computer Science Core' },
  systems_networking: { key: 'networking', label: 'Networking' },
  databases_backend: { key: 'cs_core', label: 'Computer Science Core' },
  software_it: { key: 'web_development', label: 'Web Development' },
  mobile_development: { key: 'mobile_development', label: 'Mobile Development' },
  cybersecurity: { key: 'cybersecurity', label: 'Cybersecurity' },
  data_ai: { key: 'data_science', label: 'Data Science' },
  product: { key: 'software_engineering', label: 'Software Engineering' },
}

const DATA_AI_ROLE_SPEC: Record<string, { key: string; label: string }> = {
  analytics: { key: 'data_science', label: 'Data Science' },
  data_science_ml: { key: 'artificial_intelligence', label: 'Artificial Intelligence' },
}

const EXTRA_CS_SPECS: SpecializationConfig[] = [
  baseSpec('cs_core', 'Computer Science Core', [
    'OOP',
    'DSA',
    'Database Systems',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Compiler Design',
    'Theory of Computation',
  ], 85),
  baseSpec('dsa', 'Data Structures & Algorithms', [
    'Arrays',
    'Strings',
    'Linked Lists',
    'Stacks & Queues',
    'Hashing',
    'Trees',
    'BST',
    'Heaps',
    'Graphs',
    'Sorting',
    'Searching',
    'Dynamic Programming',
    'Greedy',
    'Backtracking',
    'Complexity Analysis',
  ], 90),
  baseSpec('algorithms', 'Algorithms', [
    'Divide & Conquer',
    'Dynamic Programming',
    'Greedy',
    'Graph Algorithms',
    'String Algorithms',
    'Number Theory Basics',
  ], 90),
  baseSpec('operating_systems', 'Operating Systems', [
    'Processes',
    'Threads',
    'Synchronization',
    'Deadlocks',
    'Memory Management',
    'Virtual Memory',
    'Scheduling',
    'File Systems',
  ]),
  baseSpec('computer_networks', 'Computer Networks', [
    'OSI/TCP-IP',
    'Routing',
    'Congestion Control',
    'DNS',
    'HTTP/HTTPS',
    'Sockets',
    'CDN Basics',
  ]),
  baseSpec('dbms', 'Database Management Systems', [
    'ER Modeling',
    'Normalization',
    'SQL',
    'Transactions',
    'ACID',
    'Indexing',
    'Concurrency Control',
    'Query Optimization',
  ]),
  baseSpec('compilers', 'Compilers', [
    'Lexical Analysis',
    'Parsing',
    'Semantic Analysis',
    'IR',
    'Code Generation',
    'Optimization',
  ]),
  baseSpec('toc', 'Theory of Computation', [
    'Automata',
    'Regular Languages',
    'CFG',
    'Turing Machines',
    'Decidability',
    'Complexity Classes',
  ]),
  baseSpec('discrete_math', 'Discrete Mathematics', [
    'Logic',
    'Sets',
    'Relations',
    'Graph Theory',
    'Combinatorics',
    'Proof Techniques',
  ]),
  baseSpec('computer_architecture', 'Computer Architecture', [
    'CPU Pipelines',
    'Caches',
    'Memory Hierarchy',
    'Instruction Sets',
    'Parallelism',
  ]),
  baseSpec('distributed_systems', 'Distributed Systems', [
    'Consistency',
    'Consensus',
    'Replication',
    'Partitioning',
    'CAP Theorem',
    'Fault Tolerance',
  ]),
  baseSpec('parallel_computing', 'Parallel Computing', [
    'Shared Memory',
    'Message Passing',
    'GPU Basics',
    'Race Conditions',
    'Speedup/Amdahl',
  ]),
  baseSpec('software_engineering', 'Software Engineering', [
    'SDLC',
    'Requirements',
    'Design Patterns',
    'Testing',
    'Version Control',
    'Code Review',
  ]),
  baseSpec('web_development', 'Web Development', [
    'HTML/CSS',
    'JavaScript',
    'REST',
    'Auth',
    'Browser APIs',
    'Performance',
  ]),
  baseSpec('artificial_intelligence', 'Artificial Intelligence', [
    'Search',
    'Knowledge Representation',
    'ML Basics',
    'Neural Nets',
    'Ethics',
  ]),
  baseSpec('data_science', 'Data Science', [
    'Statistics',
    'SQL',
    'Pandas',
    'Visualization',
    'ML Pipelines',
  ]),
  baseSpec('cybersecurity', 'Cybersecurity', [
    'CIA Triad',
    'AuthN/AuthZ',
    'Cryptography Basics',
    'Network Security',
    'OWASP',
  ]),
  baseSpec('cloud_computing', 'Cloud Computing', [
    'AWS',
    'Azure',
    'GCP',
    'Docker',
    'Kubernetes',
    'Serverless',
    'CI/CD',
  ]),
  baseSpec('networking', 'Networking', [
    'TCP/IP',
    'Routing',
    'Switching',
    'DNS',
    'Firewalls',
    'VPN',
  ]),
  baseSpec('mobile_development', 'Mobile Development', [
    'Android',
    'iOS',
    'APIs',
    'Offline Sync',
    'App Distribution',
  ]),
]

export function buildComputerScienceDepartmentFromLegacy(): DepartmentConfig {
  const specMap = new Map<string, SpecializationConfig>()

  for (const legacyIndustry of defaultInterviewConfigSeed) {
    const mapping = LEGACY_INDUSTRY_TO_SPEC[legacyIndustry.industryKey]
    if (!mapping) continue

    for (const role of legacyIndustry.roleCategories) {
      let target = mapping
      if (legacyIndustry.industryKey === 'data_ai') {
        target = DATA_AI_ROLE_SPEC[role.key] ?? mapping
      }

      mergeSpec(specMap, target.key, target.label, role)
    }
  }

  for (const extra of EXTRA_CS_SPECS) {
    const existing = specMap.get(extra.key)
    if (!existing) {
      specMap.set(extra.key, extra)
      continue
    }
    specMap.set(extra.key, {
      ...existing,
      interviewTypes: existing.interviewTypes?.length
        ? existing.interviewTypes
        : [...DEFAULT_INTERVIEW_TYPES],
      technicalTopics: [...new Set([...extra.technicalTopics, ...existing.technicalTopics])],
      behavioralTopics: [
        ...new Set([...existing.behavioralTopics, ...extra.behavioralTopics]),
      ],
      hrTopics: existing.hrTopics?.length ? existing.hrTopics : [...DEFAULT_HR_TOPICS],
    })
  }

  const order = [
    'cs_core',
    'dsa',
    'algorithms',
    'operating_systems',
    'computer_networks',
    'dbms',
    'compilers',
    'toc',
    'discrete_math',
    'computer_architecture',
    'distributed_systems',
    'parallel_computing',
    'software_engineering',
    'web_development',
    'artificial_intelligence',
    'data_science',
    'cybersecurity',
    'cloud_computing',
    'networking',
    'mobile_development',
  ]

  const specializations = order
    .map((key) => specMap.get(key))
    .filter((item): item is SpecializationConfig => Boolean(item))

  for (const entry of specMap.values()) {
    if (!specializations.some((s) => s.key === entry.key)) {
      specializations.push(entry)
    }
  }

  return {
    key: 'computer_science',
    label: 'Computer Science',
    specializations,
  }
}
