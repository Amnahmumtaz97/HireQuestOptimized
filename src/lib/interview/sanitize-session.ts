/**
 * Strips fields that must never reach the browser from interview session
 * documents: hidden test inputs/expected values (assessment integrity) and
 * the raw resume context (PII). Exposes only a hidden-test count so the UI
 * can still show totals.
 */

type QuestionLike = Record<string, unknown> & {
  hiddenTests?: Array<{ input?: string; expected?: string }>
}

type SessionLike = Record<string, unknown> & {
  questions?: QuestionLike[]
  resumeContext?: unknown
}

export function sanitizeSessionForClient<T extends SessionLike>(
  doc: T,
): Omit<T, 'resumeContext'> {
  const { resumeContext: _resumeContext, ...rest } = doc
  const questions = Array.isArray(doc.questions)
    ? doc.questions.map((q) => {
        const { hiddenTests, ...qRest } = q
        return {
          ...qRest,
          hiddenTestCount: Array.isArray(hiddenTests) ? hiddenTests.length : 0,
        }
      })
    : doc.questions
  return { ...rest, questions } as Omit<T, 'resumeContext'>
}

export function sanitizeSessionsForClient<T extends SessionLike>(docs: T[]) {
  return docs.map((d) => sanitizeSessionForClient(d))
}
