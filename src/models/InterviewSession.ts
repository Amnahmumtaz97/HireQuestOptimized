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
  /** @deprecated Use departmentKey */
  industryKey: string
  departmentKey?: string
  departmentKeys?: string[]
  selectAllDepartments?: boolean
  /** @deprecated Use departmentKeys / selectAllDepartments */
  industryKeys?: string[]
  selectAllIndustries?: boolean
  /** @deprecated Use specializationKey */
  roleCategoryKey: string
  specializationKey?: string
  specializationRefs?: string[]
  /** @deprecated Use specializationRefs */
  roleRefs?: string[]
  specializationKeys?: string[]
  /** @deprecated Use specializationKeys */
  roleCategoryKeys?: string[]
  selectAllSpecializations?: boolean
  /** @deprecated Use selectAllSpecializations */
  selectAllRoleCategories?: boolean
  selectAllTopics?: boolean
  interviewType: 'technical' | 'behavioral' | 'both'
  topics: string[]
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive'
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
    departmentKey: { type: String, trim: true },
    departmentKeys: { type: [String], default: [] },
    selectAllDepartments: { type: Boolean, default: false },
    industryKeys: { type: [String], default: [] },
    selectAllIndustries: { type: Boolean, default: false },
    roleCategoryKey: { type: String, required: true, trim: true },
    specializationKey: { type: String, trim: true },
    specializationRefs: { type: [String], default: [] },
    roleRefs: { type: [String], default: [] },
    specializationKeys: { type: [String], default: [] },
    roleCategoryKeys: { type: [String], default: [] },
    selectAllSpecializations: { type: Boolean, default: false },
    selectAllRoleCategories: { type: Boolean, default: false },
    selectAllTopics: { type: Boolean, default: false },
    interviewType: {
      type: String,
      required: true,
      trim: true,
      enum: ['technical', 'behavioral', 'both'],
    },
    topics: { type: [String], required: true, default: [] },
    difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard', 'Adaptive'] },
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

