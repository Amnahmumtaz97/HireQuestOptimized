import type {
  CapReason,
  EvalQuestion,
  EvaluationFlag,
  ObservedError,
  Rubric,
  TestRunSummary,
} from '@/lib/evaluation/types'
import type { JudgeObservation } from '@/lib/evaluation/parse'
import type { TextSignals } from '@/lib/evaluation/text-signals'
import { ownershipRatioScore } from '@/lib/evaluation/text-signals'
import { quoteAppearsIn } from '@/lib/evaluation/verify'
import {
  HYPOTHETICAL_CAP,
  MAJOR_ERROR_PENALTY,
  MINOR_ERROR_PENALTY,
  RED_FLAG_CAP,
  RUBRIC_WEIGHTS,
  levelToScore,
} from '@/lib/evaluation/rubric'
import {
  NO_RUN_CAP,
  TESTS_CAP_BONUS,
  UNVERIFIED_CODE_CAP,
  complexityScore,
  testsScore,
} from '@/lib/evaluation/coding-score'

export type ScoreInput = {
  rubric: Rubric
  question: EvalQuestion
  /** Clean text for spoken/typed answers; the code itself for coding. */
  answerText: string
  /** null when Tier 3 did not run (AI unavailable or failed). */
  observation: JudgeObservation | null
  signals?: TextSignals
  /** coding — from a fresh re-run, never stored counts */
  tests?: TestRunSummary
  /** coding — judge could not execute the language */
  codeUnverified?: boolean
}

export type ScoreResult = {
  contentScore: number
  scores: Record<string, number>
  levels: Record<string, number>
  keyPointsHit: number[]
  keyPointsPartial: number[]
  keyPointsMissed: number[]
  factualErrors: ObservedError[]
  capsApplied: CapReason[]
  flags: EvaluationFlag[]
  tips: string[]
  rationale: string
}

const NUMBER_IN_RESULT = /\d|\bpercent\b|%|\bhalf\b|\bdouble\b|\btripl/i

function clamp(n: number): number {
  return Math.max(0, Math.min(100, n))
}

/** Weighted sum over the dimensions present, re-normalised when some are unavailable. */
function weighted(scores: Record<string, number>, weights: Record<string, number>): number {
  let sum = 0
  let total = 0
  for (const [dim, w] of Object.entries(weights)) {
    if (!(dim in scores)) continue
    sum += scores[dim] * w
    total += w
  }
  return total > 0 ? sum / total : 0
}

type VerifiedKeyPoints = { hit: number[]; partial: number[]; missed: number[]; coverage: number | null }

/** §9.2 + §9.3 — key point statuses, with unverified evidence downgraded to missed. */
function verifyKeyPoints(question: EvalQuestion, answer: string, obs: JudgeObservation | null): VerifiedKeyPoints {
  const points = question.keyPoints ?? []
  const hit: number[] = []
  const partial: number[] = []
  const missed: number[] = []
  const byIndex = new Map((obs?.keyPoints ?? []).map((k) => [k.index, k]))
  points.forEach((_, i) => {
    const o = byIndex.get(i)
    if (!o || o.status === 'missed') {
      missed.push(i)
      return
    }
    if (!quoteAppearsIn(answer, o.evidence)) {
      missed.push(i)
      return
    }
    if (o.status === 'hit') hit.push(i)
    else partial.push(i)
  })
  const coverage = points.length === 0 ? null : ((hit.length + partial.length * 0.5) / points.length) * 100
  return { hit, partial, missed, coverage }
}

function verifyErrors(answer: string, obs: JudgeObservation | null): ObservedError[] {
  return (obs?.errors ?? [])
    .filter((e) => quoteAppearsIn(answer, e.evidence))
    .map((e) => ({ severity: e.severity, claim: e.claim }))
}

function verifyRedFlags(question: EvalQuestion, answer: string, obs: JudgeObservation | null): number[] {
  const flags = question.redFlags ?? []
  return (obs?.redFlagsObserved ?? [])
    .filter((r) => r.index >= 0 && r.index < flags.length && quoteAppearsIn(answer, r.evidence))
    .map((r) => r.index)
}

function levelOf(obs: JudgeObservation | null, key: string): number {
  const raw = obs?.levels?.[key]
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0
  return Math.max(0, Math.min(4, Math.round(raw)))
}

function coverageDimension(coverage: number | null, verified: number[]): number {
  if (coverage !== null) return coverage
  return verified.length > 0 ? 100 : 0
}

export function scoreObservation(input: ScoreInput): ScoreResult {
  const { rubric, question, answerText, observation: obs } = input
  const weights = RUBRIC_WEIGHTS[rubric]
  const scores: Record<string, number> = {}
  const levels: Record<string, number> = {}
  const capsApplied: CapReason[] = []
  const flags: EvaluationFlag[] = []
  const caps: number[] = []
  const rationaleBits: string[] = []

  const kp = verifyKeyPoints(question, answerText, obs)
  const errors = verifyErrors(answerText, obs)
  const redFlags = verifyRedFlags(question, answerText, obs)

  if (obs === null) flags.push('ai_grading_failed')

  switch (rubric) {
    case 'technical': {
      const penalty = errors.reduce(
        (s, e) => s + (e.severity === 'major' ? MAJOR_ERROR_PENALTY : MINOR_ERROR_PENALTY),
        0,
      )
      scores.correctness = Math.max(0, 100 - penalty)
      if (kp.coverage !== null) scores.coverage = kp.coverage
      levels.depth = levelOf(obs, 'depth')
      levels.precision = levelOf(obs, 'precision')
      scores.depth = levelToScore(levels.depth)
      scores.precision = levelToScore(levels.precision)
      if (errors.length) rationaleBits.push(`${errors.length} factual error${errors.length > 1 ? 's' : ''} found`)
      break
    }

    case 'coding': {
      const tests = input.tests
      if (input.codeUnverified || !tests) {
        // §12 — no Tier 1 signal: judged dimensions only, re-weighted, capped, flagged.
        flags.push('unverified_code')
        capsApplied.push('unverified_code')
        caps.push(UNVERIFIED_CODE_CAP)
      } else {
        scores.tests = testsScore(tests)
        if (tests.failedToRun) {
          capsApplied.push('no_run')
          caps.push(NO_RUN_CAP)
          rationaleBits.push('code failed to run')
        } else {
          caps.push(scores.tests + TESTS_CAP_BONUS)
          rationaleBits.push(
            `${tests.publicPassed}/${tests.publicTotal} public and ${tests.hiddenPassed}/${tests.hiddenTotal} hidden tests passed`,
          )
        }
      }
      if (obs) {
        scores.complexity = complexityScore(obs.complexity?.time, question.expectedComplexity?.time)
        const edgeCases = question.edgeCases ?? []
        if (edgeCases.length > 0) {
          const observed = new Map((obs.edgeCases ?? []).map((e) => [e.index, e]))
          const hit = edgeCases.filter((_, i) => {
            const o = observed.get(i)
            return o?.status === 'hit' && quoteAppearsIn(answerText, o.evidence)
          }).length
          scores.edgeCases = (hit / edgeCases.length) * 100
        }
        levels.readability = levelOf(obs, 'readability')
        scores.readability = levelToScore(levels.readability)
      }
      break
    }

    case 'behavioral': {
      const seg = obs?.segments ?? {}
      const situationOk = quoteAppearsIn(answerText, seg.situation) || quoteAppearsIn(answerText, seg.task)
      const actionOk = quoteAppearsIn(answerText, seg.action)
      const resultOk = quoteAppearsIn(answerText, seg.result)

      levels.situationTask = situationOk ? levelOf(obs, 'situationTask') : 0
      levels.action = actionOk ? levelOf(obs, 'action') : 0
      let result = resultOk ? levelOf(obs, 'result') : 0
      // Code rule: a level-4 result must contain a number.
      if (result === 4 && !NUMBER_IN_RESULT.test(seg.result ?? '')) result = 3
      levels.result = result
      levels.ownership = levelOf(obs, 'ownership')
      levels.specificity = levelOf(obs, 'specificity')

      scores.situationTask = levelToScore(levels.situationTask)
      scores.action = levelToScore(levels.action)
      scores.result = levelToScore(levels.result)
      const ratioScore = ownershipRatioScore(input.signals?.iRatio ?? 1)
      scores.ownership = 0.5 * ratioScore + 0.5 * levelToScore(levels.ownership)
      scores.specificity = levelToScore(levels.specificity)

      if (input.signals?.hypotheticalDominant && obs?.hypothetical) {
        flags.push('hypothetical')
        capsApplied.push('hypothetical')
        caps.push(HYPOTHETICAL_CAP)
        rationaleBits.push('no specific past event — the answer describes what they would do')
      }
      break
    }

    case 'system_design': {
      const points = question.keyPoints ?? []
      const dims: Array<'requirements' | 'components' | 'scale' | 'tradeoffs'> = [
        'requirements',
        'components',
        'scale',
        'tradeoffs',
      ]
      for (const dim of dims) {
        const tagged = points.map((p, i) => ({ p, i })).filter(({ p }) => p.dimension === dim)
        let level = levelOf(obs, dim)

        if (dim === 'scale' && question.difficulty !== 'Easy' && input.signals && !input.signals.hasNumbers) {
          level = Math.min(level, 2)
        }
        if (dim === 'tradeoffs') {
          const justified = (obs?.alternatives ?? []).some(
            (a) => a.reason?.trim() && quoteAppearsIn(answerText, a.evidence),
          )
          if (!justified) level = Math.min(level, 1)
        }
        levels[dim] = level

        if (tagged.length === 0) {
          scores[dim] = levelToScore(level)
          continue
        }
        const earned = tagged.reduce((s, { i }) => {
          if (kp.hit.includes(i)) return s + 1
          if (kp.partial.includes(i)) return s + 0.5
          return s
        }, 0)
        const coverage = (earned / tagged.length) * 100
        scores[dim] = 0.5 * coverage + 0.5 * levelToScore(level)
      }
      break
    }

    case 'hr': {
      levels.clarity = levelOf(obs, 'clarity')
      levels.roleAlignment = levelOf(obs, 'roleAlignment')
      levels.professionalism = levelOf(obs, 'professionalism')
      scores.clarity = levelToScore(levels.clarity)
      // Key point coverage is evidence for alignment, not a strict checklist (§15).
      const alignment = levelToScore(levels.roleAlignment)
      scores.roleAlignment =
        kp.coverage === null ? alignment : 0.7 * alignment + 0.3 * coverageDimension(kp.coverage, kp.hit)
      scores.professionalism = levelToScore(levels.professionalism)
      break
    }
  }

  if (redFlags.length > 0) {
    capsApplied.push('red_flag')
    caps.push(RED_FLAG_CAP)
    const texts = redFlags.map((i) => question.redFlags?.[i]).filter(Boolean)
    rationaleBits.push(`red flag: ${texts.join('; ')}`)
  }

  let score = weighted(scores, weights)
  for (const cap of caps) score = Math.min(score, cap)
  // Rounding happens once, here (§18).
  const contentScore = Math.round(clamp(score))

  const tips = [...(obs?.tips ?? [])]
  const missedTexts = kp.missed.map((i) => question.keyPoints?.[i]?.text).filter(Boolean) as string[]
  if (missedTexts.length > 0 && rubric !== 'coding') {
    rationaleBits.unshift(`missed: ${missedTexts.slice(0, 3).join('; ')}`)
  }
  const partialTexts = kp.partial.map((i) => question.keyPoints?.[i]?.text).filter(Boolean) as string[]
  if (partialTexts.length > 0 && rubric !== 'coding') {
    rationaleBits.push(`partly covered: ${partialTexts.slice(0, 2).join('; ')}`)
  }
  for (const e of errors) tips.push(`Correction: ${e.claim} — this is ${e.severity === 'major' ? 'a significant' : 'a minor'} inaccuracy.`)

  return {
    contentScore,
    scores: Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.round(v * 100) / 100])),
    levels,
    keyPointsHit: kp.hit,
    keyPointsPartial: kp.partial,
    keyPointsMissed: kp.missed,
    factualErrors: errors,
    capsApplied,
    flags,
    tips: [...new Set(tips)].slice(0, 6),
    rationale: rationaleBits.length ? rationaleBits.join(' · ') : 'Scored against the answer key.',
  }
}
