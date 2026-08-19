import { generateQuestionsWithGemini } from '@/lib/gemini/generate-questions'
import { buildTemplateQuestions } from '@/lib/interview-questions/templates'
import { buildLeetCodeCodingQuestions } from '@/lib/interview-questions/coding-templates'
import { buildSystemDesignQuestions } from '@/lib/interview-questions/system-design-templates'
import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import { validateGeneratedQuestions } from '@/lib/interview-questions/validate'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import { assertConfirmedTopics } from '@/lib/interview-config/assert-selection'
import { isGeminiRateLimitError } from '@/lib/gemini/model-fallback'

export type QuestionGenerationSource = 'gemini' | 'template'

export type GenerateInterviewQuestionsResult = {
  questions: InterviewQuestionItem[]
  source: QuestionGenerationSource
  warnings: string[]
}

function isCodingParams(params: InterviewGenerationParams): boolean {
  return (
    params.interviewType === 'coding' ||
    String(params.preferredQuestionFormat || params.interviewSetup?.preferredQuestionFormat || '')
      .toLowerCase() === 'coding'
  )
}

function isSystemDesignParams(params: InterviewGenerationParams): boolean {
  return (
    params.interviewType === 'system_design' ||
    (Array.isArray(params.interviewTypes) &&
      params.interviewTypes.length === 1 &&
      params.interviewTypes[0] === 'system_design')
  )
}

function normalizeCodingQuestion(
  q: InterviewQuestionItem,
  fallbackTopic: string,
  difficulty: InterviewQuestionItem['difficulty'],
): InterviewQuestionItem {
  const functionName = (q.functionName || 'solve').replace(/[^\w$]/g, '') || 'solve'
  const starterCode =
    q.starterCode?.trim() ||
    `function ${functionName}(/* args */) {\n  // your code\n}\n`
  return {
    ...q,
    type: 'technical',
    kind: 'coding',
    language: 'javascript',
    topic: q.topic?.trim() || fallbackTopic,
    difficulty,
    functionName,
    starterCode,
    publicTests: q.publicTests?.length
      ? q.publicTests
      : [{ input: '[0]', expected: '0' }],
    hiddenTests: q.hiddenTests?.length ? q.hiddenTests : [{ input: '[1]', expected: '1' }],
    question: q.question?.trim() || `## Coding problem\n\nImplement \`${functionName}\`.`,
  }
}

function buildFallbackQuestions(
  params: InterviewGenerationParams,
  topics: string[],
  coding: boolean,
  systemDesign: boolean,
): InterviewQuestionItem[] {
  if (coding) {
    return buildLeetCodeCodingQuestions({
      topics,
      totalQuestions: params.totalQuestions,
      difficulty: params.difficulty,
    })
  }
  if (systemDesign) {
    return buildSystemDesignQuestions({
      topics,
      totalQuestions: params.totalQuestions,
      difficulty: params.difficulty,
    })
  }
  return buildTemplateQuestions(params)
}

function fallbackWarning(coding: boolean, systemDesign: boolean, reason: 'missing_key' | 'failed'): string {
  if (coding) {
    return reason === 'missing_key'
      ? 'GEMINI_API_KEY is not set or empty; using curated LeetCode-style coding problems.'
      : 'Using curated LeetCode-style coding problems.'
  }
  if (systemDesign) {
    return reason === 'missing_key'
      ? 'GEMINI_API_KEY is not set or empty; using curated system design templates.'
      : 'Using curated system design templates.'
  }
  return reason === 'missing_key'
    ? 'GEMINI_API_KEY is not set or empty; using template questions.'
    : 'Using template questions.'
}

/**
 * All interview types use Gemini when GEMINI_API_KEY is set.
 * Curated coding / system-design banks are fallback only (when allowTemplateFallback).
 */
export async function generateInterviewQuestions(
  params: InterviewGenerationParams,
): Promise<GenerateInterviewQuestionsResult> {
  const warnings: string[] = []
  const topics = assertConfirmedTopics(params.topics)

  const generationParams: InterviewGenerationParams = { ...params, topics }
  // Template banks only when explicitly allowed; production routes require Gemini.
  const allowTemplate = params.allowTemplateFallback === true
  const coding = isCodingParams(generationParams)
  const systemDesign = isSystemDesignParams(generationParams)

  const tryGemini = Boolean(process.env.GEMINI_API_KEY?.trim())
  if (tryGemini) {
    try {
      const { questions: raw } = await generateQuestionsWithGemini(generationParams)
      let questions = raw

      if (coding) {
        questions = raw.map((q, i) =>
          normalizeCodingQuestion(q, topics[i % topics.length], q.difficulty),
        )
        if (questions.length < params.totalQuestions) {
          const used = new Set(
            questions.map((q) => (q.functionName || '').trim()).filter(Boolean),
          )
          const pad = buildLeetCodeCodingQuestions({
            topics,
            totalQuestions: params.totalQuestions - questions.length,
            difficulty: params.difficulty,
            excludeFunctionNames: [...used],
          }).filter((q) => {
            const name = (q.functionName || '').trim()
            if (!name || used.has(name)) return false
            used.add(name)
            return true
          })
          questions = [...questions, ...pad]
          warnings.push('Padded coding set with curated LeetCode-style problems.')
        } else if (questions.length > params.totalQuestions) {
          questions = questions.slice(0, params.totalQuestions)
        }

        {
          const seen = new Set<string>()
          questions = questions.filter((q) => {
            const name = (q.functionName || '').trim()
            if (!name) return true
            if (seen.has(name)) return false
            seen.add(name)
            return true
          })
          if (questions.length < params.totalQuestions) {
            const used = [...seen]
            const more = buildLeetCodeCodingQuestions({
              topics,
              totalQuestions: params.totalQuestions - questions.length,
              difficulty: params.difficulty,
              excludeFunctionNames: used,
            })
            questions = [...questions, ...more]
          }
        }
      } else if (systemDesign && questions.length !== params.totalQuestions) {
        if (questions.length > params.totalQuestions) {
          questions = questions.slice(0, params.totalQuestions)
        } else if (questions.length < params.totalQuestions) {
          const pad = buildSystemDesignQuestions({
            topics,
            totalQuestions: params.totalQuestions - questions.length,
            difficulty: params.difficulty,
          })
          questions = [...questions, ...pad]
          warnings.push('Padded system design set with curated templates.')
        }
      }

      const validation = validateGeneratedQuestions(questions, generationParams)
      const errors = validation.filter((v) => v.level === 'error')
      warnings.push(...validation.filter((v) => v.level === 'warning').map((v) => v.message))

      if (errors.length === 0) {
        return { questions, source: 'gemini', warnings }
      }

      if (coding && questions.every((q) => q.kind === 'coding' && q.starterCode?.trim())) {
        const hard = errors.filter(
          (e) =>
            !/difficulty must be/i.test(e.message) &&
            !/outside the resolved topic bank/i.test(e.message),
        )
        if (hard.length === 0) {
          warnings.push(
            ...errors.map(
              (e) => `${e.message}${typeof e.index === 'number' ? ` (#${e.index + 1})` : ''}`,
            ),
          )
          return { questions, source: 'gemini', warnings }
        }
      }

      // System design: accept Gemini spoken technical questions when topic/difficulty soft-fail only
      if (systemDesign && questions.every((q) => q.type === 'technical' && q.question?.trim())) {
        const hard = errors.filter(
          (e) =>
            !/difficulty must be/i.test(e.message) &&
            !/outside the resolved topic bank/i.test(e.message),
        )
        if (hard.length === 0) {
          warnings.push(
            ...errors.map(
              (e) => `${e.message}${typeof e.index === 'number' ? ` (#${e.index + 1})` : ''}`,
            ),
          )
          return { questions, source: 'gemini', warnings }
        }
      }

      warnings.push(
        ...errors.map(
          (e) => `${e.message}${typeof e.index === 'number' ? ` (#${e.index + 1})` : ''}`,
        ),
      )
      if (!allowTemplate) {
        throw new Error(
          `Gemini output failed validation and template fallback is disabled: ${errors[0]?.message}`,
        )
      }
      warnings.push(
        coding
          ? 'Gemini coding output failed validation; using curated LeetCode-style problems.'
          : systemDesign
            ? 'Gemini system design output failed validation; using curated templates.'
            : 'Gemini output failed validation; using template questions.',
      )
    } catch (e) {
      if (!allowTemplate && !isGeminiRateLimitError(e)) {
        throw e instanceof Error ? e : new Error('Gemini generation failed')
      }
      warnings.push(
        isGeminiRateLimitError(e)
          ? 'Gemini quota is currently exhausted; using curated interview questions.'
          : e instanceof Error
            ? e.message
            : 'Gemini generation failed.',
      )
      warnings.push(fallbackWarning(coding, systemDesign, 'failed'))
    }
  } else if (!allowTemplate) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Set GEMINI_API_KEY to generate interview questions.',
    )
  } else {
    warnings.push(fallbackWarning(coding, systemDesign, 'missing_key'))
  }

  const questions = buildFallbackQuestions(generationParams, topics, coding, systemDesign)
  const validation = validateGeneratedQuestions(questions, generationParams)
  warnings.push(...validation.filter((i) => i.level === 'warning').map((i) => i.message))

  return { questions, source: 'template', warnings }
}
