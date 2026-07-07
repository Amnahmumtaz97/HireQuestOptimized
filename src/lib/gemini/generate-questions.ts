import { GoogleGenerativeAI } from '@google/generative-ai'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import { allocateKinds } from '@/lib/interview-questions/templates'
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
  const ratioHint =
    params.interviewType === 'both'
      ? `Mix: about ${params.technicalQuestionRatio}% technical and ${100 - params.technicalQuestionRatio}% behavioral (approximate).`
      : `Focus: ${params.interviewType} questions only.`

  const diagramBudget = Math.min(MAX_DIAGRAM_QUESTIONS, n)

  return `You generate interview questions for an online hiring product.

Output ONLY valid JSON: an array of exactly ${n} objects. Each object must be exactly:
{"question":"...","requiresDiagram":true|false}

CRITICAL — candidate cannot draw or upload:
- Never ask the candidate to draw, sketch, whiteboard, diagram, paint, illustrate, photograph, scan, attach, upload, or generate an image.
- Never say "show your work in a figure" or "provide a picture". All figures are supplied by the platform when requiresDiagram is true.
- Put every numeric instance (item weights/values, capacities, graph edges, matrix entries) in the question text itself.

The "question" string may use GitHub-flavored Markdown inside the JSON value:
- Knapsack, bin packing, DP, scheduling with parameters: MUST include a markdown pipe table (e.g. columns Item | Weight | Value) with concrete numbers, then the task in prose below or above.
- Graph/tree/DAG questions: you may use a short bullet list of edges or nodes if no weights table is needed.
- Use \\n for newlines inside the JSON string. Escape double quotes in strings.

requiresDiagram rules:
- ALWAYS set requiresDiagram:false. Never set it to true.
- Diagrams are disabled on this platform.
- All questions must be pure text, with markdown tables only when needed for data presentation.
- Behavioral questions: plain text only, no images or diagrams.

No other keys. Markdown is allowed ONLY inside each "question" string.

Style rules:
- Behavioral: one or two short sentences ending with "?".
- Technical: specific; if you include a table, ask the actual task after the table.
- Do NOT start with labels like "Technical:", "Behavioral:", "Easy:", or bracketed tags.
- Professional tone. Tie questions to the role and topics.

Context:
- Role: ${roleLabel(params)}
- Topics (distribute questions evenly across these): ${params.topics.join(', ') || 'General'}
- Difficulty level for all questions: ${difficultyPromptLabel(params.difficulty)}
- Interview type: ${params.interviewType}
- ${ratioHint}

Return exactly ${n} questions as JSON array.`
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

  const kinds = allocateKinds(params.interviewType, params.totalQuestions, params.technicalQuestionRatio)

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

  const questions: InterviewQuestionItem[] = parsed.map((item, i) => ({
    type: kinds[i],
    topic: assignedTopics[i] ?? 'General',
    difficulty: difficultyForQuestionIndex(params.difficulty, i),
    question: formatGeneratedQuestion(item.question),
    illustrationRequired: Boolean(item.requiresDiagram),
  }))

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
