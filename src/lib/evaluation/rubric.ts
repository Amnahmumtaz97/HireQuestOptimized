import type { QuestionDifficulty, Rubric } from '@/lib/evaluation/types'

/** §8 — dimensions and weights per rubric. Weights sum to 1. */
export const RUBRIC_WEIGHTS: Record<Rubric, Record<string, number>> = {
  technical: { correctness: 0.35, coverage: 0.3, depth: 0.2, precision: 0.15 },
  coding: { tests: 0.6, complexity: 0.2, edgeCases: 0.1, readability: 0.1 },
  behavioral: { situationTask: 0.2, action: 0.3, result: 0.25, ownership: 0.15, specificity: 0.1 },
  system_design: { requirements: 0.2, components: 0.3, scale: 0.3, tradeoffs: 0.2 },
  hr: { clarity: 0.4, roleAlignment: 0.35, professionalism: 0.25 },
}

/** Which `levels` keys the judge must return for each rubric (§9.6). */
export const RUBRIC_LEVEL_KEYS: Record<Rubric, string[]> = {
  technical: ['depth', 'precision'],
  coding: ['readability'],
  behavioral: ['situationTask', 'action', 'result', 'ownership', 'specificity'],
  system_design: ['requirements', 'components', 'scale', 'tradeoffs'],
  hr: ['clarity', 'roleAlignment', 'professionalism'],
}

/** §9.1 — a level is worth level × 25. */
export function levelToScore(level: number): number {
  return Math.max(0, Math.min(4, Math.round(level))) * 25
}

/** Cap applied when any verified red flag is observed (§9.4). */
export const RED_FLAG_CAP = 40
/** Cap for behavioral answers with no real story (§13). */
export const HYPOTHETICAL_CAP = 40

export const MINOR_ERROR_PENALTY = 15
export const MAJOR_ERROR_PENALTY = 40

/**
 * Anchor wording sent to the judge. Written once, here, so calibration changes
 * are a single diff and `PROMPT_VERSION` can be bumped alongside them.
 */
export function anchorsFor(rubric: Rubric, difficulty: QuestionDifficulty): string {
  switch (rubric) {
    case 'technical':
      return `LEVELS for "depth" (${difficulty} question):
${TECHNICAL_DEPTH_ANCHORS[difficulty]}
LEVELS for "precision" (are technical terms used correctly?):
4 = every term used precisely, distinctions drawn where they matter
3 = terms used correctly, occasional looseness
2 = mostly right, one or two terms misused or conflated
1 = vague or hand-wavy terminology throughout
0 = terms misused in ways that change the meaning`
    case 'coding':
      return `LEVELS for "readability":
4 = clear names, small well-structured functions, no dead code, idiomatic
3 = readable, minor naming or structure issues
2 = works but hard to follow: long function, unclear names, leftover debug code
1 = very hard to read; logic obscured
0 = unreadable`
    case 'behavioral':
      return `LEVELS (STAR):
"situationTask":
4 = specific time, place, stakes, and their role are clear
3 = specific and clear, stakes implied
2 = real but vague ("at my last job we had an issue")
1 = barely set up
0 = missing or hypothetical
"action":
4 = several concrete steps THEY took, reasoning explained, shows the competency
3 = concrete steps they took
2 = steps listed but generic
1 = mostly describes what the team did
0 = missing
"result":
4 = clear, quantified outcome plus a lesson learned
3 = clear outcome, not quantified
2 = outcome mentioned in passing
1 = outcome unclear
0 = missing
"ownership":
4 = unmistakably their decisions and work, credits others accurately
3 = mostly their work
2 = mixed "I" and "we", their part is inferable
1 = mostly "we", their part unclear
0 = no personal contribution visible
"specificity":
4 = one story with names, dates, numbers, details
3 = one story with concrete details
2 = one story, generic details
1 = mixes stories or drifts into general advice
0 = generic advice only`
    case 'system_design':
      return `LEVELS:
"requirements": 4 = clarifies scope, users, functional AND non-functional needs (latency, consistency, availability) before designing · 3 = clarifies most of it · 2 = states a few assumptions · 1 = jumps into design with one throwaway assumption · 0 = never considers requirements
"components": 4 = every piece named, connected, and justified (API, services, storage, queues, cache) · 3 = sensible pieces, connections mostly clear · 2 = pieces named, connections vague · 1 = a couple of boxes with no flow · 0 = no architecture
"scale": 4 = finds the bottleneck, quantifies it, addresses it with a specific mechanism · 3 = finds the bottleneck and addresses it · 2 = mentions scaling generically ("add caching", "shard it") · 1 = hand-waves "it scales" · 0 = ignores scale
"tradeoffs": 4 = names alternatives and gives concrete reasons for rejecting each · 3 = names an alternative with a reason · 2 = names an alternative, no reason · 1 = asserts a choice with no alternative · 0 = no reasoning`
    case 'hr':
      return `LEVELS:
"clarity": 4 = direct answer in the first sentence, then support, no rambling · 3 = clear with a little wandering · 2 = answer present but buried · 1 = hard to find the answer · 0 = does not answer
"roleAlignment": 4 = connects own goals/skills to THIS role and company specifically · 3 = connects to the role type · 2 = generic ("I like coding") · 1 = barely relevant · 0 = unrelated
"professionalism": 4 = positive, honest, appropriate tone · 3 = fine · 2 = one slip (mild negativity, overshare) · 1 = unprofessional framing · 0 = hostile or inappropriate`
  }
}

const TECHNICAL_DEPTH_ANCHORS: Record<QuestionDifficulty, string> = {
  Easy: `4 = definition + example + why it matters
3 = correct definition + example
2 = correct definition only
1 = vague or partly wrong
0 = absent`,
  Medium: `4 = explains the mechanism AND when to use it
3 = explains the mechanism
2 = definition + example
1 = definition only
0 = absent`,
  Hard: `4 = mechanism, trade-offs, failure modes, real-world experience
3 = mechanism + trade-offs
2 = mechanism, no trade-offs
1 = definition + example only
0 = absent`,
}
