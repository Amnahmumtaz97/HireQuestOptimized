import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { Worker } from 'worker_threads'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const bodySchema = z.object({
  questionIndex: z.number().int().min(0),
  code: z.string().max(50_000),
  language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp']).optional(),
})

type TestCase = { input: string; expected: string }
type WorkerResult =
  | { error: string }
  | { results: Array<{ ok: boolean; actual?: string; error?: string }> }

/**
 * Runs entirely inside a worker thread so the request handler can hard-kill
 * runaway user code (infinite loops, memory bombs) via worker.terminate().
 * The worker gets an empty env so parent secrets are never reachable, plus
 * V8 heap/stack resource limits.
 */
const WORKER_SOURCE = String.raw`
const { parentPort, workerData } = require('worker_threads')
const { createContext, Script } = require('vm')

function parseArg(raw) {
  try { return JSON.parse(raw) } catch { return raw }
}

const { code, functionName, tests } = workerData

let fn = null
try {
  const sandbox = { console: { log() {}, warn() {}, error() {} } }
  const context = createContext(sandbox)
  const script = new Script(code + '\n;typeof ' + functionName + ' === "function" ? ' + functionName + ' : null;')
  fn = script.runInContext(context, { timeout: 800 })
} catch (e) {
  parentPort.postMessage({ error: e instanceof Error ? e.message : 'Runtime error' })
  process.exit(0)
}

if (typeof fn !== 'function') {
  parentPort.postMessage({ error: 'Function "' + functionName + '" not found' })
  process.exit(0)
}

const results = []
for (const t of tests) {
  try {
    const input = parseArg(t.input)
    const args = Array.isArray(input) ? input : [input]
    const result = fn.apply(null, args)
    const actual = JSON.stringify(result)
    const expected = JSON.stringify(parseArg(t.expected))
    results.push({
      ok: actual === expected,
      actual,
      error: actual === expected ? undefined : 'expected ' + expected,
    })
  } catch (e) {
    results.push({ ok: false, error: e instanceof Error ? e.message : 'Runtime error' })
  }
}
parentPort.postMessage({ results })
`

function executeInWorker(
  code: string,
  functionName: string,
  tests: TestCase[],
  timeoutMs = 4_000,
): Promise<WorkerResult> {
  return new Promise((resolve) => {
    let worker: Worker
    try {
      worker = new Worker(WORKER_SOURCE, {
        eval: true,
        workerData: { code, functionName, tests },
        env: {},
        resourceLimits: {
          maxOldGenerationSizeMb: 128,
          maxYoungGenerationSizeMb: 32,
          codeRangeSizeMb: 16,
          stackSizeMb: 4,
        },
      })
    } catch {
      resolve({ error: 'Could not start the judge. Try again.' })
      return
    }

    let settled = false
    const finish = (result: WorkerResult) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      void worker.terminate()
      resolve(result)
    }

    const timer = setTimeout(
      () => finish({ error: `Execution timed out after ${timeoutMs}ms` }),
      timeoutMs,
    )

    worker.once('message', (msg: WorkerResult) => finish(msg))
    worker.once('error', () => finish({ error: 'Execution failed' }))
    worker.once('exit', () => finish({ error: 'Execution failed' }))
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const limit = checkRateLimit(`run-code:${session.user.id}`, {
    limit: 20,
    windowMs: 60_000,
  })
  if (!limit.ok) {
    return NextResponse.json(
      { message: 'Too many runs. Wait a moment and try again.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSec) } },
    )
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid id' }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 })
  }

  await connectToDatabase()
  const doc = await InterviewSessionModel.findOne({ _id: id, userId: session.user.id })
  if (!doc) {
    return NextResponse.json({ message: 'Not found' }, { status: 404 })
  }

  const q = doc.questions?.[parsed.data.questionIndex]
  if (!q || q.kind !== 'coding') {
    return NextResponse.json({ message: 'Not a coding question' }, { status: 400 })
  }

  const language = parsed.data.language || 'javascript'
  if (language !== 'javascript') {
    return NextResponse.json(
      {
        message:
          'The judge currently executes JavaScript only. Switch the editor language to JavaScript to run tests.',
      },
      { status: 400 },
    )
  }

  const functionName = (q.functionName || 'solve').replace(/[^\w$]/g, '') || 'solve'
  const publicTests: TestCase[] = q.publicTests || []
  // Hidden tests always run server-side; their inputs/expected values are
  // never sent to the client (only masked pass/fail entries).
  const hiddenTests: TestCase[] = q.hiddenTests || []
  const allTests = [...publicTests, ...hiddenTests]

  if (allTests.length === 0) {
    return NextResponse.json({ message: 'No tests for this question' }, { status: 400 })
  }

  const outcome = await executeInWorker(parsed.data.code, functionName, allTests)
  if ('error' in outcome) {
    return NextResponse.json({
      passed: 0,
      total: allTests.length,
      results: [
        { index: 0, input: '', expected: '', passed: false, error: outcome.error },
      ],
    })
  }

  const results = outcome.results.map((r, i) => {
    const isHidden = i >= publicTests.length
    return {
      index: i,
      input: isHidden ? '(hidden)' : allTests[i].input,
      expected: isHidden ? '(hidden)' : allTests[i].expected,
      passed: r.ok,
      actual: isHidden ? undefined : r.actual,
      error: isHidden ? undefined : r.error,
      hidden: isHidden,
    }
  })

  const passed = results.filter((r) => r.passed).length
  const answers = [...(doc.answers || [])]
  const existingIdx = answers.findIndex((a) => a.index === parsed.data.questionIndex)
  const entry = {
    index: parsed.data.questionIndex,
    answer: parsed.data.code,
    updatedAt: new Date(),
    testsPassed: passed,
    testsTotal: results.length,
  }
  if (existingIdx >= 0) answers[existingIdx] = entry
  else answers.push(entry)
  doc.answers = answers
  await doc.save()

  return NextResponse.json({
    passed,
    total: results.length,
    results,
  })
}
