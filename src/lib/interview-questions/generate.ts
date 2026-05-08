import { generateQuestionsWithGemini } from '@/lib/gemini/generate-questions'
import { buildTemplateQuestions } from '@/lib/interview-questions/templates'
import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import { validateGeneratedQuestions } from '@/lib/interview-questions/validate'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'

export type QuestionGenerationSource = 'gemini' | 'template'

export type GenerateInterviewQuestionsResult = {
  questions: InterviewQuestionItem[]
  source: QuestionGenerationSource
  warnings: string[]
}

export async function generateInterviewQuestions(
  params: InterviewGenerationParams,
): Promise<GenerateInterviewQuestionsResult> {
  const warnings: string[] = []

  const tryGemini = Boolean(process.env.GEMINI_API_KEY?.trim())
  if (tryGemini) {
    try {
      const { questions } = await generateQuestionsWithGemini(params)
      const validation = validateGeneratedQuestions(questions, params)
      const errors = validation.filter((v) => v.level === 'error')
      warnings.push(...validation.filter((v) => v.level === 'warning').map((v) => v.message))

      if (errors.length === 0) {
        return { questions, source: 'gemini', warnings }
      }
      warnings.push(...errors.map((e) => `${e.message}${typeof e.index === 'number' ? ` (#${e.index + 1})` : ''}`))
      warnings.push('Gemini output failed validation; using template questions.')
    } catch (e) {
      warnings.push(e instanceof Error ? e.message : 'Gemini generation failed.')
      warnings.push('Using template questions.')
    }
  }

  if (!tryGemini) {
    warnings.push('GEMINI_API_KEY is not set or empty; using template questions.')
  }

  const questions = buildTemplateQuestions(params)
  const validation = validateGeneratedQuestions(questions, params)
  warnings.push(...validation.filter((i) => i.level === 'warning').map((i) => i.message))

  return { questions, source: 'template', warnings }
}
