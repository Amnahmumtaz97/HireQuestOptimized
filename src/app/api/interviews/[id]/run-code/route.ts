import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { runOne, sanitizeFunctionName } from '@/lib/evaluation/code-runner'

export const runtime = 'nodejs'

const bodySchema = z.object({
  questionIndex: z.number().int().min(0),
  code: z.string().max(50_000),
  language: z.enum(['javascript', 'typescript', 'python', 'java', 'cpp']).optional(),
  includeHidden: z.boolean().optional().default(false),
})

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

  const functionName = sanitizeFunctionName(q.functionName)
  const tests = [
    ...(q.publicTests || []),
    ...(parsed.data.includeHidden ? q.hiddenTests || [] : []),
  ]

  const publicCount = (q.publicTests || []).length
  const results = tests.map((t, i) => {
    const r = runOne(parsed.data.code, functionName, t.input, t.expected)
    const hidden = i >= publicCount
    // Hidden tests report pass/fail only — their inputs are part of the answer key (§12).
    return {
      index: i,
      input: hidden ? `hidden #${i - publicCount + 1}` : t.input,
      expected: hidden ? '(hidden)' : t.expected,
      passed: r.ok,
      actual: hidden ? undefined : r.actual,
      error: hidden ? (r.ok ? undefined : 'Wrong answer') : r.error,
    }
  })

  // Stored counts are a convenience for the UI only; the evaluator re-runs everything (§12).
  const passed = results.filter((r) => r.passed).length
  const answers = [...(doc.answers || [])]
  const existingIdx = answers.findIndex((a) => a.index === parsed.data.questionIndex)
  const entry = {
    ...(existingIdx >= 0 ? answers[existingIdx] : {}),
    index: parsed.data.questionIndex,
    answer: parsed.data.code,
    updatedAt: new Date(),
    testsPassed: passed,
    testsTotal: results.length,
    inputMode: 'coding' as const,
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
