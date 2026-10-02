import { describe, expect, it } from 'vitest'
import { normalizeAnswerKey } from '@/lib/interview-questions/answer-keys'
import { parseGeminiQuestionJsonArray } from '@/lib/interview-questions/parse-gemini-json'
import { keyPointsFromDiscuss, systemDesignAnswerKey, SYSTEM_DESIGN_PROBLEM_BANK } from '@/lib/interview-questions/system-design-templates'
import { buildLeetCodeCodingQuestions } from '@/lib/interview-questions/coding-templates'
import { redactSessionForClient } from '@/lib/evaluation/redact'

describe('normalizeAnswerKey', () => {
  it('pads thin keys to at least three points and fills type-specific extras', () => {
    const key = normalizeAnswerKey({ keyPoints: ['Only one'] }, 'technical', 'Caching')
    expect(key.keyPoints.length).toBeGreaterThanOrEqual(3)
    expect(key.keyPoints[0].text).toBe('Only one')
    expect(key.redFlags.length).toBeGreaterThan(0)

    const coding = normalizeAnswerKey(null, 'coding', 'Arrays')
    expect(coding.expectedComplexity).toBeDefined()
    expect(coding.edgeCases?.length).toBeGreaterThan(0)

    const behavioral = normalizeAnswerKey({ keyPoints: [] }, 'behavioral', 'Conflict resolution')
    expect(behavioral.competency).toBe('Conflict resolution')
  })

  it('survives the sloppy shapes a model actually returns', () => {
    // The exact failure seen in production: a 46-character complexity string.
    const longTime = normalizeAnswerKey(
      { expectedComplexity: { time: 'O(n) where n is the length of the input array', space: 'O(1) constant' } },
      'coding',
      'Arrays',
    )
    expect(longTime.expectedComplexity).toEqual({ time: 'O(n)', space: 'O(1)' })

    const asString = normalizeAnswerKey({ expectedComplexity: 'O(n log n) time and O(n) space' }, 'coding', 'Sorting')
    expect(asString.expectedComplexity).toEqual({ time: 'O(n log n)', space: 'O(n)' })

    const objects = normalizeAnswerKey(
      {
        keyPoints: [{ point: 'Uses a hash map' }, { description: 'Single pass' }, 'Returns indices'],
        redFlags: [{ flag: 'Hard-codes outputs' }],
        edgeCases: [{ case: 'Empty input' }, 42, null],
        expectedComplexity: null,
      },
      'coding',
      'Hashing',
    )
    expect(objects.keyPoints.map((k) => k.text)).toEqual(['Uses a hash map', 'Single pass', 'Returns indices'])
    expect(objects.redFlags).toEqual(['Hard-codes outputs'])
    expect(objects.edgeCases).toEqual(['Empty input'])
    expect(objects.expectedComplexity).toEqual({ time: 'O(n)', space: 'O(n)' })

    // Nothing the model produces can exceed the strict schema limits.
    const huge = normalizeAnswerKey({ keyPoints: Array.from({ length: 20 }, (_, i) => 'x'.repeat(500) + i) }, 'technical', 'T')
    expect(huge.keyPoints.length).toBeLessThanOrEqual(8)
    expect(huge.keyPoints.every((k) => k.text.length <= 300)).toBe(true)
  })

  it('tags system design points with a dimension', () => {
    const key = normalizeAnswerKey({ keyPoints: ['Estimates QPS from stated volumes', 'Hash vs counter trade-off'] }, 'system_design', 'Scalability')
    expect(key.keyPoints[0].dimension).toBe('scale')
    expect(key.keyPoints[1].dimension).toBe('tradeoffs')
    expect(key.keyPoints.every((k) => k.dimension)).toBe(true)
  })
})

describe('parseGeminiQuestionJsonArray', () => {
  it('never fails a batch because of a malformed answer key', () => {
    const raw = JSON.stringify([
      {
        question: 'Q1',
        topic: 'Arrays',
        type: 'technical',
        difficulty: 'Easy',
        expectedComplexity: 'O(n) time',
        keyPoints: [{ point: 'a' }],
        redFlags: [{ flag: 'r' }],
        edgeCases: 'not an array',
        scaleHints: [1, 2],
      },
    ])
    const [item] = parseGeminiQuestionJsonArray(raw)
    expect(item.question).toBe('Q1')
    expect(item.expectedComplexity).toBe('O(n) time')
    expect(item.edgeCases).toBeUndefined()
    const key = normalizeAnswerKey(item, 'coding', 'Arrays')
    expect(key.expectedComplexity.time).toBe('O(n)')
  })
})

describe('system design templates', () => {
  it('turns the Discuss list into tagged key points', () => {
    const url = SYSTEM_DESIGN_PROBLEM_BANK.find((t) => t.id === 'sd-url-shortener')!
    const points = keyPointsFromDiscuss(url.question)
    expect(points.length).toBe(4)
    expect(points[0].text).toMatch(/API design and ID generation/)
    const key = systemDesignAnswerKey(url)
    const dims = new Set(key.keyPoints.map((k) => k.dimension))
    expect(dims.has('requirements')).toBe(true)
    expect(dims.has('scale')).toBe(true)
    expect(dims.has('tradeoffs')).toBe(true)
    expect(key.scaleHints?.some((h) => /10B/.test(h))).toBe(true)
  })

  it('every bank entry produces a usable key', () => {
    for (const tpl of SYSTEM_DESIGN_PROBLEM_BANK) {
      const key = systemDesignAnswerKey(tpl)
      expect(key.keyPoints.length).toBeGreaterThanOrEqual(3)
      expect(key.keyPoints.length).toBeLessThanOrEqual(8)
    }
  })
})

describe('coding templates', () => {
  it('carry a rubric and an answer key', () => {
    const qs = buildLeetCodeCodingQuestions({ topics: ['Arrays'], totalQuestions: 5, difficulty: 'Adaptive' })
    for (const q of qs) {
      expect(q.rubric).toBe('coding')
      expect(q.expectedComplexity?.time).toMatch(/^O\(/)
      expect(q.edgeCases?.length).toBeGreaterThan(0)
    }
  })
})

describe('redactSessionForClient', () => {
  it('strips the answer key while a session is open and keeps it once completed', () => {
    const doc = {
      status: 'in_progress',
      questions: [{ question: 'q', keyPoints: [{ text: 'a' }], redFlags: ['r'], hiddenTests: [{ input: '1', expected: '1' }], publicTests: [] }],
    }
    const open = redactSessionForClient(doc)
    expect(open.questions?.[0]).not.toHaveProperty('keyPoints')
    expect(open.questions?.[0]).not.toHaveProperty('hiddenTests')
    expect(open.questions?.[0]).toHaveProperty('publicTests')
    const done = redactSessionForClient({ ...doc, status: 'completed' })
    expect(done.questions?.[0]).toHaveProperty('keyPoints')
  })
})
