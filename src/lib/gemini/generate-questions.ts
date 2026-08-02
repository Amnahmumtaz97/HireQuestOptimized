import { GoogleGenerativeAI } from '@google/generative-ai'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import { allocateKinds } from '@/lib/interview-questions/templates'
import { decodeInterviewTypeKinds, formatInterviewTypeKindsLabel } from '@/lib/interview-types'
import { assignTopicsEvenly } from '@/lib/interview-scope'
import { formatGeneratedQuestion } from '@/lib/interview-questions/clean-question-text'
import { parseGeminiQuestionJsonArray } from '@/lib/interview-questions/parse-gemini-json'
import { generateDiagramImageDataUrl, type DiagramKind } from '@/lib/gemini/generate-diagram-image'
import { isGeminiRateLimitError, resolveTextModelChain } from '@/lib/gemini/model-fallback'
import { difficultyForQuestionIndex, difficultyPromptLabel } from '@/lib/interview-questions/difficulty'
import { formatIndustryDisplay, formatRoleCategoryDisplay } from '@/utils/dashboard/interview-labels'

const DEFAULT_MODEL = 'gemini-2.0-flash'

/** Cap Gemini image calls per batch (same API key; keeps Mongo documents smaller). */
/** Diagrams disabled - no diagram questions will be generated */
const MAX_DIAGRAM_QUESTIONS = 0

/**
 * Technical content that needs a platform-supplied figure and/or inline markdown table
 * (candidate must never be asked to draw or upload).
 */
const STRUCTURED_OR_VISUAL_HINT =
  /never-match-anything-deliberately-disabled/i

const DFD_OR_TRUST_BOUNDARY_HINT =
  /never-match-anything-deliberately-disabled/i

function diagramKindForQuestion(text: string): DiagramKind {
  if (DFD_OR_TRUST_BOUNDARY_HINT.test(text)) {
    return 'dfd'
  }
  if (
    /knapsack|dynamic\s+programming|memoiz|subproblem|0\/1|weights?\s+and\s+values?|capacity|optimal\s+substructure|fill\s+(?:the\s+)?table|recurrence/i.test(
      text,
    )
  ) {
    return 'dp-table'
  }
  return 'general'
}

function getGenerativeModel(genAI: GoogleGenerativeAI, modelId: string) {
  return genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.65,
      maxOutputTokens: 8192,
    },
  })
}

function roleLabel(params: InterviewGenerationParams): string {
  const industryLabels = params.industryLabels?.filter(Boolean)
  const industryPart =
    industryLabels && industryLabels.length > 1
      ? industryLabels.join(', ')
      : formatIndustryDisplay(params.industryKey)

  const roleLabels = params.roleCategoryLabels?.filter(Boolean)
  if (roleLabels && roleLabels.length > 1) {
    return `${industryPart} / ${roleLabels.join(', ')}`
  }
  return `${industryPart} / ${formatRoleCategoryDisplay(params.industryKey, params.roleCategoryKey)}`
}

function buildBatchPrompt(params: InterviewGenerationParams): string {
  const n = params.totalQuestions
  const kinds = decodeInterviewTypeKinds(params.interviewType, params.interviewTypes)
  const typeLabel = formatInterviewTypeKindsLabel(kinds)
  const ratioHint =
    kinds.length > 1 && kinds.includes('technical')
      ? `Mix across: ${typeLabel}. About ${params.technicalQuestionRatio}% technical; split the rest across the other selected types.`
      : kinds.length > 1
        ? `Mix evenly across: ${typeLabel}.`
        : kinds[0] === 'hr'
          ? 'Focus: HR interview questions only (screening, culture fit, motivation, logistics, and common HR scenarios).'
          : `Focus: ${kinds[0] ?? params.interviewType} questions only.`

  const topicBank = params.topics.map((t) => t.trim()).filter(Boolean)
  if (topicBank.length === 0) {
    throw new Error('No interview topics selected.')
  }
  const topicBankLine = topicBank.map((t) => `"${t}"`).join(', ')
  const setup = params.interviewSetup
  const hasDesignPatterns = topicBank.some((t) =>
    /creational|structural|behavioral|design pattern/i.test(t),
  )
  const hasSystemDesign = topicBank.some((t) =>
    /scalability|load balancing|caching|microservices|cap theorem|message queues|rate limiting|database design/i.test(
      t,
    ),
  )

  return `You generate interview questions for an online hiring product.

Output ONLY valid JSON: an array of exactly ${n} objects. Each object must be exactly:
{"question":"...","topic":"<one of the topic bank>","type":"technical"|"behavioral"|"hr","difficulty":"Easy"|"Medium"|"Hard","requiresDiagram":true|false}

CRITICAL — selected topics ONLY (do not invent or substitute):
- Every question MUST set "topic" to exactly one string from this list: [${topicBankLine}]
- Distribute questions evenly across the topic bank.
- NEVER introduce topics that are not in this list (including Design Patterns, System Design, DSA, etc. unless listed).
${!hasDesignPatterns ? '- Design Patterns were NOT selected: do not ask about GoF patterns, creational/structural/behavioral pattern catalogs, or "approach / trade-offs / validation" frameworks framed as design-pattern drills.\n' : ''}
${!hasSystemDesign ? '- System Design topics were NOT selected: do not ask generic scalability / CAP / load-balancer textbook questions unless those exact topics appear in the bank.\n' : ''}

CRITICAL — candidate cannot draw or upload:
- Never ask the candidate to draw, sketch, whiteboard, diagram, paint, illustrate, photograph, scan, attach, upload, or generate an image.
- ALWAYS set requiresDiagram:false.

Style rules:
- Technical: specific, grounded in the selected topic and the candidate profile when provided.
- Behavioral/HR: short professional questions ending with "?".
- Do NOT start with labels like "Technical:", "Easy:", or "For \\"Topic\\" at Easy difficulty:".
- Prefer personalizing to listed projects/skills; do not invent resume facts.
- Only use "approach", "trade-offs", and "validation" framing when the selected topic naturally calls for it (e.g. System Design / Design Patterns topics that are IN the bank).

${setupContextBlock(params)}
${pathStageContextBlock(params)}
- Role context: ${roleLabel(params)}
- Topic bank: ${topicBank.join(', ')}
- Difficulty level: ${difficultyPromptLabel(params.difficulty)}
- Interview type: ${typeLabel}
- ${ratioHint}
${resumeContextBlock(params)}
Return exactly ${n} questions as JSON array.`
}

function setupContextBlock(params: InterviewGenerationParams): string {
  const s = params.interviewSetup
  if (!s) return ''
  return `Confirmed InterviewConfig (authoritative — use ONLY this):
- Target role: ${s.targetRole || 'n/a'}
- Categories: ${s.categories.join(', ') || 'n/a'}
- Topics: ${s.topics.join(', ')}
- Round: ${s.interviewRoundType || 'n/a'}
- Format: ${s.preferredQuestionFormat || 'n/a'}
- Company type: ${s.targetCompanyType || 'n/a'}
- Focus areas: ${s.focusAreas.join(', ') || 'n/a'}
- Language: ${s.language}
${s.companies?.length ? `- Companies: ${s.companies.slice(0, 8).join(', ')}` : ''}
${s.achievements?.length ? `- Achievements: ${s.achievements.slice(0, 5).join('; ')}` : ''}
`
}

function pathStageContextBlock(params: InterviewGenerationParams): string {
  const bits: string[] = []
  if (params.learningPathTitle) bits.push(`Learning path: ${params.learningPathTitle}`)
  if (params.learningStageTitle) bits.push(`Stage title: ${params.learningStageTitle}`)
  if (params.learningStageType) {
    bits.push(
      `Stage type: ${params.learningStageType}` +
        (params.learningStageType === 'mock_interview'
          ? ' (full mock — realistic, comprehensive questions)'
          : params.learningStageType === 'practice'
            ? ' (practice — focused drills on bank topics)'
            : ''),
    )
  }
  if (bits.length === 0) return '- Path stage: (none)'
  return `- Path stage: ${bits.join(' · ')}`
}

function resumeContextBlock(params: InterviewGenerationParams): string {
  const r = params.resumeContext
  if (!r) return ''

  const skills = r?.skills?.filter(Boolean).slice(0, 20).join(', ') || ''
  const projects =
    r?.projects
      ?.slice(0, 5)
      .map(
        (p) =>
          `${p.name}: ${p.description}${
            p.technologies?.length ? ` [${p.technologies.slice(0, 6).join(', ')}]` : ''
          }`,
      )
      .join('; ') || ''

  return `
Resume context (REQUIRED when present — tailor every question to this candidate; do not invent facts not listed):
${r?.name ? `- Candidate: ${r.name}` : ''}
${r?.domain ? `- Domain: ${r.domain}` : ''}
${r?.seniorityLevel ? `- Seniority: ${r.seniorityLevel}` : ''}
${typeof r?.yearsExperience === 'number' ? `- Years experience: ${r.yearsExperience}` : ''}
${skills ? `- Skills: ${skills}` : ''}
${projects ? `- Projects: ${projects}` : ''}
- Prefer scenarios, stacks, and wording that match the skills/projects above while staying inside the topic bank.
`
}

export async function generateQuestionsWithGemini(
  params: InterviewGenerationParams,
): Promise<{ questions: InterviewQuestionItem[]; rawText: string }> {
  const key = process.env.GEMINI_API_KEY
  if (!key?.trim()) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const genAI = new GoogleGenerativeAI(key)
  const modelChain = resolveTextModelChain(
    DEFAULT_MODEL,
    process.env.GEMINI_MODEL,
    process.env.GEMINI_MODEL_FALLBACK,
  )

  const prompt = buildBatchPrompt(params)
  let rawText = ''

  for (let i = 0; i < modelChain.length; i++) {
    const modelId = modelChain[i]
    try {
      const model = getGenerativeModel(genAI, modelId)
      const result = await model.generateContent(prompt)
      rawText = result.response.text()
      break
    } catch (e) {
      if (isGeminiRateLimitError(e) && i < modelChain.length - 1) {
        console.warn(`[gemini] Model "${modelId}" rate limited or quota exhausted; trying next model.`)
        continue
      }
      throw e
    }
  }
  const parsed = parseGeminiQuestionJsonArray(rawText)

  if (parsed.length !== params.totalQuestions) {
    throw new Error(`Expected ${params.totalQuestions} questions, got ${parsed.length}`)
  }

  const diagramBudget = Math.min(MAX_DIAGRAM_QUESTIONS, params.totalQuestions)
  let diagramSlots = diagramBudget
  const diagramFlags = parsed.map((item) => {
    if (!item.requiresDiagram || diagramSlots <= 0) return false
    diagramSlots -= 1
    return true
  })

  const kinds = allocateKinds(
    params.interviewType,
    params.totalQuestions,
    params.technicalQuestionRatio,
    params.interviewTypes,
  )

  let spareDiagramSlots = diagramFlags.reduce((n, f) => n + (f ? 1 : 0), 0)
  spareDiagramSlots = diagramBudget - spareDiagramSlots
  for (let i = 0; i < parsed.length && spareDiagramSlots > 0; i++) {
    if (diagramFlags[i]) continue
    if (kinds[i] !== 'technical') continue
    if (!STRUCTURED_OR_VISUAL_HINT.test(parsed[i].question)) continue
    diagramFlags[i] = true
    spareDiagramSlots -= 1
  }
  const assignedTopics = assignTopicsEvenly(params.totalQuestions, params.topics)
  const topicBank = new Set(params.topics.map((t) => t.trim()).filter(Boolean))

  const questions: InterviewQuestionItem[] = parsed.map((item, i) => {
    const rawTopic = item.topic?.trim() || ''
    const topic =
      rawTopic && topicBank.has(rawTopic)
        ? rawTopic
        : (assignedTopics[i] ?? 'General')
    return {
      type: kinds[i],
      topic,
      difficulty: difficultyForQuestionIndex(params.difficulty, i),
      question: formatGeneratedQuestion(item.question),
      illustrationRequired: Boolean(item.requiresDiagram),
    }
  })

  for (let i = 0; i < questions.length; i++) {
    if (!diagramFlags[i]) continue
    const illustrationDataUrl = await generateDiagramImageDataUrl({
      questionText: questions[i].question,
      topic: questions[i].topic,
      diagramKind: diagramKindForQuestion(questions[i].question),
    })
    if (illustrationDataUrl) {
      questions[i] = { ...questions[i], illustrationDataUrl }
    } else {
      // If a diagram was requested but couldn't be generated, avoid a broken UX.
      questions[i] = { ...questions[i], illustrationRequired: false }
    }
  }

  return { questions, rawText }
}
