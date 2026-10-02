import type { EvaluationFlag, Rubric } from '@/lib/evaluation/types'
import { countWords, tokenize } from '@/lib/evaluation/text-signals'

/**
 * §10 — per-rubric minimum real words before an answer is worth grading.
 * The gate exists to stop junk ("x", "idk") reaching the judge, not to punish
 * brevity: a short correct answer is scored on its depth level, not zeroed.
 */
export const MIN_WORDS: Record<Exclude<Rubric, 'coding'>, number> = {
  technical: 8,
  behavioral: 15,
  system_design: 15,
  hr: 5,
}

export type GateResult = { ok: true } | { ok: false; flag: EvaluationFlag; reason: string }

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'is', 'are', 'was',
  'were', 'be', 'it', 'this', 'that', 'you', 'your', 'how', 'what', 'why', 'when', 'would',
  'do', 'does', 'did', 'about', 'me', 'tell', 'describe', 'explain', 'at', 'as', 'by', 'from',
])

function contentTokens(text: string): string[] {
  return tokenize(text).filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

/**
 * Echo: more than 70% of the answer's content tokens also appear in the question
 * AND the answer is under 1.5× the question's length — they read it back.
 */
export function isEcho(answer: string, question: string): boolean {
  const a = contentTokens(answer)
  if (a.length === 0) return false
  const q = new Set(contentTokens(question))
  if (q.size === 0) return false
  const overlap = a.filter((t) => q.has(t)).length / a.length
  const lengthRatio = tokenize(answer).length / Math.max(1, tokenize(question).length)
  return overlap > 0.7 && lengthRatio < 1.5
}

const WORD_LIKE = /^[a-z]{2,}$/
const HAS_VOWEL = /[aeiouy]/

/** Gibberish: fewer than 60% of tokens look like real words (alphabetic, ≥2 letters, has a vowel). */
export function isGibberish(answer: string): boolean {
  const tokens = tokenize(answer)
  if (tokens.length === 0) return true
  const wordLike = tokens.filter((t) => {
    const clean = t.replace(/'/g, '')
    // Numbers are legitimate content ("115k rps"), not gibberish.
    if (/^\d+[a-z%]*$/.test(clean)) return true
    return WORD_LIKE.test(clean) && HAS_VOWEL.test(clean)
  }).length
  return wordLike / tokens.length < 0.6
}

export function gateSpokenAnswer(
  rubric: Exclude<Rubric, 'coding'>,
  answer: string,
  question: string,
): GateResult {
  const words = countWords(answer)
  const min = MIN_WORDS[rubric]
  if (words < min) {
    return { ok: false, flag: 'too_short', reason: `Answer has ${words} words; at least ${min} are needed for a ${rubric} question.` }
  }
  if (isGibberish(answer)) {
    return { ok: false, flag: 'gibberish', reason: 'Answer does not look like real language.' }
  }
  if (isEcho(answer, question)) {
    return { ok: false, flag: 'echoed_question', reason: 'Answer mostly repeats the question back.' }
  }
  return { ok: true }
}

function normalizeCode(code: string): string {
  return code.replace(/\s+/g, ' ').trim()
}

/** True when a function named `functionName` is declared or assigned somewhere in the code. */
export function definesFunction(code: string, functionName: string): boolean {
  const name = functionName.replace(/[^\w$]/g, '')
  if (!name) return false
  const escaped = name.replace(/\$/g, '\\$')
  return new RegExp(
    `(function\\s+${escaped}\\s*\\(|(?:const|let|var)\\s+${escaped}\\s*=|${escaped}\\s*=\\s*(?:async\\s*)?(?:function|\\()|${escaped}\\s*=\\s*[\\w$]+\\s*=>)`,
  ).test(code)
}

/** §10 — coding gate: the code must differ from the starter and define the target function. */
export function gateCodingAnswer(
  code: string,
  starterCode: string | undefined,
  functionName: string,
): GateResult {
  if (!code.trim()) {
    return { ok: false, flag: 'no_solution', reason: 'No code was submitted.' }
  }
  if (starterCode && normalizeCode(code) === normalizeCode(starterCode)) {
    return { ok: false, flag: 'no_solution', reason: 'The starter code was submitted unchanged.' }
  }
  if (!definesFunction(code, functionName)) {
    return { ok: false, flag: 'no_solution', reason: `No function named "${functionName}" was defined.` }
  }
  return { ok: true }
}
