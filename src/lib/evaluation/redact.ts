/**
 * §4 security note — the answer key must never reach the browser while a session
 * is open. Hidden test inputs are treated the same way (§12).
 */
const ANSWER_KEY_FIELDS = [
  'keyPoints',
  'redFlags',
  'idealAnswerSummary',
  'competency',
  'expectedComplexity',
  'edgeCases',
  'scaleHints',
  'hiddenTests',
] as const

type SessionLike = {
  status?: string
  questions?: object[] | null
}

/** Returns a copy safe to send to the client: answer keys are stripped until the session is completed. */
export function redactSessionForClient<T extends SessionLike>(doc: T): T {
  if (!doc || doc.status === 'completed' || !Array.isArray(doc.questions)) return doc
  const questions = doc.questions.map((q) => {
    const copy: Record<string, unknown> = { ...(q as Record<string, unknown>) }
    for (const field of ANSWER_KEY_FIELDS) delete copy[field]
    return copy
  })
  return { ...doc, questions } as T
}

export function redactSessionsForClient<T extends SessionLike>(docs: T[]): T[] {
  return docs.map((d) => redactSessionForClient(d))
}
