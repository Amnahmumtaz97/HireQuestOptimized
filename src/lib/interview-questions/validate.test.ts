import { describe, expect, it } from 'vitest'
import { validateGeneratedQuestions } from '@/lib/interview-questions/validate'
import type { InterviewQuestionItem } from '@/lib/interview-questions/schema'
import type { InterviewGenerationParams } from '@/lib/interview-questions/prompt'

function params(overrides: Partial<InterviewGenerationParams>): InterviewGenerationParams {
  return {
    industryKey: 'software',
    roleCategoryKey: 'backend',
    interviewType: 'technical',
    topics: ['Scalability', 'Caching'],
    difficulty: 'Medium',
    totalQuestions: 2,
    technicalQuestionRatio: 80,
    ...overrides,
  }
}

function question(overrides: Partial<InterviewQuestionItem>): InterviewQuestionItem {
  return {
    question: 'Design a service that turns long URLs into short codes and redirects quickly.',
    type: 'technical',
    topic: 'Scalability',
    difficulty: 'Medium',
    kind: 'spoken',
    rubric: 'technical',
    keyPoints: [{ text: 'a' }],
    ...overrides,
  }
}

const errorsOf = (issues: ReturnType<typeof validateGeneratedQuestions>) =>
  issues.filter((i) => i.level === 'error').map((i) => i.message)

describe('validateGeneratedQuestions — kinds vs types', () => {
  it('accepts technical questions in a system_design-only session (no system_design type exists)', () => {
    const issues = validateGeneratedQuestions(
      [
        question({ rubric: 'system_design' }),
        question({
          topic: 'Caching',
          rubric: 'system_design',
          question: 'Design a multi-layer cache for a read-heavy product catalogue.',
        }),
      ],
      params({ interviewType: 'system_design' }),
    )
    expect(errorsOf(issues)).toEqual([])
  })

  it('accepts technical questions when system_design is one of several selected kinds', () => {
    const issues = validateGeneratedQuestions(
      [
        question({}),
        question({
          type: 'behavioral',
          topic: 'Caching',
          rubric: 'behavioral',
          question: 'Tell me about a time a caching decision you made went wrong.',
        }),
      ],
      params({ interviewType: 'mixed', interviewTypes: ['behavioral', 'system_design'] }),
    )
    expect(errorsOf(issues)).toEqual([])
  })

  it('still rejects a type the session did not select', () => {
    const issues = validateGeneratedQuestions(
      [question({ type: 'hr', rubric: 'hr' })],
      params({ interviewType: 'technical' }),
    )
    expect(errorsOf(issues).some((m) => /only valid when Screening HR/.test(m))).toBe(true)
  })

  it('warns, never errors, when a question has no answer key', () => {
    const issues = validateGeneratedQuestions(
      [question({ rubric: undefined, keyPoints: undefined })],
      params({}),
    )
    expect(errorsOf(issues)).toEqual([])
    expect(issues.some((i) => i.level === 'warning' && /no answer key/.test(i.message))).toBe(true)
  })
})
