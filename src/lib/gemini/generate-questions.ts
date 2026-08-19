import { GoogleGenerativeAI } from '@google/generative-ai'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import { interviewQuestionSchema, type InterviewQuestionItem } from '@/lib/interview-questions/schema'
import { allocateKinds } from '@/lib/interview-questions/templates'
import { decodeInterviewTypeKinds, formatInterviewTypeKindsLabel } from '@/lib/interview-types'
import { assignTopicsEvenly } from '@/lib/interview-scope'
import { formatGeneratedQuestion } from '@/lib/interview-questions/clean-question-text'
import { parseGeminiQuestionJsonArray } from '@/lib/interview-questions/parse-gemini-json'
import { generateDiagramImageDataUrl, type DiagramKind } from '@/lib/gemini/generate-diagram-image'
import { isGeminiRateLimitError, resolveTextModelChain } from '@/lib/gemini/model-fallback'
import { difficultyForQuestionIndex, difficultyPromptLabel } from '@/lib/interview-questions/difficulty'
import { formatIndustryDisplay, formatRoleCategoryDisplay } from '@/utils/dashboard/interview-labels'
import { assertConfirmedTopics } from '@/lib/interview-config/assert-selection'

const DEFAULT_MODEL = 'gemini-2.0-flash'
const DEFAULT_MODEL_FALLBACK = 'gemini-2.5-flash-lite'

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
    params.interviewType === 'coding' || kinds[0] === 'coding'
      ? 'Focus: live coding problems only. Each question is a coding challenge tied to one DSA category from the topic bank.'
      : params.interviewType === 'system_design' || kinds[0] === 'system_design'
        ? 'Focus: system design interview questions only (architecture, trade-offs, scalability). Use only topics from the topic bank.'
        : kinds.length > 1 && kinds.includes('technical')
          ? `Mix across: ${typeLabel}. About ${params.technicalQuestionRatio}% technical/coding/design; split the rest across the other selected types.`
          : kinds.length > 1
            ? `Mix evenly across: ${typeLabel}.`
            : kinds[0] === 'hr'
              ? 'Focus: HR screening questions only (introduction, motivation, logistics, salary, work preferences). Use only sections from the topic bank.'
              : kinds[0] === 'behavioral'
                ? 'Focus: behavioral / competency STAR questions only. Use only competencies from the topic bank.'
                : `Focus: ${kinds[0] ?? params.interviewType} questions only.`

  const topicBank = assertConfirmedTopics(params.topics)
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

function buildCodingBatchPrompt(params: InterviewGenerationParams): string {
  const n = params.totalQuestions
  const topicBank = assertConfirmedTopics(params.topics)
  const topicBankLine = topicBank.map((t) => `"${t}"`).join(', ')
  const projects =
    params.resumeContext?.projects
      ?.slice(0, 4)
      .map((p) => `${p.name}: ${p.description}`)
      .join('; ') || ''

  return `You generate LeetCode-style CODING interview problems for a JavaScript Node sandbox (named function + JSON tests).

Output ONLY valid JSON: an array of exactly ${n} objects. Each object MUST be:
{"question":"<markdown problem statement>","topic":"<one of topic bank>","type":"technical","difficulty":"Easy"|"Medium"|"Hard","kind":"coding","language":"javascript","functionName":"<camelCaseName>","starterCode":"function name(args) {\\n  \\n}\\n","publicTests":[{"input":"<JSON array of arguments>","expected":"<JSON expected return>"}],"hiddenTests":[{"input":"...","expected":"..."}]}

## Problem style (LeetCode)
- Write problems like LeetCode: title heading, clear statement, Examples with Input/Output/Explanation, Constraints, optional Follow-up.
- Prefer classic patterns: Two Sum, sliding window, binary search, stack parentheses, DP climbing stairs, graph BFS/DFS counts, etc. — adapted to the topic bank.
- Each problem must be uniquely solvable with a single return value (number, boolean, string, or array). Avoid answers whose order is ambiguous unless you require a canonical sorted form in the statement.
- Difficulty should match: ${difficultyPromptLabel(params.difficulty)}
- Distribute topics across: [${topicBankLine}]

## Sandbox / tests (critical)
- language MUST be "javascript"
- starterCode MUST define functionName; body can be empty for the candidate
- publicTests: 2–4 cases; hiddenTests: 1–3 harder edge cases
- "input" MUST be a JSON array of the function arguments, e.g. for twoSum(nums, target) use "[[2,7,11,15],9]"
- "expected" MUST be JSON for the return value, e.g. "[0,1]" or "true" or "3"
- Do NOT use stdin/stdout; the judge calls the function and compares JSON.stringify(result)

## Quality
- No placeholders like "implement a topic problem"
- Include edge cases (empty where valid, single element, duplicates)
${projects ? `- Optionally flavor names/examples using: ${projects}` : ''}
- Role context: ${roleLabel(params)}
${resumeContextBlock(params)}
Return exactly ${n} coding problems as a JSON array.`
}

function wantsCodingRound(params: InterviewGenerationParams): boolean {
  if (params.interviewType === 'coding') return true
  const fmt =
    params.preferredQuestionFormat ||
    params.interviewSetup?.preferredQuestionFormat ||
    ''
  return String(fmt).toLowerCase() === 'coding'
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
    process.env.GEMINI_MODEL_FALLBACK || DEFAULT_MODEL_FALLBACK,
  )

  const coding = wantsCodingRound(params)
  const prompt = coding ? buildCodingBatchPrompt(params) : buildBatchPrompt(params)
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

  const confirmedTopics = assertConfirmedTopics(params.topics)
  const assignedTopics = assignTopicsEvenly(params.totalQuestions, confirmedTopics)
  const topicBank = new Set(confirmedTopics)

  if (coding) {
    const questions: InterviewQuestionItem[] = parsed.map((item, i) => {
      const rawTopic = item.topic?.trim() || ''
      const topic =
        rawTopic && topicBank.has(rawTopic)
          ? rawTopic
          : assignedTopics[i] ?? confirmedTopics[i % confirmedTopics.length]
      const functionName = (item.functionName || 'solve').replace(/[^\w$]/g, '') || 'solve'
      const starterCode =
        item.starterCode?.trim() ||
        `function ${functionName}(/* args */) {\n  // your code\n}\n`
      return interviewQuestionSchema.parse({
        type: 'technical',
        topic,
        difficulty: difficultyForQuestionIndex(params.difficulty, i),
        question: formatGeneratedQuestion(item.question),
        kind: 'coding',
        language: 'javascript',
        functionName,
        starterCode,
        publicTests: Array.isArray(item.publicTests) ? item.publicTests : [],
        hiddenTests: Array.isArray(item.hiddenTests) ? item.hiddenTests : [],
        illustrationRequired: false,
      })
    })
    return { questions, rawText }
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

  const questions: InterviewQuestionItem[] = parsed.map((item, i) => {
    const rawTopic = item.topic?.trim() || ''
    const topic =
      rawTopic && topicBank.has(rawTopic)
        ? rawTopic
        : assignedTopics[i] ?? confirmedTopics[i % confirmedTopics.length]
    return {
      type: kinds[i],
      topic,
      difficulty: difficultyForQuestionIndex(params.difficulty, i),
      question: formatGeneratedQuestion(item.question),
      kind: 'spoken' as const,
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
      questions[i] = { ...questions[i], illustrationRequired: false }
    }
  }

  return { questions, rawText }
}
