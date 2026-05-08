import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import { cleanQuestionText } from '@/lib/interview-questions/clean-question-text'

export function allocateKinds(
  interviewType: InterviewGenerationParams['interviewType'],
  total: number,
  technicalRatio: number,
): Array<'technical' | 'behavioral'> {
  if (interviewType === 'technical') {
    return Array.from({ length: total }, () => 'technical')
  }
  if (interviewType === 'behavioral') {
    return Array.from({ length: total }, () => 'behavioral')
  }
  const tech = Math.round(total * (technicalRatio / 100))
  const techClamped = Math.min(Math.max(tech, 0), total)
  const out: Array<'technical' | 'behavioral'> = []
  for (let i = 0; i < total; i++) {
    out.push(i < techClamped ? 'technical' : 'behavioral')
  }
  return out
}

export function buildTemplateQuestions(params: InterviewGenerationParams): InterviewQuestionItem[] {
  const { topics, difficulty, totalQuestions, interviewType, technicalQuestionRatio } = params
  const kinds = allocateKinds(interviewType, totalQuestions, technicalQuestionRatio)
  const topicPool = topics.length > 0 ? topics : ['General']

  return kinds.map((kind, i) => {
    const topic = topicPool[i % topicPool.length]
    const draft =
      kind === 'technical'
        ? `For "${topic}" at ${difficulty} difficulty: describe how you would approach a realistic scenario, key trade-offs, and how you would validate your solution.`
        : `For "${topic}" at ${difficulty} difficulty: describe a concrete situation, your actions, stakeholders involved, and what you learned.`
    return {
      type: kind,
      topic,
      difficulty,
      question: cleanQuestionText(draft),
    }
  })
}
