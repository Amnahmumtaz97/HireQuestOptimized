import { describe, expect, it } from 'vitest'
import { retakeSessionPayload } from './retake'

describe('retakeSessionPayload', () => {
  const source = {
    _id: 'session-1',
    userId: 'user-1',
    interviewType: 'behavioral',
    topics: ['Leadership'],
    difficulty: 'Medium',
    totalQuestions: 1,
    questionSource: 'gemini',
    status: 'completed',
    currentQuestionIndex: 0,
    flaggedQuestionIndexes: [0],
    interviewStartedAt: '2026-01-01T00:00:00.000Z',
    answers: [{ index: 0, answer: 'I led the migration.' }],
    evaluationStatus: 'ready',
    evaluation: { contentScore: 80 },
    questions: [
      {
        _id: 'q1',
        type: 'behavioral',
        topic: 'Leadership',
        question: 'Tell me about a time you led a project.',
        difficulty: 'Medium',
        kind: 'spoken',
        keyPoints: [{ _id: 'kp1', text: 'Names a project' }],
        idealAnswerSummary: 'A specific leadership story.',
      },
    ],
  }

  it('reuses the same questions and drops the previous attempt', () => {
    const payload = retakeSessionPayload(source, 'user-1')
    expect(payload).not.toBeNull()
    expect(payload?.status).toBe('created')
    expect(payload?.answers).toEqual([])
    expect(payload?.evaluation).toBeNull()
    expect(payload?.evaluationStatus).toBe('none')
    expect(payload?.flaggedQuestionIndexes).toEqual([])
    expect(payload?.interviewStartedAt).toBeNull()
    expect(payload?.interviewType).toBe('behavioral')
    expect(payload?.questionSource).toBe('gemini')

    const questions = payload?.questions as Array<Record<string, unknown>>
    expect(questions).toHaveLength(1)
    expect(questions[0]?.question).toBe('Tell me about a time you led a project.')
    expect(questions[0]?.idealAnswerSummary).toBe('A specific leadership story.')
    expect(questions[0]?._id).toBeUndefined()
    expect((questions[0]?.keyPoints as Array<Record<string, unknown>>)[0]?._id).toBeUndefined()
    expect(payload?._id).toBeUndefined()
  })

  it('refuses a session that has nothing to reuse', () => {
    expect(retakeSessionPayload({ ...source, questions: [] }, 'user-1')).toBeNull()
    expect(retakeSessionPayload({ ...source, questions: undefined }, 'user-1')).toBeNull()
  })
})
