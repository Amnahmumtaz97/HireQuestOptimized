import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { createContext, Script } from 'vm'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'

export const runtime = 'nodejs'

const bodySchema = z.object({
  questionIndex: z.number().int().min(0),
  code: z.string().max(50_000),
  language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp']).optional(),
  includeHidden: z.boolean().optional().default(false),
})

function parseArg(raw: string): unknown {
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

function runOne(
  code: string,
  functionName: string,
  inputRaw: string,
  expectedRaw: string,
): { ok: boolean; actual?: string; error?: string } {
  try {
    const sandbox: Record<string, unknown> = { console: { log() {}, warn() {}, error() {} } }
    const context = createContext(sandbox)
    const script = new Script(`${code}\n;typeof ${functionName} === 'function' ? ${functionName} : null;`)
    const fn = script.runInContext(context, { timeout: 800 })
    if (typeof fn !== 'function') {
      return { ok: false, error: `Function "${functionName}" not found` }
    }
    const input = parseArg(inputRaw)
    const args = Array.isArray(input) ? input : [input]
    const result = (fn as (...a: unknown[]) => unknown).apply(null, args)
    const actual = JSON.stringify(result)
    const expected = JSON.stringify(parseArg(expectedRaw))
    return { ok: actual === expected, actual, error: actual === expected ? undefined : `expected ${expected}` }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Runtime error' }
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
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
  const tests = [
    ...(q.publicTests || []),
    ...(parsed.data.includeHidden ? q.hiddenTests || [] : []),
  ]

  const results = tests.map((t, i) => {
    const r = runOne(parsed.data.code, functionName, t.input, t.expected)
    return {
      index: i,
      input: t.input,
      expected: t.expected,
      passed: r.ok,
      actual: r.actual,
      error: r.error,
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
