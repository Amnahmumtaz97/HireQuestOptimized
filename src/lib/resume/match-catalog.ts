import type { ResumeParseResult } from '@/lib/resume/schema'

export type CatalogDepartmentLite = {
  key: string
  label: string
  specializations?: Array<{
    key: string
    label: string
    technicalTopics?: string[]
    behavioralTopics?: string[]
    hrTopics?: string[]
  }>
}

export type ResumeCatalogMatch = {
  departmentKey: string | null
  specializationKeys: string[]
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard' | null
  interviewType: 'technical' | 'behavioral' | 'both'
}

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

function scoreLabelMatch(haystack: string, needle: string): number {
  const a = norm(haystack)
  const b = norm(needle)
  if (!a || !b) return 0
  if (a === b) return 100
  if (a.includes(b) || b.includes(a)) return 70
  const aTokens = new Set(a.split(' ').filter(Boolean))
  const bTokens = b.split(' ').filter(Boolean)
  const hits = bTokens.filter((t) => aTokens.has(t) || [...aTokens].some((x) => x.includes(t) || t.includes(x)))
  return hits.length * 15
}

/** Map parsed resume fields onto catalog department / topics. */
export function matchResumeToCatalog(
  resume: ResumeParseResult,
  departments: CatalogDepartmentLite[],
): ResumeCatalogMatch {
  let bestDept: CatalogDepartmentLite | null = null
  let bestScore = 0
  const domain = resume.domain || ''

  for (const d of departments) {
    let score = scoreLabelMatch(d.label, domain) + scoreLabelMatch(d.key.replace(/_/g, ' '), domain)
    for (const skill of resume.skills?.slice(0, 12) ?? []) {
      score += Math.min(20, scoreLabelMatch(d.label, skill) / 5)
      for (const spec of d.specializations ?? []) {
        score += Math.min(10, scoreLabelMatch(spec.label, skill) / 8)
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestDept = d
    }
  }

  if (!bestDept && departments.length > 0) {
    const soft = departments.find((d) => /software|information.?tech|computer/i.test(d.label))
    bestDept = soft ?? departments[0]
  }

  const specializationKeys: string[] = []
  const topicHits = new Map<string, number>()

  if (bestDept) {
    for (const spec of bestDept.specializations ?? []) {
      let specScore = 0
      for (const skill of resume.skills ?? []) {
        specScore += scoreLabelMatch(spec.label, skill)
        for (const t of [
          ...(spec.technicalTopics ?? []),
          ...(spec.behavioralTopics ?? []),
          ...(spec.hrTopics ?? []),
        ]) {
          const hit = scoreLabelMatch(t, skill)
          if (hit >= 40) {
            topicHits.set(t, (topicHits.get(t) ?? 0) + hit)
          }
        }
      }
      for (const tech of resume.projects?.flatMap((p) => p.technologies ?? []) ?? []) {
        specScore += scoreLabelMatch(spec.label, tech)
        for (const t of spec.technicalTopics ?? []) {
          const hit = scoreLabelMatch(t, tech)
          if (hit >= 40) topicHits.set(t, (topicHits.get(t) ?? 0) + hit)
        }
      }
      if (specScore >= 40) specializationKeys.push(spec.key)
    }
    if (specializationKeys.length === 0 && (bestDept.specializations?.length ?? 0) > 0) {
      specializationKeys.push(bestDept.specializations![0].key)
    }
  }

  const topics = [...topicHits.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
    .slice(0, 8)

  if (topics.length === 0 && bestDept) {
    const specs =
      specializationKeys.length > 0
        ? (bestDept.specializations ?? []).filter((s) => specializationKeys.includes(s.key))
        : (bestDept.specializations ?? []).slice(0, 1)
    for (const s of specs) {
      for (const t of (s.technicalTopics ?? []).slice(0, 4)) {
        if (!topics.includes(t)) topics.push(t)
      }
    }
  }

  let difficulty: ResumeCatalogMatch['difficulty'] = null
  if (resume.seniorityLevel === 'junior') difficulty = 'Easy'
  else if (resume.seniorityLevel === 'mid') difficulty = 'Medium'
  else if (resume.seniorityLevel === 'senior') difficulty = 'Hard'

  return {
    departmentKey: bestDept?.key ?? null,
    specializationKeys,
    topics,
    difficulty,
    interviewType: 'technical',
  }
}
