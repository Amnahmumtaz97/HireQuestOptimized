import { z } from 'zod'
import { TAXONOMY_TOPIC_SET } from '@/lib/interview-taxonomy/taxonomy'

export const interviewSetupConfigSchema = z.object({
  // Resume information
  targetRole: z.string().trim().max(200).optional().nullable(),
  currentRole: z.string().trim().max(200).optional().nullable(),
  yearsExperience: z.number().min(0).max(60).nullable().optional(),
  seniorityLevel: z.enum(['junior', 'mid', 'senior']).nullable().optional(),
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

  // User configuration (required for generate)
  categories: z.array(z.string().trim().min(1)).default([]),
  topics: z.array(z.string().trim().min(1)).default([]),
  difficulty: z.enum(['Easy', 'Medium', 'Hard', 'Mixed']).nullable().optional(),
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
  interviewDuration: z.number().int().positive().max(180).nullable().optional(),
  numberOfQuestions: z.number().int().min(3).max(40).optional().default(12),
  language: z.string().trim().max(40).optional().default('English'),
  focusAreas: z.array(z.string().max(120)).max(15).optional().default([]),
  excludedTopics: z.array(z.string().max(120)).max(30).optional().default([]),

  // Tracking
  resumeParsedFields: z.array(z.string()).optional().default([]),
  manuallyFilledFields: z.array(z.string()).optional().default([]),
})

export type InterviewSetupConfig = z.infer<typeof interviewSetupConfigSchema>

export type ConfigValidationIssue = { field: string; message: string }

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
  if (!config.categories.length) {
    issues.push({ field: 'categories', message: 'Select at least one category' })
  }
  if (config.topics.length < 3) {
    issues.push({ field: 'topics', message: 'Select at least three topics' })
  }
  if (!config.difficulty) {
    issues.push({ field: 'difficulty', message: 'Select a difficulty' })
  }
  if (!config.interviewRoundType) {
    issues.push({ field: 'interviewRoundType', message: 'Select an interview round' })
  }

  const invalidTopics = config.topics.filter((t) => !TAXONOMY_TOPIC_SET.has(t))
  if (invalidTopics.length > 0) {
    issues.push({
      field: 'topics',
      message: `Topics outside taxonomy: ${invalidTopics.slice(0, 5).join(', ')}`,
    })
  }

  const excluded = new Set(config.excludedTopics || [])
  const effective = config.topics.filter((t) => !excluded.has(t))
  if (effective.length < 3) {
    issues.push({
      field: 'excludedTopics',
      message: 'After exclusions, at least three topics must remain',
    })
  }

  return issues
}

export function effectiveTopics(config: InterviewSetupConfig): string[] {
  const excluded = new Set(config.excludedTopics || [])
  return config.topics.filter((t) => TAXONOMY_TOPIC_SET.has(t) && !excluded.has(t))
}
