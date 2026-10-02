import { describe, expect, it, vi } from 'vitest'
import { evaluateSession } from '@/lib/evaluation/evaluate-session'
import type { JudgeFn } from '@/lib/evaluation/gemini-judge'
import type { JudgeObservation } from '@/lib/evaluation/parse'
import type { EvalAnswer, EvalQuestion } from '@/lib/evaluation/types'
import { answerHash } from '@/lib/evaluation/hash'

const TECH: EvalQuestion = {
  question: 'How would you handle a memory leak in a Node service?',
  type: 'technical',
  topic: 'Node.js',
  difficulty: 'Medium',
  rubric: 'technical',
  keyPoints: [{ text: 'Identifies symptoms' }, { text: 'Names a tool' }, { text: 'Verifies the fix' }],
  redFlags: ['Just restarts the server'],
}

const CODING: EvalQuestion = {
  question: 'Implement twoSum',
  type: 'technical',
  topic: 'Arrays',
  difficulty: 'Easy',
  kind: 'coding',
  rubric: 'coding',
  functionName: 'twoSum',
  language: 'javascript',
  starterCode: 'function twoSum(nums, target) {\n}\n',
  publicTests: [{ input: '[[2,7,11,15],9]', expected: '[0,1]' }],
  hiddenTests: [{ input: '[[3,3],6]', expected: '[0,1]' }],
  expectedComplexity: { time: 'O(n)', space: 'O(n)' },
  edgeCases: ['Duplicates'],
  redFlags: ['Hard-codes outputs'],
}

const GOOD_TECH_ANSWER =
  "First I'd check whether RSS keeps climbing under load, then take a heap snapshot with --inspect and compare two snapshots to see what is retained. Finally I'd run a load test and confirm the heap stays flat."

function judgeReturning(build: (id: number) => Partial<JudgeObservation>): JudgeFn {
  return async (_prompt, ids) => ({
    model: 'mock',
    observations: ids.map((id) => ({
      id,
      keyPoints: [],
      errors: [],
      redFlagsObserved: [],
      levels: {},
      tips: [],
      ...build(id),
    })),
  })
}

const CONTEXT = { roleContext: 'Backend Engineer, FinTech' }
const SESSION = { interviewType: 'mixed', interviewTypes: ['technical', 'coding'] }

describe('evaluateSession', () => {
  it('iterates questions, not answers: an unanswered question scores 0 and is aggregated', async () => {
    const judge = judgeReturning(() => ({
      keyPoints: [
        { index: 0, status: 'hit', evidence: 'check whether RSS keeps climbing' },
        { index: 1, status: 'hit', evidence: 'heap snapshot with --inspect' },
        { index: 2, status: 'hit', evidence: 'run a load test and confirm the heap stays flat' },
      ],
      levels: { depth: 4, precision: 4 },
    }))
    const result = await evaluateSession(
      { questions: [TECH, { ...TECH, topic: 'Other' }], answers: [{ index: 0, answer: GOOD_TECH_ANSWER, inputMode: 'typed' }], session: SESSION, context: CONTEXT },
      { judge },
    )
    expect(result.evaluations.get(0)?.contentScore).toBe(100)
    expect(result.evaluations.get(1)?.flags).toEqual(['unanswered'])
    expect(result.evaluations.get(1)?.contentScore).toBe(0)
    // 100 × 1.3 + 0 × 1.3 over 2.6 → 50
    expect(result.session.contentScore).toBe(50)
  })

  it('gates junk before it reaches the judge', async () => {
    const judge = vi.fn<JudgeFn>(async () => ({ model: 'mock', observations: [] }))
    const result = await evaluateSession(
      { questions: [TECH], answers: [{ index: 0, answer: 'x', inputMode: 'typed' }], session: SESSION, context: CONTEXT },
      { judge },
    )
    expect(judge).not.toHaveBeenCalled()
    expect(result.evaluations.get(0)?.flags).toContain('too_short')
    expect(result.session.contentScore).toBe(0)
  })

  it('re-runs coding tests and never trusts stored counts', async () => {
    const judge = judgeReturning(() => ({ levels: { readability: 3 }, complexity: { time: 'O(n)', space: 'O(n)' }, edgeCases: [{ index: 0, status: 'hit', evidence: 'seen.has' }] }))
    const code = 'function twoSum(nums, target) { const seen = new Map(); for (let i = 0; i < nums.length; i++) { if (seen.has(target - nums[i])) return [seen.get(target - nums[i]), i]; seen.set(nums[i], i) } }'
    const result = await evaluateSession(
      { questions: [CODING], answers: [{ index: 0, answer: code, inputMode: 'coding' }], session: SESSION, context: CONTEXT },
      { judge },
    )
    const ev = result.evaluations.get(0)
    expect(ev?.tests).toMatchObject({ publicPassed: 1, publicTotal: 1, hiddenPassed: 1, hiddenTotal: 1 })
    expect(ev?.scores.tests).toBe(100)
    // 100×0.6 + 100×0.2 + 100×0.1 + 75×0.1 = 97.5 → 98
    expect(ev?.contentScore).toBe(98)
  })

  it('marks a failed batch ai_grading_failed and keeps deterministic parts', async () => {
    const judge: JudgeFn = async () => {
      throw new Error('boom')
    }
    const onQuestionEvaluated = vi.fn(async () => {})
    const result = await evaluateSession(
      { questions: [TECH], answers: [{ index: 0, answer: GOOD_TECH_ANSWER, inputMode: 'typed' }], session: SESSION, context: CONTEXT },
      { judge, onQuestionEvaluated },
    )
    const ev = result.evaluations.get(0)
    expect(ev?.flags).toContain('ai_grading_failed')
    expect(ev?.contentScore).toBeNull()
    expect(ev?.aiGraded).toBe(false)
    expect(result.failures).toHaveLength(1)
    expect(result.session.pathEligible).toBe(false)
    expect(onQuestionEvaluated).toHaveBeenCalledTimes(1)
  })

  it('reuses a stored evaluation when the hash matches, and re-grades when the answer changed', async () => {
    const judge = vi.fn<JudgeFn>(judgeReturning(() => ({ levels: { depth: 2, precision: 2 } })))
    const stored = {
      rubric: 'technical' as const,
      contentScore: 91,
      deliveryScore: null,
      scores: {},
      levels: {},
      keyPointsHit: [],
      keyPointsPartial: [],
      keyPointsMissed: [],
      factualErrors: [],
      capsApplied: [],
      rationale: 'stored',
      tips: [],
      flags: [],
      answerHash: answerHash(GOOD_TECH_ANSWER, 'technical', TECH),
      promptVersion: 'eval-v1',
      evaluatedAt: new Date(),
      aiGraded: true,
    }
    const same: EvalAnswer = { index: 0, answer: GOOD_TECH_ANSWER, inputMode: 'typed', evaluation: stored }
    const reused = await evaluateSession({ questions: [TECH], answers: [same], session: SESSION, context: CONTEXT }, { judge })
    expect(judge).not.toHaveBeenCalled()
    expect(reused.evaluations.get(0)?.contentScore).toBe(91)

    const edited: EvalAnswer = { ...same, answer: GOOD_TECH_ANSWER + ' Also I would add monitoring.' }
    await evaluateSession({ questions: [TECH], answers: [edited], session: SESSION, context: CONTEXT }, { judge })
    expect(judge).toHaveBeenCalledTimes(1)
  })

  it('grades pre-answer-key questions as not gradable but still scores delivery', async () => {
    const judge = vi.fn<JudgeFn>(async () => ({ model: 'mock', observations: [] }))
    const legacy: EvalQuestion = { question: TECH.question, type: 'technical', topic: 'Node.js', difficulty: 'Medium' }
    const spoken: EvalAnswer = {
      index: 0,
      answer: GOOD_TECH_ANSWER,
      inputMode: 'spoken',
      audioConfidence: 0.95,
      delivery: {
        durationSec: 60, speakingSec: 55, wordCount: 140, tokenCount: 142, wordsPerMinute: 140, articulationRate: 150,
        disfluencies: { total: 1, perMinute: 1, breakdown: [] }, crutches: [],
        pauses: { count: 1, totalSec: 2, longestSec: 1.5, averageSec: 2, byTier: { short: 0, medium: 1, long: 0 } }, silenceRatio: 0.03,
      },
    }
    const result = await evaluateSession({ questions: [legacy], answers: [spoken], session: SESSION, context: CONTEXT }, { judge })
    const ev = result.evaluations.get(0)
    expect(judge).not.toHaveBeenCalled()
    expect(ev?.contentScore).toBeNull()
    expect(ev?.flags).toContain('no_answer_key')
    expect(ev?.deliveryScore).toBe(100)
    expect(result.session.deliveryScore).toBe(100)
    expect(result.session.pathEligible).toBe(false)
  })

  it('accepts numbers-as-strings from the judge (parse coercion)', async () => {
    const { parseJudgeBatch } = await import('@/lib/evaluation/parse')
    const raw = JSON.stringify([
      {
        id: '3',
        keyPoints: [{ index: '0', status: 'hit', evidence: 'x'.repeat(700) }],
        errors: [],
        redFlagsObserved: [],
        levels: { depth: '3', precision: 4 },
        tips: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      },
    ])
    const [obs] = parseJudgeBatch(raw, [3])
    expect(obs.id).toBe(3)
    expect(obs.keyPoints[0].index).toBe(0)
    expect(obs.keyPoints[0].evidence?.length).toBe(600)
    expect(obs.levels.depth).toBe(3)
    expect(obs.tips).toHaveLength(5)
  })

  it('batches five per judge call, grouped by rubric', async () => {
    const judge = vi.fn<JudgeFn>(judgeReturning(() => ({ levels: { depth: 2, precision: 2 } })))
    const questions = Array.from({ length: 7 }, (_, i) => ({ ...TECH, topic: `T${i}` }))
    const answers = questions.map((_, i) => ({ index: i, answer: GOOD_TECH_ANSWER, inputMode: 'typed' as const }))
    await evaluateSession({ questions, answers, session: SESSION, context: CONTEXT }, { judge })
    expect(judge).toHaveBeenCalledTimes(2)
    expect(judge.mock.calls[0][1]).toHaveLength(5)
    expect(judge.mock.calls[1][1]).toHaveLength(2)
  })
})
