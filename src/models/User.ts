import { Schema, model, models, type Model } from 'mongoose'

export type UserRole = 'user' | 'admin'
export type AuthProvider = 'credentials' | 'google' | 'github'

export interface IUser {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  passwordHash?: string
  image?: string
  authProvider?: AuthProvider
  role: UserRole
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
  },
  {
    timestamps: true,
  },
)

export const UserModel: Model<IUser> =
  models.User || model<IUser>('User', userSchema)
