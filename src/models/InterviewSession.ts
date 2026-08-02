import { Schema, model, models, type Model } from 'mongoose'

export interface IInterviewQuestion {
  type: 'technical' | 'behavioral' | 'hr'
  topic: string
  question: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  illustrationDataUrl?: string | null
  /** Platform should supply a figure; candidate is not asked to draw or upload. */
  illustrationRequired?: boolean
  kind?: 'spoken' | 'coding'
  language?: 'javascript' | 'python'
  starterCode?: string
  functionName?: string
  publicTests?: Array<{ input: string; expected: string }>
  hiddenTests?: Array<{ input: string; expected: string }>
}

export interface IInterviewSession {
  userId: string
  /** @deprecated Use departmentKey */
  industryKey: string
  /** Exactly one department per interview session. */
  departmentKey?: string
  /** @deprecated Prefer departmentKey; kept as a one-element array for legacy readers. */
  departmentKeys?: string[]
  /** @deprecated Multi-department selection is no longer supported. */
  selectAllDepartments?: boolean
  /** @deprecated Use departmentKey */
  industryKeys?: string[]
  /** @deprecated Multi-department selection is no longer supported. */
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
  interviewType:
    | 'technical'
    | 'behavioral'
    | 'both'
    | 'hr'
    | 'coding'
    | 'system_design'
    | 'mixed'
  /** Concrete kinds when multiple types were selected (interviewType is `both` / `mixed`). */
  interviewTypes?: Array<'technical' | 'behavioral' | 'hr' | 'coding' | 'system_design'>
  topics: string[]
  /** Typed config snapshot for non-universal taxonomies. */
  configPayload?: Record<string, unknown> | null
  codingCategories?: string[]
  behavioralCompetencies?: string[]
  hrSections?: string[]
  systemDesignTopics?: string[]
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
    testsPassed?: number
    testsTotal?: number
  }>
  learningPathId?: string | null
  learningStageId?: string | null
  pathRemediationId?: string | null
  entryMode?: 'manual' | 'resume' | 'path'
  resumeContext?: Record<string, unknown> | null
  preferredQuestionFormat?: 'mixed' | 'coding' | 'scenario' | 'whiteboard' | null
}

const INTERVIEW_TYPE_ENUM = [
  'technical',
  'behavioral',
  'both',
  'hr',
  'coding',
  'system_design',
  'mixed',
] as const

const INTERVIEW_TYPES_ITEM_ENUM = [
  'technical',
  'behavioral',
  'hr',
  'coding',
  'system_design',
] as const

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
      enum: [...INTERVIEW_TYPE_ENUM],
    },
    interviewTypes: {
      type: [
        {
          type: String,
          enum: [...INTERVIEW_TYPES_ITEM_ENUM],
        },
      ],
      default: undefined,
    },
    topics: { type: [String], required: true, default: [] },
    configPayload: { type: Schema.Types.Mixed, default: null },
    codingCategories: { type: [String], default: undefined },
    behavioralCompetencies: { type: [String], default: undefined },
    hrSections: { type: [String], default: undefined },
    systemDesignTopics: { type: [String], default: undefined },
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
          type: { type: String, required: true, enum: ['technical', 'behavioral', 'hr'] },
          topic: { type: String, required: true, trim: true },
          question: { type: String, required: true, trim: true },
          difficulty: { type: String, required: true, enum: ['Easy', 'Medium', 'Hard'] },
          illustrationDataUrl: { type: String, default: null },
          illustrationRequired: { type: Boolean, default: false },
          kind: { type: String, enum: ['spoken', 'coding'], default: 'spoken' },
          language: { type: String, enum: ['javascript', 'python'], default: undefined },
          starterCode: { type: String, default: undefined },
          functionName: { type: String, default: undefined },
          publicTests: {
            type: [{ input: String, expected: String }],
            default: undefined,
          },
          hiddenTests: {
            type: [{ input: String, expected: String }],
            default: undefined,
          },
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
          testsPassed: { type: Number },
          testsTotal: { type: Number },
        },
      ],
      default: [],
    },
    learningPathId: { type: String, trim: true, default: null, index: true },
    learningStageId: { type: String, trim: true, default: null, index: true },
    pathRemediationId: { type: String, trim: true, default: null },
    entryMode: {
      type: String,
      enum: ['manual', 'resume', 'path'],
      default: 'manual',
    },
    resumeContext: { type: Schema.Types.Mixed, default: null },
    preferredQuestionFormat: {
      type: String,
      enum: ['mixed', 'coding', 'scenario', 'whiteboard'],
      default: null,
    },
  },
  { timestamps: true },
)

/** Next.js HMR keeps the first compiled model; drop it so enum/schema updates apply. */
function syncInterviewSessionSchema(cached: Schema): void {
  const typePath = cached.path('interviewType') as
    | { enumValues?: string[]; options?: { enum?: string[] } }
    | undefined
  if (typePath) {
    typePath.enumValues = [...INTERVIEW_TYPE_ENUM]
    if (typePath.options) typePath.options.enum = [...INTERVIEW_TYPE_ENUM]
  }

  const typesPath = cached.path('interviewTypes') as
    | { caster?: { enumValues?: string[]; options?: { enum?: string[] } } }
    | undefined
  const itemPath =
    (typesPath?.caster as { enumValues?: string[]; options?: { enum?: string[] } } | undefined) ??
    (cached.path('interviewTypes.0') as
      | { enumValues?: string[]; options?: { enum?: string[] } }
      | undefined)
  if (itemPath) {
    itemPath.enumValues = [...INTERVIEW_TYPES_ITEM_ENUM]
    if (itemPath.options) itemPath.options.enum = [...INTERVIEW_TYPES_ITEM_ENUM]
  }

  if (!cached.path('pathRemediationId')) {
    cached.add({
      pathRemediationId: { type: String, trim: true, default: null },
    })
  }
  if (!cached.path('configPayload')) {
    cached.add({
      configPayload: { type: Schema.Types.Mixed, default: null },
      codingCategories: { type: [String], default: undefined },
      behavioralCompetencies: { type: [String], default: undefined },
      hrSections: { type: [String], default: undefined },
      systemDesignTopics: { type: [String], default: undefined },
    })
  }
  if (!cached.path('resumeContext')) {
    cached.add({
      learningPathId: { type: String, trim: true, default: null, index: true },
      learningStageId: { type: String, trim: true, default: null, index: true },
      entryMode: {
        type: String,
        enum: ['manual', 'resume', 'path'],
        default: 'manual',
      },
      resumeContext: { type: Schema.Types.Mixed, default: null },
    })
  }
}

if (models.InterviewSession) {
  syncInterviewSessionSchema(models.InterviewSession.schema)
  // Force recompile so validators pick up enum changes (HMR-safe).
  // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
  delete models.InterviewSession
}

export const InterviewSessionModel: Model<IInterviewSession> = model<IInterviewSession>(
  'InterviewSession',
  interviewSessionSchema,
)

