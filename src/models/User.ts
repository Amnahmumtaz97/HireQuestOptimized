import { Schema, model, models, type Model } from 'mongoose'

export type UserRole = 'user' | 'admin'

export interface IUser {
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  passwordHash: string
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
      required: true,
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
