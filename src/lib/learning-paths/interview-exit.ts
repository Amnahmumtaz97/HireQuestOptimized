/** Resolve where Exit / Back should go after an interview session. */
export function interviewExitHref(session: {
  learningPathId?: string | null
} | null | undefined): string {
  const pathId = session?.learningPathId?.trim()
  if (pathId) return `/app/learning-paths/${pathId}`
  return '/app/interviews'
}

export function interviewExitLabel(session: {
  learningPathId?: string | null
} | null | undefined): string {
  return session?.learningPathId ? 'Back to path' : 'Exit'
}
