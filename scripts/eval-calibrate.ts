/**
 * EVALUATION_PLAN §21 — grades the golden set 3× against the real judge and
 * fails if any answer lands outside its expected range or the spread across
 * runs exceeds 5 points. Costs money and needs GEMINI_API_KEY; not run in CI.
 *
 *   npm run eval:calibrate
 */
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { evaluateSession } from '../src/lib/evaluation/evaluate-session'
import { createGeminiJudge } from '../src/lib/evaluation/gemini-judge'
import type { EvalQuestion, Rubric } from '../src/lib/evaluation/types'

const RUNS = 3
const MAX_SPREAD = 5

type GoldenCase = {
  id: string
  rubric: Rubric
  expected: [number, number]
  question: EvalQuestion | { $ref: string }
  answer: string
}

function loadEnv() {
  for (const file of ['.env.local', '.env']) {
    const p = path.resolve(process.cwd(), file)
    if (!existsSync(p)) continue
    for (const line of readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m || process.env[m[1]]) continue
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
}

async function main() {
  loadEnv()
  const judge = createGeminiJudge()
  if (!judge) {
    console.error('GEMINI_API_KEY is not set; nothing to calibrate against.')
    process.exit(2)
  }

  const fixture = JSON.parse(
    readFileSync(path.resolve(process.cwd(), 'src/lib/evaluation/__fixtures__/golden.json'), 'utf8'),
  ) as { cases: GoldenCase[] }

  const byId = new Map(fixture.cases.map((c) => [c.id, c]))
  const resolveQuestion = (c: GoldenCase): EvalQuestion => {
    if ('$ref' in c.question) {
      const ref = byId.get(c.question.$ref)
      if (!ref || '$ref' in ref.question) throw new Error(`Bad $ref in ${c.id}`)
      return ref.question
    }
    return c.question
  }

  let failed = 0
  for (const c of fixture.cases) {
    const question = resolveQuestion(c)
    const scores: number[] = []
    for (let run = 0; run < RUNS; run++) {
      const result = await evaluateSession(
        {
          questions: [question],
          answers: [{ index: 0, answer: c.answer, inputMode: 'typed' }],
          session: { interviewType: c.rubric === 'system_design' ? 'system_design' : 'mixed' },
          context: { roleContext: 'Backend Engineer, FinTech' },
        },
        { judge },
      )
      const ev = result.evaluations.get(0)
      if (!ev || ev.contentScore === null) {
        console.error(`✗ ${c.id} run ${run + 1}: no score (${ev?.flags.join(',') ?? 'missing'}; ${result.failures.join('; ')})`)
        failed++
        continue
      }
      scores.push(ev.contentScore)
    }
    if (scores.length < RUNS) continue

    const [lo, hi] = c.expected
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const inRange = scores.every((s) => s >= lo && s <= hi)
    const stable = max - min <= MAX_SPREAD
    const ok = inRange && stable
    if (!ok) failed++
    console.log(
      `${ok ? '✓' : '✗'} ${c.id.padEnd(14)} ${c.rubric.padEnd(14)} runs=${scores.join('/')}  expected=${lo}–${hi}  spread=${max - min}${inRange ? '' : '  OUT OF RANGE'}${stable ? '' : '  UNSTABLE'}`,
    )
  }

  console.log(failed === 0 ? '\nCalibration passed.' : `\n${failed} case(s) failed calibration.`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
