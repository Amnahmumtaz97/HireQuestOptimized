import { requiresSpokenAnswer } from '@/lib/interview-config/interview-types'

/** Shared server/client check for Soft Skills voice-only answers. */
export function softSkillsRequiresSpoken(input: {
  interviewType?: string | null
  questionType?: string | null
  questionKind?: string | null
}): boolean {
  if (input.questionKind === 'coding') return false
  return requiresSpokenAnswer({
    interviewType: input.interviewType,
    questionType: input.questionType,
  })
}

export const SOFT_SKILLS_TYPED_REJECT_MESSAGE =
  'Soft Skills answers must use speech-to-text. Typed answers are not allowed.'
