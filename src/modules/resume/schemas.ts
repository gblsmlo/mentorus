import { z } from 'zod'

// Resume Content Schema - Flexible structure for resume data
// Note: personalInfo is now managed in userProfile table
// Note: Experience, Education, Projects, Skills are now in separate tables with many-to-many relationships
export const resumeContentSchema = z.object({
	// Step 1 fields (Resume Info)
	competencies: z.array(z.string()).optional().default([]),

	// DEPRECATED: These fields will be removed as data moves to normalized tables
	// Keeping for backward compatibility during migration
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
	headline: z.string().min(1, 'Headline is required'), // Made required, replaces title
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

// Step 1 Schema - Only headline is required
export const step1Schema = z.object({
	competencies: z.array(z.string()).optional().default([]),
	headline: z.string().min(1, 'Headline is required'),
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
