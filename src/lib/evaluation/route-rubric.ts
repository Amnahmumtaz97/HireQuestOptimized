import type { EvalQuestion, Rubric } from '@/lib/evaluation/types'

/**
 * §7 — one question, one rubric. Preferred source is the `rubric` recorded at
 * generation time; the fallback rules exist for sessions created before it was stored.
 */
export function routeRubric(
  question: Pick<EvalQuestion, 'kind' | 'type' | 'rubric'>,
  session?: { interviewType?: string | null; interviewTypes?: string[] | null },
): Rubric {
  if (question.kind === 'coding') return 'coding'
  if (question.type === 'behavioral') return 'behavioral'
  if (question.type === 'hr') return 'hr'
  if (question.rubric === 'system_design' || question.rubric === 'technical') return question.rubric
  if (isSystemDesignOnlySession(session)) return 'system_design'
  return 'technical'
}

function isSystemDesignOnlySession(session?: {
  interviewType?: string | null
  interviewTypes?: string[] | null
}): boolean {
  if (!session) return false
  if (session.interviewType === 'system_design') return true
  const kinds = session.interviewTypes ?? []
  return kinds.length === 1 && kinds[0] === 'system_design'
}

/** Whether a session's selected kinds include system design at all (mixed sessions). */
export function sessionAllowsSystemDesign(session?: {
  interviewType?: string | null
  interviewTypes?: string[] | null
}): boolean {
  if (!session) return false
  if (session.interviewType === 'system_design') return true
  return (session.interviewTypes ?? []).includes('system_design')
}
