import { z } from 'zod'

// Resume Content Schema - Flexible structure for resume data
// Note: personalInfo is now managed in userProfile table
export const resumeContentSchema = z.object({
	// NEW FIELDS for Step 1 (Resume Info)
	about: z.string().optional(),
	competencies: z.array(z.string()).optional().default([]),

	// EXISTING FIELDS
	education: z
		.array(
			z.object({
				degree: z.string().min(1, 'Degree is required'),
				field: z.string().optional(),
				gpa: z.string().optional(),
				graduationDate: z.string().optional(),
				school: z.string().min(1, 'School is required'),
			}),
		)
		.default([]),
	experience: z
		.array(
			z.object({
				bullets: z.array(z.string()).default([]),
				company: z.string().min(1, 'Company is required'),
				current: z.boolean().default(false),
				description: z.string().optional(),
				endDate: z.string().optional(),
				startDate: z.string().min(1, 'Start date is required'),
				title: z.string().min(1, 'Job title is required'),
			}),
		)
		.default([]),
	headline: z.string().optional(),
	projects: z
		.array(
			z.object({
				description: z.string().optional(),
				name: z.string().min(1, 'Project name is required'),
				technologies: z.array(z.string()).default([]),
				url: z.string().optional(),
			}),
		)
		.default([]),
	skills: z
		.object({
			soft: z.array(z.string()).default([]),
			technical: z.array(z.string()).default([]),
		})
		.default({ soft: [], technical: [] }),
	summary: z.string().optional(),
})

export type ResumeContent = z.infer<typeof resumeContentSchema>

// Resume Creation/Update Schemas
export const createResumeSchema = z.object({
	content: resumeContentSchema,
	title: z.string().min(1, 'Resume title is required'),
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
