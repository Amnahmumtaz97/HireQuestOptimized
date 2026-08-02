import { Schema, model, models, type Model } from 'mongoose'
import {
  PATH_CATEGORIES,
  PATH_DIFFICULTY_LABELS,
  type PathCategory,
  type PathDifficultyLabel,
} from '@/lib/learning-paths/constants'

export interface ILearningPath {
  title: string
  description: string
  targetAudience: string
  slug?: string
  category: PathCategory
  subcategory?: string
  tags?: string[]
  estimatedInterviews?: number | null
  difficultyLabel?: PathDifficultyLabel | null
  estimatedMinutes?: number | null
  isFeatured?: boolean
  /** Personal / resume-generated paths are scoped to this user */
  ownerUserId?: string | null
}

const learningPathSchema = new Schema<ILearningPath>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    targetAudience: { type: String, required: true, trim: true, index: true },
    slug: { type: String, trim: true, unique: true, sparse: true },
    category: {
      type: String,
      enum: PATH_CATEGORIES,
      default: 'technology',
      index: true,
    },
    subcategory: { type: String, trim: true, default: '', index: true },
    tags: { type: [String], default: [] },
    estimatedInterviews: { type: Number, default: null },
    difficultyLabel: {
      type: String,
      enum: PATH_DIFFICULTY_LABELS,
      required: false,
    },
    estimatedMinutes: { type: Number, default: null },
    isFeatured: { type: Boolean, default: false, index: true },
    ownerUserId: { type: String, default: null, index: true },
  },
  { timestamps: true },
)

learningPathSchema.index({ title: 'text', description: 'text', tags: 'text' })

export const LearningPathModel: Model<ILearningPath> =
  models.LearningPath || model<ILearningPath>('LearningPath', learningPathSchema)
