import type { ResumeParseResult } from '@/lib/resume/schema'

export type InterviewEntryMode = 'manual' | 'resume' | 'path'

export type CreateInterviewClientPayload = {
  departmentKey: string
  specializationKey?: string
  specializationRefs: string[]
  specializationKeys?: string[]
  selectAllSpecializations?: boolean
  selectAllTopics?: boolean
  interviewType: 'technical' | 'behavioral' | 'both' | 'hr'
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive'
  totalQuestions: number
  technicalQuestionRatio: number
  durationMinutes?: number | null
  entryMode: InterviewEntryMode
  learningPathId?: string | null
  learningStageId?: string | null
  resumeContext?: Pick<
    ResumeParseResult,
    'name' | 'yearsExperience' | 'seniorityLevel' | 'domain' | 'skills' | 'projects'
  > | null
}

export type CreateInterviewResult = {
  sessionId: string
  source: 'gemini' | 'template' | string
  warnings: string[]
}

export async function createInterviewAndGenerateQuestions(
  payload: CreateInterviewClientPayload,
): Promise<CreateInterviewResult> {
  const response = await fetch('/api/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to create interview')
  }

  const sessionId = data.session?._id as string | undefined
  if (!sessionId) {
    throw new Error('Interview created but missing session id')
  }

  // Always send resume/path so Gemini gets them even if session persistence lagged.
  const genRes = await fetch(`/api/interviews/${sessionId}/generate-questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      resumeContext: payload.resumeContext ?? null,
      learningPathId: payload.learningPathId || undefined,
      learningStageId: payload.learningStageId || undefined,
    }),
  })
  const genData = await genRes.json()
  if (!genRes.ok) {
    throw new Error(genData.message ?? 'Interview saved, but question generation failed')
  }

  return {
    sessionId,
    source: (genData.source as string) || 'unknown',
    warnings: Array.isArray(genData.warnings) ? genData.warnings : [],
  }
}
