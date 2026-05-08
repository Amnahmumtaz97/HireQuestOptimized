import { Schema, model, models, type Model } from 'mongoose'

export interface IInterviewQuestion {
  type: 'technical' | 'behavioral'
  topic: string
  question: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  illustrationDataUrl?: string | null
  /** Platform should supply a figure; candidate is not asked to draw or upload. */
  illustrationRequired?: boolean
}

export interface IInterviewSession {
  userId: string
  industryKey: string
  roleCategoryKey: string
  interviewType: 'technical' | 'behavioral' | 'both'
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  totalQuestions: number
  technicalQuestionRatio: number
  durationMinutes?: number | null
  /** Set when the session first enters in_progress; used for the session countdown timer. */
  interviewStartedAt?: Date | null
  status: 'created' | 'in_progress' | 'completed'
  questions?: IInterviewQuestion[]
  questionSource?: 'gemini' | 'template'
  currentQuestionIndex?: number
  /** Question indices the user flagged for review */
  flaggedQuestionIndexes?: number[]
  answers?: Array<{
    index: number
    answer: string
    updatedAt: Date
  }>
}

const interviewSessionSchema = new Schema<IInterviewSession>(
  {
    userId: { type: String, required: true, index: true },
    industryKey: { type: String, required: true, trim: true },
    roleCategoryKey: { type: String, required: true, trim: true },
    interviewType: {
      type: String,
      required: true,
      trim: true,
      enum: ['technical', 'behavioral', 'both'],
    },
    topics: { type: [String], required: true, default: [] },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
    totalQuestions: { type: Number, required: true, min: 1 },
    technicalQuestionRatio: { type: Number, required: true, min: 0, max: 100 },
    durationMinutes: { type: Number, min: 1, default: null },
    interviewStartedAt: { type: Date, default: null },
    status: {
      type: String,
      required: true,
      enum: ['created', 'in_progress', 'completed'],
      default: 'created',
    },
    questions: {
      type: [
        {
          type: { type: String, required: true, enum: ['technical', 'behavioral'] },
          topic: { type: String, required: true, trim: true },
          question: { type: String, required: true, trim: true },
          difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
          illustrationDataUrl: { type: String, default: null },
          illustrationRequired: { type: Boolean, default: false },
        },
      ],
      default: undefined,
    },
    questionSource: {
      type: String,
      enum: ['gemini', 'template'],
      default: undefined,
    },
    currentQuestionIndex: {
      type: Number,
      min: 0,
      default: 0,
    },
    flaggedQuestionIndexes: {
      type: [Number],
      default: [],
    },
    answers: {
      type: [
        {
          index: { type: Number, required: true, min: 0 },
          answer: { type: String, required: true, trim: true },
          updatedAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
)

export const InterviewSessionModel: Model<IInterviewSession> =
  models.InterviewSession ||
  model<IInterviewSession>('InterviewSession', interviewSessionSchema)

