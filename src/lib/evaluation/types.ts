import type { DeliveryStats } from '@/lib/speech/transcript'

/** One rubric per question — decided at generation time (§7). */
export type Rubric = 'technical' | 'coding' | 'behavioral' | 'system_design' | 'hr'

export const RUBRICS: readonly Rubric[] = [
  'technical',
  'coding',
  'behavioral',
  'system_design',
  'hr',
] as const

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard'

export type SystemDesignDimension = 'requirements' | 'components' | 'scale' | 'tradeoffs'

export type KeyPoint = {
  text: string
  /** System design only — which dimension this point counts toward (§14). */
  dimension?: SystemDesignDimension | string
}

/** The answer key stored on a question. Never sent to the browser mid-session (§4). */
export type AnswerKey = {
  keyPoints: KeyPoint[]
  redFlags: string[]
  idealAnswerSummary?: string
  /** behavioral */
  competency?: string
  /** coding */
  expectedComplexity?: { time: string; space: string }
  /** coding */
  edgeCases?: string[]
  /** system_design */
  scaleHints?: string[]
}

export type CodingTest = { input: string; expected: string }

/** The slice of a stored question the evaluator reads. */
export type EvalQuestion = Partial<AnswerKey> & {
  question: string
  type: 'technical' | 'behavioral' | 'hr'
  topic: string
  difficulty: QuestionDifficulty
  kind?: 'spoken' | 'coding'
  language?: 'javascript' | 'python'
  starterCode?: string
  functionName?: string
  publicTests?: CodingTest[]
  hiddenTests?: CodingTest[]
  rubric?: Rubric
}

export type AnswerInputMode = 'typed' | 'spoken' | 'coding'

export type AnswerTranscript = { verbatim: string; annotated: string }

/** The slice of a stored answer the evaluator reads. */
export type EvalAnswer = {
  index: number
  answer: string
  transcript?: AnswerTranscript | null
  delivery?: DeliveryStats | null
  audioConfidence?: number | null
  inputMode?: AnswerInputMode | null
  evaluation?: QuestionEvaluation | null
}

export type EvaluationFlag =
  | 'unanswered'
  | 'too_short'
  | 'echoed_question'
  | 'gibberish'
  | 'no_solution'
  | 'low_audio_confidence'
  | 'delivery_too_short'
  | 'ai_grading_failed'
  | 'language_mismatch'
  | 'unverified_code'
  | 'hypothetical'
  | 'no_answer_key'

export type CapReason = 'red_flag' | 'tests' | 'no_run' | 'hypothetical' | 'unverified_code'

export type ObservedError = { severity: 'minor' | 'major'; claim: string }

export type TestRunSummary = {
  publicPassed: number
  publicTotal: number
  hiddenPassed: number
  hiddenTotal: number
  /** Syntax error / function missing — nothing could execute. */
  failedToRun?: boolean
  /** Which hidden test *categories* failed; never the inputs themselves (§12). */
  failedHiddenIndexes?: number[]
}

export type QuestionEvaluation = {
  rubric: Rubric
  /**
   * 0–100, or null when the question cannot be content-graded at all
   * (pre-answer-key session, non-coding). Unanswered / gated answers are 0, not null.
   */
  contentScore: number | null
  /** 0–100, or null when the answer was not spoken or delivery preconditions failed (§16). */
  deliveryScore: number | null
  /** dimension -> 0..100 */
  scores: Record<string, number>
  /** dimension -> 0..4 raw Gemini observation, where one was made */
  levels: Record<string, number>
  keyPointsHit: number[]
  keyPointsPartial: number[]
  keyPointsMissed: number[]
  /** Verified factual errors. Named to avoid Mongoose's reserved `errors` document path. */
  factualErrors: ObservedError[]
  tests?: TestRunSummary
  capsApplied: CapReason[]
  rationale: string
  tips: string[]
  flags: EvaluationFlag[]
  /** hash(answer + rubric + promptVersion + key) — idempotency (§10 ④). */
  answerHash: string
  model?: string
  promptVersion: string
  evaluatedAt: Date
  /** True once Tier 3 has run (or was not needed). False → deterministic parts only. */
  aiGraded: boolean
}

export type SessionEvaluation = {
  contentScore: number | null
  deliveryScore: number | null
  byTopic: Record<string, number>
  byRubric: Record<string, number>
  answeredCount: number
  gradedCount: number
  /** Questions with no answer key whose content could not be graded (§20). */
  ungradableCount: number
  /** False when any question was ungradable — such sessions never unlock a path stage. */
  pathEligible: boolean
  strengths: string[]
  gaps: string[]
  nextTopics: string[]
  completedAt: Date
}

export type EvaluationStatus = 'none' | 'pending' | 'running' | 'ready' | 'failed'
