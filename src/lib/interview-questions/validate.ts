import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'

export type QuestionValidationIssue = {
  level: 'error' | 'warning'
  message: string
  index?: number
}

const GENERIC_PATTERNS: RegExp[] = [
  /\btell me about yourself\b/i,
  /\bwhat are your strengths\b/i,
  /\bwhat are your weaknesses\b/i,
  /\bwhere do you see yourself\b/i,
  /\bwhy should we hire you\b/i,
]

export function validateGeneratedQuestions(
  questions: InterviewQuestionItem[],
  params: InterviewGenerationParams,
): QuestionValidationIssue[] {
  const issues: QuestionValidationIssue[] = []
  const topicSet = new Set(params.topics.map((t) => t.trim()).filter(Boolean))
  const seen = new Set<string>()

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]

    if (q.difficulty !== params.difficulty) {
      issues.push({
        level: 'error',
        index: i,
        message: `Question difficulty must be "${params.difficulty}".`,
      })
    }

    if (q.type !== 'technical' && q.type !== 'behavioral') {
      issues.push({ level: 'error', index: i, message: 'Question type must be technical or behavioral.' })
    }

    const normalized = q.question.trim().toLowerCase().replace(/\s+/g, ' ')
    if (seen.has(normalized)) {
      issues.push({ level: 'error', index: i, message: 'Duplicate question detected.' })
    } else {
      seen.add(normalized)
    }

    const trimmed = q.question.trim()
    const isStructured = trimmed.includes('\n') || /\|/.test(trimmed)
    if (trimmed.length < 18 && !isStructured) {
      issues.push({ level: 'warning', index: i, message: 'Question is very short and may be low-signal.' })
    }

    if (GENERIC_PATTERNS.some((re) => re.test(q.question))) {
      issues.push({ level: 'warning', index: i, message: 'Question looks generic; consider regenerating.' })
    }

    if (topicSet.size > 0 && !topicSet.has(q.topic.trim())) {
      issues.push({
        level: 'warning',
        index: i,
        message: 'Topic is not one of the selected topics.',
      })
    }
  }

  return issues
}

