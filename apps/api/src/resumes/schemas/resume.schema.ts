
import { z } from 'zod';

export const resumeContentSchema = z.object({
  personal: z.object({
    fullName: z.string().trim().min(2),
    email: z.email(),
    phone: z.string().default(''),
    city: z.string().default(''),
    linkedin: z.string().default(''),
    website: z.string().default(''),
  }),

  summary: z.string().default(''),

  experiences: z.array(
    z.object({
      id: z.uuid(),
      company: z.string().trim().min(1),
      role: z.string().trim().min(1),
      startDate: z.string(),
      endDate: z.string(),
      isCurrent: z.boolean(),
      description: z.string(),
    }),
  ).default([]),

  education: z.array(
    z.object({
      id: z.uuid(),
      institution: z.string().trim().min(1),
      course: z.string().trim().min(1),
      startDate: z.string(),
      endDate: z.string(),
      inProgress: z.boolean(),
    }),
  ).default([]),

  skills: z.array(z.string()).default([]),
});

export const createResumeSchema = z.object({
  title: z.string().trim().min(3).max(120),
  templateId: z.string().trim().min(1).nullable().default(null),
  content: resumeContentSchema,
});

export const updateResumeSchema = z.object({
  title: z.string().trim().min(3).max(120).optional(),
  templateId: z.string().trim().min(1).nullable().optional(),
  content: resumeContentSchema.optional(),
});

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;