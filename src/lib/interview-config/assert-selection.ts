/**
 * Fail closed when generation would invent topics / departments.
 * Call before Gemini or template builders (coding / system design banks).
 */

export class InterviewConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InterviewConfigError'
  }
}

export function assertConfirmedTopics(topics: readonly string[] | null | undefined): string[] {
  const cleaned = (topics ?? []).map((t) => t.trim()).filter(Boolean)
  if (cleaned.length === 0) {
    throw new InterviewConfigError(
      'No confirmed interview topics selected. Refuse to invent departments, specializations, or topics.',
    )
  }
  return cleaned
}

export function assertTopicInBank(topic: string, bank: readonly string[]): void {
  if (!bank.includes(topic)) {
    throw new InterviewConfigError(
      `Topic "${topic}" is outside the confirmed selection bank.`,
    )
  }
}
