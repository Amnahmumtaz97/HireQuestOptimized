import { defaultInterviewConfigSeed } from '@/lib/interview-config'
import type { DepartmentConfig, SpecializationConfig } from '@/lib/interview-catalog/types'

const DEFAULT_BEHAVIORAL = [
  'Communication',
  'Teamwork',
  'Problem Solving',
  'Ownership',
  'Handling Pressure',
]

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
      technicalTopics: [...new Set(role.technicalTopics)],
      behavioralTopics: [...new Set(role.behavioralTopics.length ? role.behavioralTopics : DEFAULT_BEHAVIORAL)],
      technicalQuestionRatio: role.technicalQuestionRatio,
      durationEnabled: role.durationEnabled,
      durations: role.durations,
    })
    return
  }

  map.set(specKey, {
    ...existing,
    technicalTopics: [...new Set([...existing.technicalTopics, ...role.technicalTopics])],
    behavioralTopics: [
      ...new Set([...existing.behavioralTopics, ...(role.behavioralTopics.length ? role.behavioralTopics : DEFAULT_BEHAVIORAL)]),
    ],
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

  // Ensure canonical CS Core topics from product requirements are present.
  const csCore = specMap.get('cs_core')
  const coreTopics = [
    'OOP',
    'DSA',
    'Database Systems',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Compiler Design',
    'Theory of Computation',
    ...(csCore?.technicalTopics ?? []),
  ]
  specMap.set('cs_core', {
    key: 'cs_core',
    label: 'Computer Science Core',
    technicalTopics: [...new Set(coreTopics)],
    behavioralTopics: csCore?.behavioralTopics ?? DEFAULT_BEHAVIORAL,
    technicalQuestionRatio: csCore?.technicalQuestionRatio ?? 85,
    durationEnabled: csCore?.durationEnabled ?? true,
    durations: csCore?.durations ?? [20, 30, 45, 60],
  })

  // Explicit CS specializations not fully covered by legacy seed.
  if (!specMap.has('cloud_computing')) {
    specMap.set('cloud_computing', {
      key: 'cloud_computing',
      label: 'Cloud Computing',
      technicalTopics: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Serverless', 'CI/CD'],
      behavioralTopics: DEFAULT_BEHAVIORAL,
      technicalQuestionRatio: 75,
      durationEnabled: true,
      durations: [30, 45, 60],
    })
  }

  const order = [
    'cs_core',
    'artificial_intelligence',
    'data_science',
    'cybersecurity',
    'cloud_computing',
    'networking',
    'mobile_development',
    'web_development',
    'software_engineering',
  ]

  const specializations = order
    .map((key) => specMap.get(key))
    .filter((item): item is SpecializationConfig => Boolean(item))

  for (const spec of specMap.values()) {
    if (!specializations.some((entry) => entry.key === spec.key)) {
      specializations.push(spec)
    }
  }

  return {
    key: 'computer_science',
    label: 'Computer Science',
    specializations,
  }
}
