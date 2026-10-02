import { NextResponse, after } from 'next/server'
import { getServerSession } from 'next-auth'
import { isValidObjectId } from 'mongoose'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongoose'
import { checkRateLimit } from '@/lib/rate-limit'
import { InterviewSessionModel } from '@/models/InterviewSession'
import { STALE_RUN_MS, runEvaluationForSession } from '@/lib/evaluation/run-evaluation'

export const runtime = 'nodejs'
// Four to five judge calls plus test re-runs; per-batch persistence lets a re-call resume.
export const maxDuration = 60

const bodySchema = z.object({
  /** Re-run even when a result exists (e.g. "retry AI grading"). Reused hashes stay cheap. */
  force: z.boolean().optional().default(false),
})

/**
 * §23 — POST /api/interviews/[id]/evaluate
 * Marks the session `running`, schedules the pipeline after the response, returns 202.
 * The results page polls GET /api/interviews/[id] until `evaluationStatus` is ready|failed.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ message: 'Invalid interview id' }, { status: 400 })
  }

  const rate = checkRateLimit(`evaluate:${session.user.id}`, { limit: 30, windowMs: 60 * 60 * 1000 })
  if (rate.ok === false) {
    return NextResponse.json(
      { message: `Too many evaluation requests. Try again in ${rate.retryAfterSec}s.` },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } },
    )
  }

  const body = bodySchema.safeParse(await request.json().catch(() => ({})))
  const force = body.success ? body.data.force : false

  try {
    await connectToDatabase()
    const filter = { _id: id, userId: session.user.id }
    const doc = await InterviewSessionModel.findOne(filter)
      .select('status evaluationStatus evaluationStartedAt questions')
      .lean()
    if (!doc) {
      return NextResponse.json({ message: 'Interview not found' }, { status: 404 })
    }
    if (doc.status !== 'completed') {
      return NextResponse.json({ message: 'Finish the interview before evaluating it.' }, { status: 409 })
    }
    if (!doc.questions?.length) {
      return NextResponse.json({ message: 'Nothing to evaluate.' }, { status: 409 })
    }

    const startedAt = doc.evaluationStartedAt ? new Date(doc.evaluationStartedAt).getTime() : 0
    const running = doc.evaluationStatus === 'running' && Date.now() - startedAt < STALE_RUN_MS
    if (running) {
      return NextResponse.json({ status: 'running' }, { status: 202 })
    }
    if (doc.evaluationStatus === 'ready' && !force) {
      return NextResponse.json({ status: 'ready' }, { status: 200 })
    }

    // Claim the run atomically so two concurrent calls cannot both start it.
    const claimed = await InterviewSessionModel.findOneAndUpdate(
      {
        ...filter,
        $or: [
          { evaluationStatus: { $ne: 'running' } },
          { evaluationStartedAt: { $lt: new Date(Date.now() - STALE_RUN_MS) } },
        ],
      },
      { $set: { evaluationStatus: 'running', evaluationStartedAt: new Date(), evaluationError: null } },
    ).lean()
    if (!claimed) {
      return NextResponse.json({ status: 'running' }, { status: 202 })
    }

    const userId = session.user.id
    after(() => runEvaluationForSession(id, userId))

    return NextResponse.json({ status: 'running' }, { status: 202 })
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to start evaluation' },
      { status: 500 },
    )
  }
}
