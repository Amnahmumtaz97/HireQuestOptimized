import { Schema, model, models, type Model, type Types } from 'mongoose'

export type StageType = 'concept' | 'practice' | 'mock_interview' | 'ai_feedback'

export interface IStage {
  _id: Types.ObjectId
  pathId: Types.ObjectId
  order: number
  title: string
  type: StageType
  contentRef?: string
  unlockMinScore?: number | null
  level?: number | null
  departmentKey?: string
  specializationKeys?: string[]
  interviewType?: 'technical' | 'behavioral' | 'both' | 'hr' | null
  difficulty?: 'Easy' | 'Medium' | 'Hard' | 'Adaptive' | null
  suggestedTopics?: string[]
  totalQuestions?: number | null
  technicalQuestionRatio?: number | null
  isRemediation?: boolean
}

const stageSchema = new Schema<IStage>(
  {
    pathId: { type: Schema.Types.ObjectId, ref: 'LearningPath', required: true, index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['concept', 'practice', 'mock_interview', 'ai_feedback'],
      required: true,
    },
    contentRef: { type: String, trim: true, default: '' },
    unlockMinScore: { type: Number, default: null },
    level: { type: Number, min: 1, max: 6, default: null },
    departmentKey: { type: String, trim: true, default: '' },
    specializationKeys: { type: [String], default: [] },
    interviewType: {
      type: String,
      enum: ['technical', 'behavioral', 'both', 'hr'],
      required: false,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Adaptive'],
      required: false,
    },
    suggestedTopics: { type: [String], default: [] },
    totalQuestions: { type: Number, min: 1, default: null },
    technicalQuestionRatio: { type: Number, min: 0, max: 100, default: null },
    isRemediation: { type: Boolean, default: false },
  },
  { timestamps: true },
)

stageSchema.index({ pathId: 1, order: 1 })

export const StageModel: Model<IStage> =
  models.Stage || model<IStage>('Stage', stageSchema)
