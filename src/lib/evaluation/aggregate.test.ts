import { describe, expect, it } from 'vitest'
import { aggregateSession } from '@/lib/evaluation/aggregate'
import type { EvalQuestion, QuestionEvaluation, Rubric } from '@/lib/evaluation/types'

function q(topic: string, difficulty: EvalQuestion['difficulty'], rubric: Rubric): EvalQuestion {
  return { question: `Q about ${topic}`, type: 'technical', topic, difficulty, rubric, keyPoints: [{ text: 'a' }, { text: 'b' }] }
}

function ev(rubric: Rubric, contentScore: number | null, deliveryScore: number | null, extra: Partial<QuestionEvaluation> = {}): QuestionEvaluation {
  return {
    rubric,
    contentScore,
    deliveryScore,
    scores: {},
    levels: {},
    keyPointsHit: [],
    keyPointsPartial: [],
    keyPointsMissed: [],
    factualErrors: [],
    capsApplied: [],
    rationale: '',
    tips: [],
    flags: [],
    answerHash: 'h',
    promptVersion: 'eval-v1',
    evaluatedAt: new Date(),
    aiGraded: true,
    ...extra,
  }
}

describe('aggregateSession (§18 worked example)', () => {
  it('weights by difficulty, counts unanswered as 0, averages delivery plainly', () => {
    const questions = [
      q('Node.js', 'Medium', 'technical'),
      q('Arrays', 'Hard', 'coding'),
      q('Conflict', 'Easy', 'behavioral'),
      q('Scalability', 'Hard', 'system_design'),
    ]
    const evaluations = new Map<number, QuestionEvaluation>([
      [0, ev('technical', 77, 67)],
      [1, ev('coding', 78, null)],
      [2, ev('behavioral', 78, 81)],
      [3, ev('system_design', 0, null, { flags: ['unanswered'], aiGraded: false })],
    ])
    const s = aggregateSession({ questions, evaluations })
    expect(s.contentScore).toBe(55)
    expect(s.deliveryScore).toBe(74)
    expect(s.answeredCount).toBe(3)
    expect(s.byTopic).toEqual({ 'Node.js': 77, Arrays: 78, Conflict: 78, Scalability: 0 })
    expect(s.byRubric.coding).toBe(78)
    expect(s.gaps).toContain('Scalability')
    expect(s.nextTopics).toEqual(['Scalability'])
    expect(s.pathEligible).toBe(true)
  })

  it('excludes ungradable questions from the average and from path eligibility', () => {
    const questions = [q('A', 'Easy', 'technical'), q('B', 'Easy', 'technical')]
    const evaluations = new Map<number, QuestionEvaluation>([
      [0, ev('technical', 90, null)],
      [1, ev('technical', null, null, { flags: ['no_answer_key'], aiGraded: false })],
    ])
    const s = aggregateSession({ questions, evaluations })
    expect(s.contentScore).toBe(90)
    expect(s.ungradableCount).toBe(1)
    expect(s.pathEligible).toBe(false)
  })

  it('returns null scores when nothing could be graded', () => {
    const questions = [q('A', 'Easy', 'technical')]
    const evaluations = new Map<number, QuestionEvaluation>([[0, ev('technical', null, null, { aiGraded: false })]])
    const s = aggregateSession({ questions, evaluations })
    expect(s.contentScore).toBeNull()
    expect(s.deliveryScore).toBeNull()
    expect(s.pathEligible).toBe(false)
  })

  it('ranks next topics by weight × distance below 60', () => {
    const questions = [q('Easy topic', 'Easy', 'technical'), q('Hard topic', 'Hard', 'technical')]
    const evaluations = new Map<number, QuestionEvaluation>([
      [0, ev('technical', 30, null)],
      [1, ev('technical', 45, null)],
    ])
    const s = aggregateSession({ questions, evaluations })
    // Easy: 1.0 × 30 = 30; Hard: 1.6 × 15 = 24 → Easy topic first.
    expect(s.nextTopics).toEqual(['Easy topic', 'Hard topic'])
  })
})
