import { Schema, model, models, type Model } from 'mongoose'
import type { InterviewSetupConfig } from '@/lib/interview-config/setup-types'

export interface IInterviewSetup extends InterviewSetupConfig {
  userId: string
}

const interviewSetupSchema = new Schema<IInterviewSetup>(
  {
    userId: { type: String, required: true, index: true },
    targetRole: { type: String, default: null },
    currentRole: { type: String, default: null },
    yearsExperience: { type: Number, default: null },
    seniorityLevel: { type: String, enum: ['junior', 'mid', 'senior'], required: false },
    domain: { type: String, default: null },
    education: { type: String, default: null },
    degree: { type: String, default: null },
    university: { type: String, default: null },
    graduationYear: { type: String, default: null },
    certifications: { type: [String], default: [] },
    resumeRawText: { type: String, default: null },
    programmingLanguages: { type: [String], default: [] },
    frameworks: { type: [String], default: [] },
    libraries: { type: [String], default: [] },
    databases: { type: [String], default: [] },
    cloudPlatforms: { type: [String], default: [] },
    devOpsTools: { type: [String], default: [] },
    operatingSystems: { type: [String], default: [] },
    concepts: { type: [String], default: [] },
    softSkills: { type: [String], default: [] },
    extractedSkills: { type: [String], default: [] },
    companies: { type: [String], default: [] },
    internships: { type: [String], default: [] },
    projects: {
      type: [
        {
          name: String,
          description: String,
          technologies: [String],
        },
      ],
      default: [],
    },
    achievements: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    topics: { type: [String], default: [] },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
      required: false,
    },
    interviewRoundType: {
      type: String,
      enum: ['technical_screen', 'system_design', 'behavioral', 'managerial'],
      required: false,
    },
    targetCompanyType: {
      type: String,
      enum: ['startup', 'mid_size', 'enterprise', 'faang'],
      required: false,
    },
    preferredQuestionFormat: {
      type: String,
      enum: ['coding', 'scenario', 'whiteboard', 'mixed'],
      required: false,
    },
    interviewDuration: { type: Number, default: null },
    numberOfQuestions: { type: Number, default: 12 },
    language: { type: String, default: 'English' },
    focusAreas: { type: [String], default: [] },
    excludedTopics: { type: [String], default: [] },
    resumeParsedFields: { type: [String], default: [] },
    manuallyFilledFields: { type: [String], default: [] },
  },
  { timestamps: true },
)

export const InterviewSetupModel: Model<IInterviewSetup> =
  models.InterviewSetup || model<IInterviewSetup>('InterviewSetup', interviewSetupSchema)
