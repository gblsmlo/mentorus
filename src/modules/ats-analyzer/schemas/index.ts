import { VALIDATION_MESSAGES } from '@/shared/constants/validation-messages'
import { type ResumeContent, resumeContentSchema } from '@/shared/schemas/resume-content.schema'
import { z } from 'zod'

// Re-export the canonical schema and type
export { resumeContentSchema, type ResumeContent }

// Job Input Schema
export const jobInputSchema = z.object({
	company: z.string().optional(),
	description: z.string().min(10, VALIDATION_MESSAGES.JOB_DESCRIPTION_MIN_LENGTH),
	title: z.string().min(1, VALIDATION_MESSAGES.JOB_TITLE_REQUIRED),
	url: z.string().url(VALIDATION_MESSAGES.URL_INVALID).optional().or(z.literal('')),
})

export type JobInput = z.infer<typeof jobInputSchema>

// Analysis Result Schema
export const analysisResultSchema = z.object({
	feedback: z.string(),
	matchedKeywords: z.array(
		z.object({
			category: z.enum(['skill', 'experience', 'education', 'general']),
			keyword: z.string(),
			weight: z.number(),
		}),
	),
	matchScore: z.number().min(0).max(100),
	missingKeywords: z.array(
		z.object({
			category: z.enum(['skill', 'experience', 'education', 'general']),
			keyword: z.string(),
			suggestion: z.string(),
		}),
	),
})

export type AnalysisResult = z.infer<typeof analysisResultSchema>

// Extracted types for better type safety
export type MatchedKeyword = AnalysisResult['matchedKeywords'][number]
export type MissingKeyword = AnalysisResult['missingKeywords'][number]

// Resume Creation/Update Schemas
// Note: title field removed - headline is now inside content
export const createResumeSchema = z.object({
	content: resumeContentSchema,
})

export const updateResumeSchema = z.object({
	commitMessage: z.string().optional(),
	content: resumeContentSchema,
	resumeId: z.string().uuid(),
})

export const restoreVersionSchema = z.object({
	commitMessage: z.string().min(1, 'Commit message is required for restoration'),
	resumeId: z.string().uuid(),
	sourceVersionId: z.string().uuid(),
})
