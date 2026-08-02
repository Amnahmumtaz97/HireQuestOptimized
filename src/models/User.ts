import { Schema, model, models, type Model } from 'mongoose'

export type UserRole = 'user' | 'admin'
export type AuthProvider = 'credentials' | 'google' | 'github'
export type PreferenceDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Adaptive'

export interface IUserPreferences {
  defaultDifficulty?: PreferenceDifficulty
  reduceMotion?: boolean
}

export interface IUserGamification {
  xp?: number
  currentStreak?: number
  longestStreak?: number
  lastPracticeDate?: string | null
  interviewsCompleted?: number
  questionsAnswered?: number
}

export interface IUser {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  passwordHash?: string
  image?: string
  authProvider?: AuthProvider
  role: UserRole
  preferences?: IUserPreferences
  gamification?: IUserGamification
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: '',
    },
    passwordHash: {
      type: String,
      required: false,
    },
    image: {
      type: String,
      trim: true,
      default: '',
    },
    authProvider: {
      type: String,
      enum: ['credentials', 'google', 'github'],
      default: 'credentials',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    preferences: {
      defaultDifficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Adaptive'],
        required: false,
      },
      reduceMotion: {
        type: Boolean,
        default: false,
      },
    },
    gamification: {
      xp: { type: Number, default: 0 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastPracticeDate: { type: String, default: null },
      interviewsCompleted: { type: Number, default: 0 },
      questionsAnswered: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
)

export const UserModel: Model<IUser> =
  models.User || model<IUser>('User', userSchema)
