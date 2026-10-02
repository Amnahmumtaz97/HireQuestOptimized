import type {
  EvalQuestion,
  QuestionDifficulty,
  QuestionEvaluation,
  Rubric,
  SessionEvaluation,
} from '@/lib/evaluation/types'

/** §18 step 2 — a Hard question counts for more than an Easy one. */
export const DIFFICULTY_WEIGHT: Record<QuestionDifficulty, number> = {
  Easy: 1.0,
  Medium: 1.3,
  Hard: 1.6,
}

const STRENGTH_THRESHOLD = 80
const GAP_THRESHOLD = 60

export type AggregateInput = {
  questions: EvalQuestion[]
  /** One entry per question index. Unanswered questions still get an entry with contentScore 0. */
  evaluations: Map<number, QuestionEvaluation>
}

function weightedAverage(items: Array<{ score: number; weight: number }>): number | null {
  const totalWeight = items.reduce((s, i) => s + i.weight, 0)
  if (totalWeight <= 0) return null
  return items.reduce((s, i) => s + i.score * i.weight, 0) / totalWeight
}

function plainAverage(values: number[]): number | null {
  if (values.length === 0) return null
  return values.reduce((a, b) => a + b, 0) / values.length
}

const DIMENSION_LABELS: Record<string, string> = {
  correctness: 'Factual accuracy',
  coverage: 'Covering the key points',
  depth: 'Depth of explanation',
  precision: 'Precise use of terminology',
  tests: 'Passing tests',
  complexity: 'Algorithmic efficiency',
  edgeCases: 'Handling edge cases',
  readability: 'Readable code',
  situationTask: 'Setting up the situation',
  action: 'Clear STAR actions',
  result: 'Quantified results',
  ownership: 'Personal ownership',
  specificity: 'Specific stories',
  requirements: 'Clarifying requirements',
  components: 'Component design',
  scale: 'Reasoning about scale',
  tradeoffs: 'Justifying trade-offs',
  clarity: 'Clear, direct answers',
  roleAlignment: 'Connecting to the role',
  professionalism: 'Professional framing',
}

/**
 * §18 — question scores → session scores. Content is difficulty-weighted over ALL
 * gradable questions (unanswered = 0); delivery is a plain average over spoken answers.
 */
export function aggregateSession(input: AggregateInput): SessionEvaluation {
  const { questions, evaluations } = input

  const content: Array<{ score: number; weight: number; topic: string; rubric: Rubric }> = []
  const delivery: number[] = []
  const dimensionTotals = new Map<string, { sum: number; n: number }>()
  const missedPoints = new Map<string, number>()
  let answeredCount = 0
  let gradedCount = 0
  let ungradableCount = 0

  questions.forEach((q, index) => {
    const ev = evaluations.get(index)
    if (!ev) return
    const weight = DIFFICULTY_WEIGHT[q.difficulty] ?? 1
    if (!ev.flags.includes('unanswered')) answeredCount++

    if (ev.contentScore === null) {
      ungradableCount++
    } else {
      content.push({ score: ev.contentScore, weight, topic: q.topic, rubric: ev.rubric })
      if (ev.aiGraded || ev.rubric === 'coding' || ev.contentScore === 0) gradedCount++
      for (const [dim, score] of Object.entries(ev.scores)) {
        const cur = dimensionTotals.get(dim) ?? { sum: 0, n: 0 }
        cur.sum += score
        cur.n += 1
        dimensionTotals.set(dim, cur)
      }
      for (const i of ev.keyPointsMissed) {
        const text = q.keyPoints?.[i]?.text
        if (text) missedPoints.set(text, (missedPoints.get(text) ?? 0) + 1)
      }
    }
    if (ev.deliveryScore !== null) delivery.push(ev.deliveryScore)
  })

  const contentScore = weightedAverage(content)
  const deliveryScore = plainAverage(delivery)

  const byTopic: Record<string, number> = {}
  const topicGroups = new Map<string, Array<{ score: number; weight: number }>>()
  for (const c of content) {
    const list = topicGroups.get(c.topic) ?? []
    list.push(c)
    topicGroups.set(c.topic, list)
  }
  for (const [topic, items] of topicGroups) {
    const avg = weightedAverage(items)
    if (avg !== null) byTopic[topic] = Math.round(avg)
  }

  const byRubric: Record<string, number> = {}
  const rubricGroups = new Map<string, Array<{ score: number; weight: number }>>()
  for (const c of content) {
    const list = rubricGroups.get(c.rubric) ?? []
    list.push(c)
    rubricGroups.set(c.rubric, list)
  }
  for (const [rubric, items] of rubricGroups) {
    const avg = weightedAverage(items)
    if (avg !== null) byRubric[rubric] = Math.round(avg)
  }

  // §18 step 6 — strengths, gaps and next topics come from the numbers, not from AI.
  const strengths: string[] = []
  const gaps: string[] = []
  for (const [topic, score] of Object.entries(byTopic)) {
    if (score >= STRENGTH_THRESHOLD) strengths.push(topic)
    else if (score < GAP_THRESHOLD) gaps.push(topic)
  }
  for (const [dim, { sum, n }] of dimensionTotals) {
    const avg = sum / n
    const label = DIMENSION_LABELS[dim] ?? dim
    if (avg >= STRENGTH_THRESHOLD && n >= 2) strengths.push(label)
    else if (avg < GAP_THRESHOLD && n >= 2) gaps.push(label)
  }
  const topMissed = [...missedPoints.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([text]) => `Often missed: ${text}`)
  gaps.push(...topMissed)

  const nextTopics = Object.entries(byTopic)
    .filter(([, score]) => score < GAP_THRESHOLD)
    .map(([topic, score]) => {
      const weight = Math.max(
        ...content.filter((c) => c.topic === topic).map((c) => c.weight),
        1,
      )
      return { topic, priority: weight * (GAP_THRESHOLD - score) }
    })
    .sort((a, b) => b.priority - a.priority)
    .map((t) => t.topic)

  return {
    contentScore: contentScore === null ? null : Math.round(contentScore),
    deliveryScore: deliveryScore === null ? null : Math.round(deliveryScore),
    byTopic,
    byRubric,
    answeredCount,
    gradedCount,
    ungradableCount,
    pathEligible: ungradableCount === 0 && contentScore !== null,
    strengths: [...new Set(strengths)].slice(0, 6),
    gaps: [...new Set(gaps)].slice(0, 6),
    nextTopics: nextTopics.slice(0, 5),
    completedAt: new Date(),
  }
}
