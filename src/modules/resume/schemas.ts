import {
	type LegacyEducation,
	type LegacyExperience,
	type LegacyProject,
	type LegacySkills,
	legacyEducationSchema,
	legacyExperienceSchema,
	legacyProjectSchema,
	legacySkillsSchema,
	type ResumeContent,
	resumeContentSchema,
} from '@/shared/schemas/resume-content.schema'
import { z } from 'zod'

// Re-export the canonical schema and types
export { resumeContentSchema, type ResumeContent }

// Re-export legacy types for backward compatibility
export type { LegacyEducation, LegacyExperience, LegacyProject, LegacySkills }

// Step 1 validation - only headline required
export const step1Schema = z.object({
	competencies: z.array(z.string()).optional().default([]),
	headline: z.string().min(1, 'Headline is required'),
	summary: z.string().optional(),
})

// Step 2 validation - Experience (all optional if array is empty)
export const step2Schema = z.object({
	experience: z.array(legacyExperienceSchema).optional().default([]),
})

// Step 3 validation - Education (all optional if array is empty)
export const step3Schema = z.object({
	education: z.array(legacyEducationSchema).optional().default([]),
})

// Step 4 validation - Projects (all optional)
export const step4Schema = z.object({
	projects: z.array(legacyProjectSchema).optional().default([]),
})

// Step 5 validation - Skills (all optional)
export const step5Schema = z.object({
	skills: legacySkillsSchema.optional().default({ soft: [], technical: [] }),
})

export type Step1Data = z.infer<typeof step1Schema>

// Resume Creation Schema - title removed, headline is in content
export const createResumeSchema = z.object({
	content: resumeContentSchema,
})

export type CreateResumeData = z.infer<typeof createResumeSchema>

export const updateResumeSchema = z.object({
	commitMessage: z.string().optional(),
	content: resumeContentSchema,
	resumeId: z.string().uuid(),
})

export type UpdateResumeData = z.infer<typeof updateResumeSchema>

export const restoreVersionSchema = z.object({
	commitMessage: z.string().min(1, 'Commit message is required for restoration'),
	resumeId: z.string().uuid(),
	sourceVersionId: z.string().uuid(),
})

export type RestoreVersionData = z.infer<typeof restoreVersionSchema>
