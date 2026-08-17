export const GUIDANCE_TIPS = {
  'new-interview':
    'Welcome! Create your first interview: pick a type, then follow the steps for department, topics, and difficulty. You can also start from a resume further down.',
  'path-interview':
    'This session is tied to a learning-path stage. Topics stay locked — adjust question count, duration, and difficulty, then generate.',
  'resume-interview':
    'Upload a resume to auto-fill role and topics, review the setup, then generate a tailored interview.',
  interviews:
    'All your sessions live here. Filter by status, resume one that’s in progress, or start a new interview.',
  'interview-session':
    'Type your answer, then Save. Flag questions to revisit later. Use Next to move on, and Finish when you’ve attempted them all.',
  'interview-coding':
    'This is a coding question. Pick a language, write your solution in the editor, and run the tests before you save.',
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
