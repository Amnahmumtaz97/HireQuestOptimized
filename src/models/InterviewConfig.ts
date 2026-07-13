import { Schema, model, models, type Model } from 'mongoose'

export interface IRoleCategoryConfig {
  key: string
  label: string
  interviewTypes: string[]
  technicalTopics: string[]
  behavioralTopics: string[]
  hrTopics: string[]
  technicalQuestionRatio: number
  durationEnabled: boolean
  durations: number[]
}

export interface IInterviewConfig {
  industryKey: string
  industryLabel: string
  description?: string
  roleCategories: IRoleCategoryConfig[]
  isActive: boolean
}

const roleCategorySchema = new Schema<IRoleCategoryConfig>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    interviewTypes: [{ type: String, required: true, trim: true }],
    technicalTopics: [{ type: String, required: true, trim: true }],
    behavioralTopics: [{ type: String, required: true, trim: true }],
    hrTopics: [{ type: String, trim: true, default: [] }],
    technicalQuestionRatio: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 70,
    },
    durationEnabled: {
      type: Boolean,
      default: true,
    },
    durations: [{ type: Number, min: 1 }],
  },
  { _id: false },
)

const interviewConfigSchema = new Schema<IInterviewConfig>(
  {
    industryKey: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    industryLabel: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    roleCategories: {
      type: [roleCategorySchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
)

export const InterviewConfigModel: Model<IInterviewConfig> =
  models.InterviewConfig || model<IInterviewConfig>('InterviewConfig', interviewConfigSchema)
