import type { ResumeParseResult } from '@/lib/resume/schema'
import type { InterviewSetupConfig } from '@/lib/interview-config/setup-types'
import { mapSkillsToTaxonomyTopics } from '@/lib/interview-taxonomy/map-resume-skills'
import { categoriesContainingTopics } from '@/lib/interview-taxonomy/map-resume-skills'

function markFilled(fields: string[], key: string, value: unknown) {
  if (value == null) return
  if (typeof value === 'string' && !value.trim()) return
  if (Array.isArray(value) && value.length === 0) return
  if (!fields.includes(key)) fields.push(key)
}

/** Build InterviewSetupConfig from a parsed resume — does NOT generate questions. */
export function buildSetupFromResume(resume: ResumeParseResult): InterviewSetupConfig {
  const skills = resume.skills || []
  const techFromProjects = (resume.projects || []).flatMap((p) => p.technologies || [])
  const allSkills = [...new Set([...skills, ...techFromProjects])]
  const mapped = mapSkillsToTaxonomyTopics(allSkills)
  const cats = categoriesContainingTopics(mapped.topics)

  const resumeParsedFields: string[] = []
  markFilled(resumeParsedFields, 'targetRole', resume.domain)
  markFilled(resumeParsedFields, 'yearsExperience', resume.yearsExperience)
  markFilled(resumeParsedFields, 'seniorityLevel', resume.seniorityLevel)
  markFilled(resumeParsedFields, 'domain', resume.domain)
  markFilled(resumeParsedFields, 'extractedSkills', skills)
  markFilled(resumeParsedFields, 'projects', resume.projects)
  markFilled(resumeParsedFields, 'education', resume.education)

  const edu0 = resume.education?.[0]
  const degree = edu0?.degree || null
  const university = edu0?.institution || null
  markFilled(resumeParsedFields, 'degree', degree)
  markFilled(resumeParsedFields, 'university', university)

  if (mapped.topics.length) {
    resumeParsedFields.push('topics', 'categories')
  }

  let difficulty: InterviewSetupConfig['difficulty'] = null
  if (resume.seniorityLevel === 'junior') difficulty = 'Easy'
  else if (resume.seniorityLevel === 'mid') difficulty = 'Medium'
  else if (resume.seniorityLevel === 'senior') difficulty = 'Hard'
  if (difficulty) resumeParsedFields.push('difficulty')

  return {
    targetRole: resume.domain || null,
    currentRole: null,
    yearsExperience: resume.yearsExperience ?? null,
    seniorityLevel: resume.seniorityLevel ?? null,
    domain: resume.domain ?? null,
    education: edu0 ? `${edu0.degree || ''} @ ${edu0.institution || ''}`.trim() : null,
    degree,
    university,
    graduationYear: null,
    certifications: [],
    resumeRawText: null,
    programmingLanguages: [],
    frameworks: [],
    libraries: [],
    databases: [],
    cloudPlatforms: [],
    devOpsTools: [],
    operatingSystems: [],
    concepts: [],
    softSkills: [],
    extractedSkills: allSkills,
    companies: [],
    internships: [],
    projects: (resume.projects || []).map((p) => ({
      name: p.name,
      description: p.description,
      technologies: p.technologies || [],
    })),
    achievements: [],
    categories: cats.map((c) => c.key),
    topics: mapped.topics,
    difficulty,
    interviewRoundType: null,
    targetCompanyType: null,
    preferredQuestionFormat: null,
    interviewDuration: 30,
    numberOfQuestions: 12,
    language: 'English',
    focusAreas: [],
    excludedTopics: [],
    resumeParsedFields,
    manuallyFilledFields: [],
  }
}
