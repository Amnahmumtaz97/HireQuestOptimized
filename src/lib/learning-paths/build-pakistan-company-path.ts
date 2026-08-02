import type { PakistanCompanyPack } from '@/lib/learning-paths/pakistan-tech-companies'
import { NON_CATALOG_SCOPE } from '@/lib/interview-config/type-config'

export type SeedStage = {
  order: number
  level: number
  title: string
  type: 'concept' | 'practice' | 'mock_interview' | 'ai_feedback'
  contentRef: string
  unlockMinScore: number | null
  departmentKey?: string
  specializationKeys?: string[]
  interviewType?: string
  difficulty?: string
  suggestedTopics?: string[]
  totalQuestions?: number
  technicalQuestionRatio?: number
}

/**
 * Full Pakistan computer-tech company loop:
 * concept → HR → coding → technical → SD/scale → behavioral → mixed mock → AI feedback
 */
export function buildPakistanCompanyStages(pack: PakistanCompanyPack): SeedStage[] {
  const nonCatalogDept = NON_CATALOG_SCOPE.departmentKey
  const nonCatalogSpec = [NON_CATALOG_SCOPE.specializationKey]
  const codingDiff =
    pack.archetype === 'services' ? 'Medium' : pack.archetype === 'product' ? 'Hard' : 'Hard'
  const designType = pack.useSystemDesignType ? 'system_design' : 'technical'
  const designDept = pack.useSystemDesignType ? nonCatalogDept : pack.departmentKey
  const designSpecs = pack.useSystemDesignType ? nonCatalogSpec : pack.specializationKeys
  const designTopics = pack.useSystemDesignType
    ? pack.systemDesignTopics
    : [...pack.technicalTopics.slice(0, 3), ...pack.systemDesignTopics]

  const mockTopics = [
    ...new Set([
      ...pack.codingCategories.slice(0, 3),
      ...pack.technicalTopics.slice(0, 4),
      ...pack.systemDesignTopics.slice(0, 3),
      ...pack.behavioralCompetencies.slice(0, 3),
      ...pack.hrSectionLabels.slice(0, 2),
    ]),
  ]

  let order = 1
  const stages: SeedStage[] = [
    {
      order: order++,
      level: 1,
      title: 'Company briefing',
      type: 'concept',
      contentRef: `${pack.title} (${pack.cities}). Stacks: ${pack.stacks.join(', ')}. ${pack.cultureNotes} Complete HR → coding → technical → design → behavioral → company mock.`,
      unlockMinScore: null,
    },
    {
      order: order++,
      level: 2,
      title: 'HR screening',
      type: 'practice',
      contentRef: `Screening HR for ${pack.title}: introduction, motivation, logistics, and salary norms common in Pakistan tech hiring.`,
      unlockMinScore: null,
      departmentKey: nonCatalogDept,
      specializationKeys: nonCatalogSpec,
      interviewType: 'hr',
      difficulty: 'Easy',
      suggestedTopics: pack.hrSectionLabels,
      totalQuestions: 8,
      technicalQuestionRatio: 0,
    },
    {
      order: order++,
      level: 2,
      title: 'Coding round',
      type: 'practice',
      contentRef: `DSA coding practice for ${pack.title}: ${pack.codingCategories.join(', ')}.`,
      unlockMinScore: null,
      departmentKey: nonCatalogDept,
      specializationKeys: nonCatalogSpec,
      interviewType: 'coding',
      difficulty: codingDiff,
      suggestedTopics: pack.codingCategories,
      totalQuestions: 10,
      technicalQuestionRatio: 100,
    },
    {
      order: order++,
      level: 3,
      title: 'Role technical',
      type: 'practice',
      contentRef: `Role-depth technical for ${pack.title}: ${pack.technicalTopics.join(', ')}.`,
      unlockMinScore: null,
      departmentKey: pack.departmentKey,
      specializationKeys: pack.specializationKeys,
      interviewType: 'technical',
      difficulty: 'Medium',
      suggestedTopics: pack.technicalTopics,
      totalQuestions: 12,
      technicalQuestionRatio: 100,
    },
    {
      order: order++,
      level: 4,
      title: pack.useSystemDesignType ? 'System design' : 'Product & scale',
      type: 'practice',
      contentRef: pack.useSystemDesignType
        ? `System design topics for ${pack.title}: ${pack.systemDesignTopics.join(', ')}.`
        : `Scale and architecture scenarios for ${pack.title}: ${designTopics.join(', ')}.`,
      unlockMinScore: null,
      departmentKey: designDept,
      specializationKeys: designSpecs,
      interviewType: designType,
      difficulty: 'Hard',
      suggestedTopics: designTopics,
      totalQuestions: 10,
      technicalQuestionRatio: 100,
    },
    {
      order: order++,
      level: 5,
      title: 'Behavioral round',
      type: 'practice',
      contentRef: `STAR behavioral for ${pack.title}: ${pack.behavioralCompetencies.join(', ')}.`,
      unlockMinScore: null,
      departmentKey: nonCatalogDept,
      specializationKeys: nonCatalogSpec,
      interviewType: 'behavioral',
      difficulty: 'Medium',
      suggestedTopics: pack.behavioralCompetencies,
      totalQuestions: 10,
      technicalQuestionRatio: 0,
    },
    {
      order: order++,
      level: 6,
      title: `${pack.title} mock day`,
      type: 'mock_interview',
      contentRef: `Company-weighted mock for ${pack.title}. Score ≥ ${pack.mockUnlock} to finish. Covers coding, technical, design, behavioral, and HR.`,
      unlockMinScore: pack.mockUnlock,
      departmentKey: pack.departmentKey,
      specializationKeys: pack.specializationKeys,
      interviewType: 'mixed',
      difficulty: 'Hard',
      suggestedTopics: mockTopics,
      totalQuestions: 15,
      technicalQuestionRatio: pack.mockTechRatio,
    },
    {
      order: order++,
      level: 6,
      title: 'AI feedback',
      type: 'ai_feedback',
      contentRef:
        'Review dimension scores, weak topics, and improvement notes from your company mock.',
      unlockMinScore: null,
    },
  ]

  return stages
}

export function pakistanCompanyPathMeta(pack: PakistanCompanyPack) {
  const stages = buildPakistanCompanyStages(pack)
  const interviewCount = stages.filter(
    (s) => s.type === 'practice' || s.type === 'mock_interview',
  ).length
  const per =
    pack.difficultyLabel === 'Beginner' ? 25 : pack.difficultyLabel === 'Advanced' ? 35 : 30
  return {
    slug: pack.slug,
    title: pack.title,
    description: `Pakistan tech prep for ${pack.title}: HR, coding, role technical, design/scale, behavioral, and a company mock (${pack.archetype}).`,
    targetAudience: 'domain:company',
    category: 'company' as const,
    subcategory: 'pakistan',
    tags: ['company', 'pakistan', 'regional', 'computer-tech', 'top-30', pack.archetype, pack.slug],
    difficultyLabel: pack.difficultyLabel,
    estimatedMinutes: interviewCount * per + 20,
    isFeatured: pack.archetype === 'product' || pack.archetype === 'deep_tech',
    stages,
  }
}
