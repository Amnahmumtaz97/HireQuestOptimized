export const GUIDANCE_TIPS = {
  'new-interview':
    'Welcome! Create your first interview: pick a type, then follow the steps for department, topics, and difficulty. You can also start from a resume further down.',
  'path-interview':
    'This session is tied to a learning-path stage. Topics stay locked — adjust question count, duration, and difficulty, then generate.',
  'resume-interview':
    'Upload a resume to auto-fill role and topics, review the setup, then generate a tailored interview.',
  interviews:
    'All your sessions live here. Filter by status, resume one that’s in progress, or start a new interview.',
  /** Technical and system design: type, or speak into the mic. */
  'interview-session':
    'Type your answer, or tap the mic to speak, then Save. Flag questions to revisit later. Use Next to move on, and Finish when you’ve attempted them all.',
  /** Soft Skills (Behavioral / Screening HR): speech-to-text only — no textarea. */
  'interview-spoken':
    'Tap the mic and speak your answer, then Save. This interview is voice-only. Flag questions to revisit later. Use Next to move on, and Finish when you’ve attempted them all.',
  'interview-coding':
    'This is a coding question. Pick a language, write your solution in the editor, and run the tests before you save. Flag questions to revisit later, use Next to move on, and Finish when you’ve attempted them all.',
  'interview-generate':
    'No questions yet. Tap Generate Questions to build this session, then start answering.',
  'interview-results':
    'Review your answers and anything you flagged. Use this recap to decide what to practice next.',
  results:
    'This overview charts your practice over time. Complete interviews to fill in scores and trends.',
  dashboard:
    'Your week at a glance. Jump back into today’s sessions, check reminders, or start a new practice from here.',
  'learning-paths':
    'Pick a category to follow a guided path. Enroll, complete stages in order, and generate interviews from each stage.',
  certifications:
    'Search and filter credentials. Bookmark ones you want, then open a card for official links and related practice paths.',
  'path-detail':
    'Work through the roadmap on the left. Complete stages in order — some unlock interviews you can take right here.',
  'certification-detail':
    'Check cost, exam, and skills, then use related learning paths below to practice for this credential.',
  'question-bank':
    'Pick a topic to start a focused interview. Bookmark ones you want to revisit from Bookmarks.',
  bookmarks:
    'Everything you saved — credentials, learning paths, and question-bank topics — lives here.',
  mocks:
    'Choose a timed-style preset. You’ll still confirm difficulty and length before questions generate.',
} as const

export type GuidanceKey = keyof typeof GUIDANCE_TIPS

/**
 * Session toast for the question currently on screen.
 * Soft Skills is voice-only, coding uses the editor, and technical / system
 * design can be typed or spoken. Mixed sessions switch as the question changes.
 */
export function interviewSessionGuidance(input: {
  loading: boolean
  hasSession: boolean
  completed: boolean
  hasQuestion: boolean
  coding: boolean
  voiceOnly: boolean
}): { key: GuidanceKey; message: string } | null {
  if (input.loading || !input.hasSession || input.completed) return null
  if (!input.hasQuestion) {
    return { key: 'interview-generate', message: GUIDANCE_TIPS['interview-generate'] }
  }
  if (input.coding) {
    return { key: 'interview-coding', message: GUIDANCE_TIPS['interview-coding'] }
  }
  if (input.voiceOnly) {
    return { key: 'interview-spoken', message: GUIDANCE_TIPS['interview-spoken'] }
  }
  return { key: 'interview-session', message: GUIDANCE_TIPS['interview-session'] }
}
