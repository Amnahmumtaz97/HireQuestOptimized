import type { AnswerKey, KeyPoint, Rubric, SystemDesignDimension } from '@/lib/evaluation/types'

export const MIN_KEY_POINTS = 3
export const MAX_KEY_POINTS = 8
const MAX_RED_FLAGS = 6

/**
 * Loose shape a model or template may hand us before normalisation. Everything
 * is `unknown`-tolerant on purpose: the model's key is advisory, and a malformed
 * field must degrade to the generic key rather than fail question generation.
 */
export type RawAnswerKey = {
  keyPoints?: Array<string | Record<string, unknown>> | null
  redFlags?: unknown[] | null
  idealAnswerSummary?: string | null
  competency?: string | null
  expectedComplexity?: { time?: unknown; space?: unknown } | string | null
  edgeCases?: unknown[] | null
  scaleHints?: unknown[] | null
}

const SD_DIMENSIONS: SystemDesignDimension[] = ['requirements', 'components', 'scale', 'tradeoffs']

/** Fields a model tends to put text under when it returns an object instead of a string. */
const TEXT_FIELDS = ['text', 'point', 'description', 'name', 'case', 'title', 'flag', 'hint', 'value']

function textOf(item: unknown): string {
  if (typeof item === 'string') return item.trim()
  if (item && typeof item === 'object') {
    const rec = item as Record<string, unknown>
    for (const f of TEXT_FIELDS) {
      if (typeof rec[f] === 'string' && rec[f].trim()) return (rec[f] as string).trim()
    }
  }
  return ''
}

function cleanList(list: unknown, max: number, maxLen = 300): string[] {
  if (!Array.isArray(list)) return []
  const out: string[] = []
  for (const item of list) {
    const text = textOf(item)
    if (!text || out.includes(text)) continue
    out.push(text.slice(0, maxLen))
    if (out.length >= max) break
  }
  return out
}

const COMPLEXITY_MAX_LEN = 40

/**
 * Reduce whatever the model wrote ("O(n) where n is the array length",
 * "Linear, O(n)") to the bare big-O expression the judge compares against.
 */
export function normalizeComplexity(raw: unknown, fallback: string): string {
  const text = typeof raw === 'string' ? raw : textOf(raw)
  if (!text) return fallback
  const bigO = text.match(/O\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)/i)
  const expr = bigO ? `O(${bigO[1].replace(/\s+/g, ' ').trim()})` : text
  return expr.slice(0, COMPLEXITY_MAX_LEN)
}

/** `{ time, space }`, or a single string like "O(n) time, O(1) space". */
function coerceComplexity(raw: RawAnswerKey['expectedComplexity']): { time: string; space: string } {
  if (raw && typeof raw === 'object') {
    return { time: normalizeComplexity(raw.time, 'O(n)'), space: normalizeComplexity(raw.space, 'O(n)') }
  }
  if (typeof raw === 'string') {
    const all = raw.match(/O\s*\([^()]*(?:\([^()]*\)[^()]*)*\)/gi) ?? []
    return {
      time: normalizeComplexity(all[0] ?? raw, 'O(n)'),
      space: normalizeComplexity(all[1] ?? '', 'O(n)'),
    }
  }
  return { time: 'O(n)', space: 'O(n)' }
}

/** §4 — generic key points used when a template (no-API path) or a thin model reply needs padding. */
export function genericKeyPoints(rubric: Rubric, topic: string): KeyPoint[] {
  const t = topic.trim() || 'the topic'
  switch (rubric) {
    case 'behavioral':
      return [
        { text: 'Describes one specific past situation with real context (who, when, stakes)' },
        { text: 'States what they personally were responsible for' },
        { text: 'Lists the concrete actions they took, in order' },
        { text: 'Describes the outcome and, ideally, a measurable result' },
        { text: 'Reflects on what they learned or would do differently' },
      ]
    case 'hr':
      return [
        { text: 'Answers the question directly in the first sentence' },
        { text: 'Connects the answer to the target role and company' },
        { text: 'Backs the answer with a concrete example from experience' },
        { text: 'Keeps a positive, professional framing' },
      ]
    case 'system_design':
      return [
        { text: 'Clarifies functional and non-functional requirements before designing', dimension: 'requirements' },
        { text: 'Estimates traffic, storage or throughput from the stated volumes', dimension: 'scale' },
        { text: 'Names the main components (API, services, storage, queues) and how they connect', dimension: 'components' },
        { text: 'Identifies the main bottleneck and how caching, sharding or replication addresses it', dimension: 'scale' },
        { text: 'Names at least one alternative and explains why it was rejected', dimension: 'tradeoffs' },
      ]
    case 'coding':
      return [
        { text: 'Identifies the core pattern or data structure the problem calls for' },
        { text: 'Handles the edge cases named in the constraints' },
        { text: 'Explains or achieves the expected time complexity' },
      ]
    default:
      return [
        { text: `Defines the core concept of ${t} accurately` },
        { text: 'Describes a concrete implementation approach' },
        { text: 'Explains how the solution is tested or verified' },
        { text: 'Mentions a trade-off, limitation or failure mode' },
        { text: 'Gives a real example from experience' },
      ]
  }
}

export function genericRedFlags(rubric: Rubric): string[] {
  switch (rubric) {
    case 'behavioral':
      return ['Blames others without owning any part of the outcome', 'Story is hypothetical rather than a real past event']
    case 'hr':
      return ['Badmouths a previous employer or colleague', 'Motivation is money-only with no interest in the role']
    case 'system_design':
      return ['Proposes a single unreplicated database at the stated scale', 'Ignores the stated traffic volumes entirely']
    case 'coding':
      return ['Hard-codes the expected outputs of the test cases', 'Uses eval or otherwise bypasses the problem']
    default:
      return ['States a factually wrong claim as fact', 'Confuses two distinct concepts']
  }
}

function coerceKeyPoints(raw: RawAnswerKey['keyPoints'], rubric: Rubric): KeyPoint[] {
  if (!Array.isArray(raw)) return []
  const out: KeyPoint[] = []
  for (const item of raw) {
    const text = textOf(item)
    if (!text || out.some((k) => k.text === text)) continue
    const point: KeyPoint = { text: text.slice(0, 300) }
    if (rubric === 'system_design') {
      const rawDim =
        item && typeof item === 'object'
          ? (item as Record<string, unknown>).dimension ?? (item as Record<string, unknown>).category
          : ''
      const dim = String(rawDim ?? '').trim().toLowerCase()
      point.dimension = SD_DIMENSIONS.includes(dim as SystemDesignDimension)
        ? dim
        : guessSystemDesignDimension(text)
    }
    out.push(point)
    if (out.length >= MAX_KEY_POINTS) break
  }
  return out
}

/** Keyword tagger for system design points that arrive without a dimension. */
export function guessSystemDesignDimension(text: string): SystemDesignDimension {
  const t = text.toLowerCase()
  if (/\b(trade-?offs?|vs\.?|versus|alternative|why (not|you)|when (to|you)|justif|choose|avoid|refuse|challenge|instead)\b/.test(t)) {
    return 'tradeoffs'
  }
  if (/\b(scal|shard|partition|cach|cdn|replica|hot ?spot|bottleneck|throughput|latency|qps|rps|estimat|capacity|load|thundering|fan-?out|back-?pressure)/.test(t)) {
    return 'scale'
  }
  if (/\b(requirement|scope|clarif|read[:/ ]write|ratio|sla|slo|rpo|rto|consisten|availab|non-functional|constraint|assum)/.test(t)) {
    return 'requirements'
  }
  return 'components'
}

/**
 * Normalise whatever the generator produced into a complete answer key:
 * 3–8 key points (padded from the generic set), ≤6 red flags, per-type extras.
 */
export function normalizeAnswerKey(raw: RawAnswerKey | null | undefined, rubric: Rubric, topic: string): AnswerKey {
  const key: AnswerKey = {
    keyPoints: coerceKeyPoints(raw?.keyPoints, rubric),
    redFlags: cleanList(raw?.redFlags, MAX_RED_FLAGS),
  }

  if (key.keyPoints.length < MIN_KEY_POINTS) {
    for (const generic of genericKeyPoints(rubric, topic)) {
      if (key.keyPoints.length >= MIN_KEY_POINTS) break
      if (key.keyPoints.some((k) => k.text === generic.text)) continue
      key.keyPoints.push(generic)
    }
  }
  if (key.redFlags.length === 0) key.redFlags = genericRedFlags(rubric)

  const summary = typeof raw?.idealAnswerSummary === 'string' ? raw.idealAnswerSummary.trim() : ''
  if (summary) key.idealAnswerSummary = summary.slice(0, 600)

  if (rubric === 'behavioral') {
    const competency = typeof raw?.competency === 'string' ? raw.competency.trim() : ''
    key.competency = (competency || topic.trim() || 'the competency').slice(0, 120)
  }
  if (rubric === 'coding') {
    key.expectedComplexity = coerceComplexity(raw?.expectedComplexity)
    key.edgeCases = cleanList(raw?.edgeCases, 8, 200)
    if (key.edgeCases.length === 0) {
      key.edgeCases = ['Empty or minimal input', 'Single element', 'Duplicate values']
    }
  }
  if (rubric === 'system_design') {
    key.scaleHints = cleanList(raw?.scaleHints, 6, 200)
  }
  return key
}
