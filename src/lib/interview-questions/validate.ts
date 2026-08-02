import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import { decodeInterviewTypeKinds } from '@/lib/interview-types'

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
  const allowedKinds = new Set(decodeInterviewTypeKinds(params.interviewType, params.interviewTypes))
  const hrOnly = allowedKinds.size === 1 && allowedKinds.has('hr')
  const allowsHr = allowedKinds.has('hr')

  const coding =
    params.interviewType === 'coding' ||
    String(params.preferredQuestionFormat || params.interviewSetup?.preferredQuestionFormat || '')
      .toLowerCase() === 'coding'

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]

    if (coding) {
      if (q.kind !== 'coding') {
        issues.push({ level: 'error', index: i, message: 'Coding rounds require kind "coding".' })
      }
      if (!q.starterCode?.trim()) {
        issues.push({ level: 'error', index: i, message: 'Coding question missing starterCode.' })
      }
      if (!q.publicTests?.length) {
        issues.push({ level: 'warning', index: i, message: 'Coding question has no public tests.' })
      }
      if (q.type !== 'technical') {
        issues.push({ level: 'error', index: i, message: 'Coding questions must be type technical.' })
      }
    }

    if (params.difficulty !== 'Adaptive' && q.difficulty !== params.difficulty) {
      issues.push({
        level: coding ? 'warning' : 'error',
        index: i,
        message: `Question difficulty must be "${params.difficulty}".`,
      })
    }

    if (q.type !== 'technical' && q.type !== 'behavioral' && q.type !== 'hr') {
      issues.push({ level: 'error', index: i, message: 'Question type must be technical, behavioral, or hr.' })
    }

    if (hrOnly && q.type !== 'hr') {
      issues.push({ level: 'error', index: i, message: 'HR interview questions must use type "hr".' })
    }

    if (!allowsHr && q.type === 'hr') {
      issues.push({ level: 'error', index: i, message: 'Question type "hr" is only valid when Screening HR is selected.' })
    }

    if (coding) {
      // coding rounds are always technical; skip spoken-type constraints
    } else if (allowedKinds.size > 0 && !allowedKinds.has(q.type)) {
      issues.push({
        level: 'error',
        index: i,
        message: `Question type "${q.type}" is not in the selected interview types.`,
      })
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

    if (!allowsHr && GENERIC_PATTERNS.some((re) => re.test(q.question))) {
      issues.push({ level: 'warning', index: i, message: 'Question looks generic; consider regenerating.' })
    }

    if (topicSet.size > 0 && !topicSet.has(q.topic.trim())) {
      issues.push({
        level: coding ? 'warning' : 'error',
        index: i,
        message: `Topic "${q.topic}" is outside the resolved topic bank.`,
      })
    }
  }

  return issues
}
