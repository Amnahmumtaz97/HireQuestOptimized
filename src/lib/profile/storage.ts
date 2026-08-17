import { resumeParseSchema, type ResumeParseResult } from '@/lib/resume/schema'

export const PROFILE_STORAGE_KEY = 'hirequest.profile'

type StoredProfileRecord = Record<string, unknown> & {
  resume?: ResumeParseResult | null
}

function readProfileRecord(): StoredProfileRecord {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as StoredProfileRecord) : {}
  } catch {
    return {}
  }
}

export function getSavedProfileResume(): ResumeParseResult | null {
  const resume = readProfileRecord().resume
  if (!resume) return null
  const parsed = resumeParseSchema.safeParse(resume)
  return parsed.success ? parsed.data : null
}

export function setSavedProfileResume(resume: ResumeParseResult | null) {
  if (typeof window === 'undefined') return
  try {
    const profile = readProfileRecord()
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ ...profile, resume }),
    )
  } catch {
    // The profile form's normal save flow will report storage failures.
  }
}
