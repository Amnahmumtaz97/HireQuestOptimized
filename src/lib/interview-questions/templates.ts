import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import { assignTopicsEvenly } from '@/lib/interview-scope'
import { cleanQuestionText } from '@/lib/interview-questions/clean-question-text'
import { difficultyForQuestionIndex } from '@/lib/interview-questions/difficulty'
import {
  decodeInterviewTypeKinds,
  type InterviewTypeKind,
} from '@/lib/interview-types'

export function allocateKinds(
  interviewType: InterviewGenerationParams['interviewType'],
  total: number,
  technicalRatio: number,
  interviewTypes?: InterviewGenerationParams['interviewTypes'],
): Array<'technical' | 'behavioral' | 'hr'> {
  const kinds = decodeInterviewTypeKinds(interviewType, interviewTypes)
  if (kinds.length === 0 || total <= 0) {
    return Array.from({ length: Math.max(total, 0) }, () => 'technical')
  }
  if (kinds.length === 1) {
    return Array.from({ length: total }, () => kinds[0])
  }

  const counts = allocateKindCounts(kinds, total, technicalRatio)
  return roundRobinKinds(kinds, counts, total)
}

function allocateKindCounts(
  kinds: InterviewTypeKind[],
  total: number,
  technicalRatio: number,
): Map<InterviewTypeKind, number> {
  const counts = new Map<InterviewTypeKind, number>()
  const hasTechnical = kinds.includes('technical')
  const others = kinds.filter((k) => k !== 'technical')

  if (hasTechnical && others.length > 0) {
    const tech = Math.min(Math.max(Math.round(total * (technicalRatio / 100)), 0), total)
    counts.set('technical', tech)
    const remaining = total - tech
    const base = Math.floor(remaining / others.length)
    let rem = remaining % others.length
    for (const kind of others) {
      const extra = rem > 0 ? 1 : 0
      if (rem > 0) rem -= 1
      counts.set(kind, base + extra)
    }
    return counts
  }

  const base = Math.floor(total / kinds.length)
  let rem = total % kinds.length
  for (const kind of kinds) {
    const extra = rem > 0 ? 1 : 0
    if (rem > 0) rem -= 1
    counts.set(kind, base + extra)
  }
  return counts
}

function roundRobinKinds(
  kinds: InterviewTypeKind[],
  counts: Map<InterviewTypeKind, number>,
  total: number,
): InterviewTypeKind[] {
  const remaining = new Map(counts)
  const out: InterviewTypeKind[] = []
  while (out.length < total) {
    let progressed = false
    for (const kind of kinds) {
      const left = remaining.get(kind) ?? 0
      if (left <= 0) continue
      out.push(kind)
      remaining.set(kind, left - 1)
      progressed = true
      if (out.length >= total) break
    }
    if (!progressed) break
  }
  return out
}

export function buildTemplateQuestions(params: InterviewGenerationParams): InterviewQuestionItem[] {
  const { topics, difficulty, totalQuestions, interviewType, technicalQuestionRatio, interviewTypes } =
    params
  const kinds = allocateKinds(interviewType, totalQuestions, technicalQuestionRatio, interviewTypes)
  const assignedTopics = assignTopicsEvenly(totalQuestions, topics)

  return kinds.map((kind, i) => {
    const topic = assignedTopics[i] ?? 'General'
    const questionDifficulty = difficultyForQuestionIndex(difficulty, i)
    const draft =
      kind === 'technical'
        ? `For "${topic}" at ${questionDifficulty} difficulty: describe how you would approach a realistic scenario, key trade-offs, and how you would validate your solution.`
        : kind === 'hr'
          ? `For "${topic}" at ${questionDifficulty} difficulty: answer as you would in a real HR interview. Be specific, professional, and tie your response to the role, department, and your experience.`
          : `For "${topic}" at ${questionDifficulty} difficulty: describe a concrete situation, your actions, stakeholders involved, and what you learned.`
    return {
      type: kind,
      topic,
      difficulty: questionDifficulty,
      question: cleanQuestionText(draft),
    }
  })
}
