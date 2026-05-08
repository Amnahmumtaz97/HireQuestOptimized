'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export type InterviewSessionState = {
  _id: string
  status: 'created' | 'in_progress' | 'completed'
  durationMinutes?: number | null
  interviewStartedAt?: string | null
  questions?: Array<{
    question: string
    type: 'technical' | 'behavioral'
    topic: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    illustrationDataUrl?: string | null
    illustrationRequired?: boolean
  }>
  currentQuestionIndex?: number
  flaggedQuestionIndexes?: number[]
  answers?: Array<{ index: number; answer: string; updatedAt: string }>
}

export function useInterviewSession(interviewId: string | undefined) {
  const [session, setSession] = useState<InterviewSessionState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const timerStartAttempted = useRef(false)

  const load = useCallback(async () => {
    if (!interviewId) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/interviews/${interviewId}`)
      const data = await res.json()
      if (!res.ok) {
        setError((data.message as string) ?? 'Failed to load interview')
        return
      }
      setSession((data.session ?? null) as InterviewSessionState | null)
    } catch {
      setError('Failed to load interview')
    } finally {
      setIsLoading(false)
    }
  }, [interviewId])

  useEffect(() => {
    void load()
  }, [load])

  const questions = session?.questions ?? []
  const rawIndex = session?.currentQuestionIndex ?? 0
  const index = Math.min(Math.max(rawIndex, 0), Math.max(questions.length - 1, 0))

  const answerMap = useMemo(() => {
    const map = new Map<number, string>()
    for (const a of session?.answers ?? []) map.set(a.index, a.answer)
    return map
  }, [session?.answers])

  const flaggedSet = useMemo(() => new Set(session?.flaggedQuestionIndexes ?? []), [session?.flaggedQuestionIndexes])

  const allQuestionsAttempted = useMemo(() => {
    if (questions.length === 0) return false
    for (let i = 0; i < questions.length; i++) {
      const text = (answerMap.get(i) ?? '').trim()
      if (!text) return false
    }
    return true
  }, [answerMap, questions.length])

  const canShowFinish = questions.length > 0 && (index >= questions.length - 1 || allQuestionsAttempted)

  const patchSession = useCallback(
    async (body: Record<string, unknown>, options?: { silent?: boolean }) => {
      if (!session?._id) return null
      const silent = Boolean(options?.silent)
      if (!silent) {
        setIsSaving(true)
        setError('')
      }
      try {
        const res = await fetch(`/api/interviews/${session._id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) {
          setError((data.message as string) ?? 'Failed to update interview')
          return null
        }
        const next = (data.session ?? null) as InterviewSessionState | null
        if (next) setSession(next)
        return next
      } catch {
        if (!silent) setError('Failed to update interview')
        return null
      } finally {
        if (!silent) setIsSaving(false)
      }
    },
    [session?._id],
  )

  useEffect(() => {
    timerStartAttempted.current = false
  }, [interviewId])

  /** When a timed session loads with questions, move to in_progress and anchor interviewStartedAt immediately (no need to save first). */
  useEffect(() => {
    if (isLoading || !session) return
    if (session.status === 'completed') return
    if (questions.length === 0) return
    const dm = session.durationMinutes
    if (typeof dm !== 'number' || dm < 1) return
    if (session.interviewStartedAt) return
    if (timerStartAttempted.current) return
    timerStartAttempted.current = true

    void (async () => {
      const next = await patchSession(
        { status: 'in_progress', currentQuestionIndex: index },
        { silent: true },
      )
      if (!next) timerStartAttempted.current = false
    })()
  }, [
    isLoading,
    session?._id,
    session?.durationMinutes,
    session?.interviewStartedAt,
    session?.status,
    questions.length,
    index,
    patchSession,
  ])

  const saveAnswer = useCallback(
    async (answerText: string) => {
      if (!session) return null
      const trimmed = answerText.trim()
      if (!trimmed) {
        setError('Answer cannot be empty')
        return null
      }
      return patchSession({
        status: session.status === 'created' ? 'in_progress' : session.status,
        currentQuestionIndex: index,
        answer: { index, answer: trimmed },
      })
    },
    [index, patchSession, session],
  )

  const goToQuestion = useCallback(
    async (nextIndex: number) => {
      if (!session) return
      const clamped = Math.min(Math.max(nextIndex, 0), Math.max(questions.length - 1, 0))
      setSession((prev) => (prev ? { ...prev, currentQuestionIndex: clamped } : prev))
      await patchSession({ status: 'in_progress', currentQuestionIndex: clamped })
    },
    [patchSession, questions.length, session],
  )

  const setFlagged = useCallback(
    async (questionIndex: number, flagged: boolean) => {
      const body: Record<string, unknown> = {
        flag: { index: questionIndex, flagged },
      }
      if (session?.status === 'created') body.status = 'in_progress'
      return patchSession(body)
    },
    [patchSession, session?.status],
  )

  const finishInterview = useCallback(async () => {
    return patchSession({ status: 'completed' })
  }, [patchSession])

  const regenerateQuestions = useCallback(async () => {
    if (!session?._id) return null
    setIsSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/interviews/${session._id}/generate-questions`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError((data.message as string) ?? 'Failed to generate questions')
        return null
      }
      const next = (data.session ?? null) as InterviewSessionState | null
      if (next) setSession(next)
      return next
    } catch {
      setError('Failed to generate questions')
      return null
    } finally {
      setIsSaving(false)
    }
  }, [session?._id])

  return {
    session,
    isLoading,
    error,
    setError,
    isSaving,
    load,
    questions,
    index,
    answerMap,
    flaggedSet,
    allQuestionsAttempted,
    canShowFinish,
    saveAnswer,
    goToQuestion,
    setFlagged,
    finishInterview,
    regenerateQuestions,
  }
}
