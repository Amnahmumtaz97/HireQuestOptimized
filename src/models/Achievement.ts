import { Schema, model, models, type Model } from 'mongoose'

export interface IAchievement {
  userId: string
  key: string
  title: string
  description: string
  unlockedAt: Date
}

const achievementSchema = new Schema<IAchievement>(
  {
    userId: { type: String, required: true, index: true },
    key: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    unlockedAt: { type: Date, default: Date.now },
  },
  { timestamps: false },
)

achievementSchema.index({ userId: 1, key: 1 }, { unique: true })

export const AchievementModel: Model<IAchievement> =
  models.Achievement || model<IAchievement>('Achievement', achievementSchema)

export const ACHIEVEMENT_DEFS = [
  {
    key: 'first_interview',
    title: 'First Interview',
    description: 'Completed your first interview.',
    threshold: 1,
    metric: 'interviews' as const,
  },
  {
    key: 'interviews_5',
    title: '5 Interviews Completed',
    description: 'Completed 5 interviews.',
    threshold: 5,
    metric: 'interviews' as const,
  },
  {
    key: 'questions_100',
    title: '100 Questions Answered',
    description: 'Answered 100 interview questions.',
    threshold: 100,
    metric: 'questions' as const,
  },
  {
    key: 'questions_500',
    title: '500 Questions Answered',
    description: 'Answered 500 interview questions.',
    threshold: 500,
    metric: 'questions' as const,
  },
  {
    key: 'streak_10',
    title: '10-Day Streak',
    description: 'Practiced on 10 consecutive days.',
    threshold: 10,
    metric: 'streak' as const,
  },
  {
    key: 'perfect_interview',
    title: 'Perfect Interview',
    description: 'Scored 100 on an interview stage.',
    threshold: 100,
    metric: 'perfect' as const,
  },
  {
    key: 'communication_pro',
    title: 'Communication Pro',
    description: 'Completed a communication or behavioral skills path stage.',
    threshold: 1,
    metric: 'skills_stage' as const,
  },
] as const
