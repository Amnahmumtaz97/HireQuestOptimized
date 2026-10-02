import { createHash } from 'crypto'
import type { EvalQuestion, Rubric } from '@/lib/evaluation/types'

/**
 * Bump when a rubric prompt or scoring rule changes so existing evaluations are
 * re-graded rather than reused (§21). The version is stored on every evaluation.
 */
export const PROMPT_VERSION = 'eval-v1'

/**
 * §10 ④ — idempotency key. Includes the answer key text as well as the answer,
 * so a regenerated question with the same wording is not matched against a stale grade.
 */
export function answerHash(answer: string, rubric: Rubric, question: Pick<EvalQuestion, 'keyPoints' | 'redFlags'>): string {
  const key = [
    ...(question.keyPoints ?? []).map((k) => k.text),
    '|',
    ...(question.redFlags ?? []),
  ].join('\n')
  return createHash('sha256')
    .update(`${PROMPT_VERSION}\u0000${rubric}\u0000${answer}\u0000${key}`)
    .digest('hex')
}
