import { Schema, model, models, type Model, type Types } from 'mongoose'

import type { StageInterviewType } from '@/models/Stage'

export type UserPathStatus = 'in_progress' | 'completed' | 'abandoned'

export type TopicStat = {
  attempts: number
  totalScore: number
  avgScore: number
}

export type RemediationQueueItem = {
  id: string
  sourceStageId: string
  title: string
  topics: string[]
  departmentKey: string
  specializationKeys: string[]
  interviewType: StageInterviewType | null
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Adaptive' | null
  totalQuestions: number
  technicalQuestionRatio: number
  completed: boolean
}

export interface IUserPathProgress {
  userId: string
  pathId: Types.ObjectId
  currentStageId?: Types.ObjectId | null
  completedStageIds: Types.ObjectId[]
  stageScores: Record<string, number>
  status: UserPathStatus
  startedAt: Date
  lastActivityAt: Date
  topicStats?: Record<string, TopicStat>
  remediationQueue?: RemediationQueueItem[]
  activeRemediationId?: string | null
  xpEarned?: number
}

const topicStatSchema = new Schema(
  {
    attempts: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
  },
  { _id: false },
)

const remediationSchema = new Schema(
  {
    id: { type: String, required: true },
    sourceStageId: { type: String, required: true },
    title: { type: String, required: true },
    topics: { type: [String], default: [] },
    departmentKey: { type: String, default: '' },
    specializationKeys: { type: [String], default: [] },
    interviewType: { type: String, default: null },
    difficulty: { type: String, default: null },
    totalQuestions: { type: Number, default: 8 },
    technicalQuestionRatio: { type: Number, default: 80 },
    completed: { type: Boolean, default: false },
  },
  { _id: false },
)

const userPathProgressSchema = new Schema<IUserPathProgress>(
  {
    userId: { type: String, required: true, index: true },
    pathId: { type: Schema.Types.ObjectId, ref: 'LearningPath', required: true, index: true },
    currentStageId: { type: Schema.Types.ObjectId, ref: 'Stage', default: null },
    completedStageIds: { type: [Schema.Types.ObjectId], default: [] },
    stageScores: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    startedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now },
    topicStats: { type: Schema.Types.Mixed, default: {} },
    remediationQueue: { type: [remediationSchema], default: [] },
    activeRemediationId: { type: String, default: null },
    xpEarned: { type: Number, default: 0 },
  },
  { timestamps: false },
)

userPathProgressSchema.index({ userId: 1, pathId: 1 }, { unique: true })

export const UserPathProgressModel: Model<IUserPathProgress> =
  models.UserPathProgress ||
  model<IUserPathProgress>('UserPathProgress', userPathProgressSchema)
