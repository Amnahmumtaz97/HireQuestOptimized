import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'
import { assignTopicsEvenly } from '@/lib/interview-scope'
import { cleanQuestionText } from '@/lib/interview-questions/clean-question-text'
import { difficultyForQuestionIndex } from '@/lib/interview-questions/difficulty'
import {
  decodeInterviewTypeKinds,
  type InterviewTypeKind,
} from '@/lib/interview-types'
import { buildLeetCodeCodingQuestions } from '@/lib/interview-questions/coding-templates'
import { buildSystemDesignQuestions } from '@/lib/interview-questions/system-design-templates'
import { assertConfirmedTopics } from '@/lib/interview-config/assert-selection'

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

  const toQuestionType = (k: InterviewTypeKind): 'technical' | 'behavioral' | 'hr' => {
    if (k === 'behavioral') return 'behavioral'
    if (k === 'hr') return 'hr'
    return 'technical' // technical, coding, system_design
  }

  if (kinds.length === 1) {
    return Array.from({ length: total }, () => toQuestionType(kinds[0]))
  }

  const counts = allocateKindCounts(kinds, total, technicalRatio)
  return roundRobinKinds(kinds, counts, total).map(toQuestionType)
}

function allocateKindCounts(
  kinds: InterviewTypeKind[],
  total: number,
  technicalRatio: number,
): Map<InterviewTypeKind, number> {
  const counts = new Map<InterviewTypeKind, number>()
  const hasTechnical = kinds.some((k) =>
    k === 'technical' || k === 'coding' || k === 'system_design',
  )
  const others = kinds.filter(
    (k) => k !== 'technical' && k !== 'coding' && k !== 'system_design',
  )

  if (hasTechnical && others.length > 0) {
    const tech = Math.min(Math.max(Math.round(total * (technicalRatio / 100)), 0), total)
    const techKinds = kinds.filter(
      (k) => k === 'technical' || k === 'coding' || k === 'system_design',
    )
    const perTech = Math.floor(tech / techKinds.length)
    let remTech = tech - perTech * techKinds.length
    for (const k of techKinds) {
      const extra = remTech > 0 ? 1 : 0
      if (remTech > 0) remTech -= 1
      counts.set(k, perTech + extra)
    }
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
  const coding =
    params.interviewType === 'coding' ||
    String(params.preferredQuestionFormat || params.interviewSetup?.preferredQuestionFormat || '')
      .toLowerCase() === 'coding'

  const systemDesign =
    params.interviewType === 'system_design' ||
    (Array.isArray(params.interviewTypes) &&
      params.interviewTypes.length === 1 &&
      params.interviewTypes[0] === 'system_design')

  const { topics, difficulty, totalQuestions, interviewType, technicalQuestionRatio, interviewTypes } =
    params
  const topicList = assertConfirmedTopics(topics)

  if (coding) {
    return buildLeetCodeCodingQuestions({
      topics: topicList,
      totalQuestions,
      difficulty,
    })
  }

  if (systemDesign) {
    return buildSystemDesignQuestions({
      topics: topicList,
      totalQuestions,
      difficulty,
    })
  }

  const kinds = allocateKinds(interviewType, totalQuestions, technicalQuestionRatio, interviewTypes)
  const assignedTopics = assignTopicsEvenly(totalQuestions, topicList)

  return kinds.map((kind, i) => {
    const topic = assignedTopics[i] ?? topicList[i % topicList.length]
    const questionDifficulty = difficultyForQuestionIndex(difficulty, i)
    const draft =
      kind === 'technical'
        ? `Explain a practical challenge involving "${topic}" at ${questionDifficulty} difficulty, including how you would implement and test your solution.`
        : kind === 'hr'
          ? `In an HR interview at ${questionDifficulty} difficulty, discuss "${topic}" with a concrete example tied to your experience.`
          : `Describe a concrete situation related to "${topic}" at ${questionDifficulty} difficulty: your actions, stakeholders involved, and what you learned.`
    return {
      type: kind,
      topic,
      difficulty: questionDifficulty,
      question: cleanQuestionText(draft),
      kind: 'spoken' as const,
    }
  })
}
