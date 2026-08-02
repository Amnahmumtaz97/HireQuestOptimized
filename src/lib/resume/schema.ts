import { z } from 'zod'

const stringOrNull = z.preprocess((v) => {
  if (v === undefined || v === null || v === '') return null
  return String(v)
}, z.string().nullable())

const numberOrNull = z.preprocess((v) => {
  if (v === undefined || v === null || v === '') return null
  if (typeof v === 'string' && v.trim() === '') return null
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : null
}, z.number().nullable())

const seniorityOrNull = z.preprocess((v) => {
  if (v === undefined || v === null || v === '') return null
  const s = String(v).toLowerCase().trim()
  if (s === 'junior' || s === 'entry' || s === 'intern') return 'junior'
  if (s === 'mid' || s === 'middle' || s === 'intermediate') return 'mid'
  if (s === 'senior' || s === 'sr' || s === 'lead') return 'senior'
  return null
}, z.enum(['junior', 'mid', 'senior']).nullable())

const stringArray = z.preprocess((v) => {
  if (!v) return []
  if (Array.isArray(v)) return v.map(String).filter(Boolean)
  if (typeof v === 'string') {
    return v
      .split(/[,|;]/)
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return []
}, z.array(z.string()))

export const resumeParseSchema = z.object({
  name: stringOrNull,
  yearsExperience: numberOrNull,
  seniorityLevel: seniorityOrNull,
  domain: stringOrNull,
  skills: stringArray,
  projects: z.preprocess((v) => {
    if (!Array.isArray(v)) return []
    return v.map((item) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<
        string,
        unknown
      >
      return {
        name: String(row.name ?? row.title ?? 'Project'),
        description: String(row.description ?? row.summary ?? ''),
        technologies: Array.isArray(row.technologies)
          ? row.technologies.map(String)
          : typeof row.technologies === 'string'
            ? row.technologies.split(/[,|;]/).map((s) => s.trim()).filter(Boolean)
            : [],
      }
    })
  }, z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
    }),
  )),
  education: z.preprocess((v) => {
    if (!Array.isArray(v)) return []
    return v.map((item) => {
      const row = (item && typeof item === 'object' ? item : {}) as Record<
        string,
        unknown
      >
      return {
        degree: String(row.degree ?? row.program ?? ''),
        institution: String(row.institution ?? row.school ?? ''),
      }
    })
  }, z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
    }),
  )),
})

export type ResumeParseResult = z.infer<typeof resumeParseSchema>

export const RESUME_EXTRACT_SYSTEM = `You are extracting structured data from a resume. Return ONLY valid JSON matching this exact schema, with no markdown formatting, no code fences, and no explanatory text before or after:

{
  "name": string | null,
  "yearsExperience": number | null,
  "seniorityLevel": "junior" | "mid" | "senior" | null,
  "domain": string | null,
  "skills": string[],
  "projects": [{ "name": string, "description": string, "technologies": string[] }],
  "education": [{ "degree": string, "institution": string }]
}

If a field cannot be determined from the resume, use null for strings/numbers or an empty array for lists. Do not fabricate information not present in the resume text.
Keep project descriptions under 280 characters. Cap skills at 25 items and projects at 6.`

export function parseResumeJsonText(raw: string): ResumeParseResult {
  let text = raw.trim()
  if (text.startsWith('```')) {
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start >= 0 && end > start) {
    text = text.slice(start, end + 1)
  }
  // Repair truncated JSON arrays/objects when the model hits token limits
  text = repairTruncatedJson(text)
  const data = JSON.parse(text) as unknown
  return resumeParseSchema.parse(data)
}

function repairTruncatedJson(input: string): string {
  let text = input.trim()
  // Remove trailing incomplete string
  if ((text.match(/"/g) || []).length % 2 === 1) {
    text = text.replace(/"[^"]*$/, '""')
  }
  // Close open brackets/braces
  const stack: string[] = []
  let inString = false
  let escape = false
  for (const ch of text) {
    if (inString) {
      if (escape) escape = false
      else if (ch === '\\') escape = true
      else if (ch === '"') inString = false
      continue
    }
    if (ch === '"') inString = true
    else if (ch === '{' || ch === '[') stack.push(ch)
    else if (ch === '}' || ch === ']') stack.pop()
  }
  // Trim trailing commas
  text = text.replace(/,\s*$/, '')
  while (stack.length) {
    const open = stack.pop()
    text += open === '{' ? '}' : ']'
  }
  return text
}

/** Best-effort local extraction when Gemini is unavailable or returns bad JSON. */
export function heuristicExtractResume(text: string): ResumeParseResult {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const name = lines[0]?.slice(0, 80) || null
  const headline = lines[1] || ''

  const skills: string[] = []
  const skillBlock = text.match(
    /skills?(?:\s+summary)?[:\n]+([\s\S]{0,1200}?)(?:\n\s*(?:projects?|experience|education|work)\b|$)/i,
  )
  if (skillBlock?.[1]) {
    const chunk = skillBlock[1]
    for (const part of chunk.split(/[\n,•|/]/)) {
      const s = part.replace(/^[^:]+:\s*/, '').trim()
      if (s.length > 1 && s.length < 40 && !/^(frontend|backend|database|tools?)$/i.test(s)) {
        skills.push(s)
      }
    }
  }

  let domain: string | null = null
  if (/mern|full[\s-]?stack|react|node/i.test(text)) domain = 'Software / IT'
  else if (/data|machine learning|ai\b/i.test(text)) domain = 'Data / AI'
  if (/developer|engineer/i.test(headline) && !domain) domain = 'Software / IT'

  const education: Array<{ degree: string; institution: string }> = []
  const eduMatch = text.match(
    /(Bachelor[^\n;]*|Master[^\n;]*|B\.?S\.?[^\n;]*|M\.?S\.?[^\n;]*)[;\n]*([^\n]{0,120})/i,
  )
  if (eduMatch) {
    education.push({
      degree: eduMatch[1].trim(),
      institution: (eduMatch[2] || '').replace(/Expected.*/i, '').trim() || '—',
    })
  }

  return resumeParseSchema.parse({
    name,
    yearsExperience: null,
    seniorityLevel: /intern|student|junior|8th semester|expected/i.test(text)
      ? 'junior'
      : null,
    domain,
    skills: skills.slice(0, 25),
    projects: [],
    education,
  })
}
