import { z } from 'zod'
import {
  BEHAVIORAL_COMPETENCY_SET,
} from '@/lib/interview-config/banks/behavioral-competencies'
import { CODING_CATEGORY_SET } from '@/lib/interview-config/banks/coding-categories'
import { HR_SECTION_SET, hrSectionLabel } from '@/lib/interview-config/banks/hr-sections'
import { SYSTEM_DESIGN_TOPIC_SET } from '@/lib/interview-config/banks/system-design-topics'
import { STORED_INTERVIEW_TYPE_KEYS } from '@/lib/interview-config/interview-types'
import { SETUP_DIFFICULTIES } from '@/lib/interview-config/difficulty'
import { SENIORITY_LEVELS } from '@/lib/interview-config/experience'
import { QUESTION_COUNT_MAX } from '@/lib/interview-config/question-counts'
import { DURATION_MAX } from '@/lib/interview-config/durations'

export const interviewSetupConfigSchema = z.object({
  // Resume information
  targetRole: z.string().trim().max(200).optional().nullable(),
  currentRole: z.string().trim().max(200).optional().nullable(),
  yearsExperience: z.number().min(0).max(60).nullable().optional(),
  seniorityLevel: z.enum(SENIORITY_LEVELS).nullable().optional(),
  domain: z.string().trim().max(120).nullable().optional(),
  education: z.string().trim().max(500).nullable().optional(),
  degree: z.string().trim().max(200).nullable().optional(),
  university: z.string().trim().max(200).nullable().optional(),
  graduationYear: z.string().trim().max(20).nullable().optional(),
  certifications: z.array(z.string().max(120)).max(20).optional().default([]),
  resumeRawText: z.string().max(80_000).optional().nullable(),

  // Skills
  programmingLanguages: z.array(z.string().max(60)).max(30).optional().default([]),
  frameworks: z.array(z.string().max(60)).max(30).optional().default([]),
  libraries: z.array(z.string().max(60)).max(30).optional().default([]),
  databases: z.array(z.string().max(60)).max(20).optional().default([]),
  cloudPlatforms: z.array(z.string().max(60)).max(20).optional().default([]),
  devOpsTools: z.array(z.string().max(60)).max(20).optional().default([]),
  operatingSystems: z.array(z.string().max(60)).max(15).optional().default([]),
  concepts: z.array(z.string().max(80)).max(30).optional().default([]),
  softSkills: z.array(z.string().max(80)).max(20).optional().default([]),
  extractedSkills: z.array(z.string().max(80)).max(40).optional().default([]),

  // Experience
  companies: z.array(z.string().max(120)).max(20).optional().default([]),
  internships: z.array(z.string().max(200)).max(15).optional().default([]),
  projects: z
    .array(
      z.object({
        name: z.string().max(200),
        description: z.string().max(800),
        technologies: z.array(z.string().max(60)).max(20).optional().default([]),
      }),
    )
    .max(12)
    .optional()
    .default([]),
  achievements: z.array(z.string().max(300)).max(20).optional().default([]),

  // User configuration
  categories: z.array(z.string().trim().min(1)).default([]),
  topics: z.array(z.string().trim().min(1)).default([]),
  codingCategories: z.array(z.string().trim().min(1)).optional().default([]),
  behavioralCompetencies: z.array(z.string().trim().min(1)).optional().default([]),
  hrSections: z.array(z.string().trim().min(1)).optional().default([]),
  systemDesignTopics: z.array(z.string().trim().min(1)).optional().default([]),
  difficulty: z.enum(SETUP_DIFFICULTIES).nullable().optional(),
  interviewType: z.enum(STORED_INTERVIEW_TYPE_KEYS).nullable().optional(),
  interviewRoundType: z
    .enum(['technical_screen', 'system_design', 'behavioral', 'managerial'])
    .nullable()
    .optional(),
  targetCompanyType: z
    .enum(['startup', 'mid_size', 'enterprise', 'faang'])
    .nullable()
    .optional(),
  preferredQuestionFormat: z
    .enum(['coding', 'scenario', 'whiteboard', 'mixed'])
    .nullable()
    .optional(),
  interviewDuration: z.number().int().positive().max(DURATION_MAX).nullable().optional(),
  numberOfQuestions: z
    .number()
    .int()
    .min(3)
    .max(QUESTION_COUNT_MAX)
    .optional()
    .default(12),
  language: z.string().trim().max(40).optional().default('English'),
  focusAreas: z.array(z.string().max(120)).max(15).optional().default([]),
  excludedTopics: z.array(z.string().max(120)).max(30).optional().default([]),

  resumeParsedFields: z.array(z.string()).optional().default([]),
  manuallyFilledFields: z.array(z.string()).optional().default([]),
})

export type InterviewSetupConfig = z.infer<typeof interviewSetupConfigSchema>

export type ConfigValidationIssue = { field: string; message: string }

export function resolveSetupSelection(config: InterviewSetupConfig): string[] {
  const type = config.interviewType
  const excluded = new Set(config.excludedTopics || [])
  if (type === 'coding') {
    return (config.codingCategories?.length ? config.codingCategories : config.topics).filter(
      (t) => CODING_CATEGORY_SET.has(t) && !excluded.has(t),
    )
  }
  if (type === 'behavioral') {
    return (
      config.behavioralCompetencies?.length ? config.behavioralCompetencies : config.topics
    ).filter((t) => BEHAVIORAL_COMPETENCY_SET.has(t) && !excluded.has(t))
  }
  if (type === 'hr') {
    return (config.hrSections ?? [])
      .filter((k) => HR_SECTION_SET.has(k) && !excluded.has(k))
      .map((k) => hrSectionLabel(k))
  }
  if (type === 'system_design') {
    return (
      config.systemDesignTopics?.length ? config.systemDesignTopics : config.topics
    ).filter((t) => SYSTEM_DESIGN_TOPIC_SET.has(t) && !excluded.has(t))
  }
  // technical / mixed / legacy: use topics as confirmed labels
  return config.topics.filter((t) => !excluded.has(t))
}

export function validateInterviewSetupForGenerate(
  config: InterviewSetupConfig,
): ConfigValidationIssue[] {
  const issues: ConfigValidationIssue[] = []

  if (!config.targetRole?.trim() && !config.currentRole?.trim()) {
    issues.push({ field: 'targetRole', message: 'Role is required' })
  }
  if (config.yearsExperience == null && !config.seniorityLevel) {
    issues.push({ field: 'yearsExperience', message: 'Experience or seniority is required' })
  }
  if (!config.interviewType && !config.interviewRoundType) {
    issues.push({ field: 'interviewType', message: 'Select an interview type' })
  }
  if (!config.difficulty) {
    issues.push({ field: 'difficulty', message: 'Select a difficulty' })
  }

  const selected = resolveSetupSelection(config)
  if (selected.length < 1) {
    issues.push({
      field: 'topics',
      message: 'Select at least one option for this interview type',
    })
  }

  return issues
}

export function effectiveTopics(config: InterviewSetupConfig): string[] {
  return resolveSetupSelection(config)
}
