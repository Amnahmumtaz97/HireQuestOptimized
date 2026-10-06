/**
 * A retake is a new session with the same questions already attached.
 * Nothing is sent to the question generator.
 */

const OMITTED_SESSION_FIELDS = new Set([
  '_id',
  '__v',
  'createdAt',
  'updatedAt',
  'answers',
  'evaluation',
  'evaluationStatus',
  'evaluationStartedAt',
  'evaluationError',
  'currentQuestionIndex',
  'flaggedQuestionIndexes',
  'interviewStartedAt',
  'status',
  'questions',
])

function withoutIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutIds)
  if (!value || typeof value !== 'object') return value
  const copy: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === '_id' || key === '__v') continue
    copy[key] = withoutIds(child)
  }
  return copy
}

export function retakeSessionPayload(
  source: Record<string, unknown>,
  userId: string,
): Record<string, unknown> | null {
  const questions = Array.isArray(source.questions) ? source.questions : []
  if (questions.length === 0) return null

  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(source)) {
    if (OMITTED_SESSION_FIELDS.has(key)) continue
    rest[key] = value
  }

  return {
    ...rest,
    userId,
    questions: questions.map(withoutIds),
    questionSource: source.questionSource,
    status: 'created',
    currentQuestionIndex: 0,
    flaggedQuestionIndexes: [],
    answers: [],
    evaluationStatus: 'none',
    evaluationStartedAt: null,
    evaluationError: null,
    evaluation: null,
    interviewStartedAt: null,
  }
}
