import { z } from 'zod'

/** Shared resume context shape for create + generate-questions. */
export const resumeContextSchema = z
  .object({
    name: z.string().max(200).nullable().optional(),
    yearsExperience: z.number().min(0).max(60).nullable().optional(),
    seniorityLevel: z.string().max(40).nullable().optional(),
    domain: z.string().max(120).nullable().optional(),
    skills: z.array(z.string().max(80)).max(40).optional(),
    projects: z
      .array(
        z.object({
          name: z.string().max(200),
          description: z.string().max(800),
          technologies: z.array(z.string().max(60)).max(20).optional(),
        }),
      )
      .max(10)
      .optional(),
  })
  .nullable()
  .optional()

export type ResumeContextInput = z.infer<typeof resumeContextSchema>
