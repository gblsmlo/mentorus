'use server'

import { db } from '@/infra/db/client'
import { resume, resumeVersion } from '@/infra/db/schemas'
import { failure, type Result, success } from '@shared/errors/result'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { resumeContentSchema } from '../schemas/resume-content.schema'

/**
 * Schema for save version input
 */
export const saveVersionInputSchema = z.object({
	atsScore: z.number().min(0).max(100).optional(),
	commitMessage: z.string().optional(),
	content: resumeContentSchema,
	resumeId: z.string().min(1, 'Resume ID is required'),
})

export type SaveVersionInput = z.infer<typeof saveVersionInputSchema>

export type SaveVersionOutput = {
	versionId: string
	versionNumber: number
	createdAt: Date
}

/**
 * Save a new version of a resume
 *
 * Requirements: 7.1, 7.2
 * - Validates content against Zod schema before persisting
 * - Increments version number (max existing + 1)
 * - Stores complete ResumeContent snapshot with optional commit message
 */
export async function saveVersionAction(
	userId: string,
	input: SaveVersionInput,
): Promise<Result<SaveVersionOutput>> {
	// 1. Validate input against schema
	const validatedFields = saveVersionInputSchema.safeParse(input)

	if (!validatedFields.success) {
		return failure({
			details: validatedFields.error.format(),
			error: 'Validation failed',
			message: 'Invalid resume content',
			type: 'VALIDATION_ERROR',
		})
	}

	const { resumeId, content, commitMessage } = validatedFields.data

	try {
		// 2. Verify ownership of the resume
		const existingResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
		})

		if (!existingResume) {
			return failure({
				error: 'Resume not found',
				message: 'Resume not found or access denied',
				type: 'NOT_FOUND_ERROR',
			})
		}

		// 3. Get the latest version number for this resume
		const latestVersion = await db.query.resumeVersion.findFirst({
			orderBy: [desc(resumeVersion.versionNumber)],
			where: eq(resumeVersion.resumeId, resumeId),
		})

		// 4. Calculate next version number (max existing + 1)
		const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

		// 5. Create new version with complete snapshot
		const [newVersion] = await db
			.insert(resumeVersion)
			.values({
				commitMessage: commitMessage || `Version ${nextVersionNumber}`,
				content,
				resumeId,
				versionNumber: nextVersionNumber,
			})
			.returning()

		// 6. Update resume to point to the new current version
		await db.update(resume).set({ currentVersionId: newVersion.id }).where(eq(resume.id, resumeId))

		return success({
			createdAt: newVersion.createdAt,
			versionId: newVersion.id,
			versionNumber: nextVersionNumber,
		})
	} catch (error) {
		console.error('Save version error:', error)
		return failure({
			error: error instanceof Error ? error.message : 'Unknown error',
			message: 'Failed to save version',
			type: 'DATABASE_ERROR',
		})
	}
}

/**
 * Get the next version number for a resume
 * Useful for displaying to users before they save
 */
export async function getNextVersionNumber(
	userId: string,
	resumeId: string,
): Promise<Result<number>> {
	try {
		// Verify ownership
		const existingResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
		})

		if (!existingResume) {
			return failure({
				error: 'Resume not found',
				message: 'Resume not found or access denied',
				type: 'NOT_FOUND_ERROR',
			})
		}

		const latestVersion = await db.query.resumeVersion.findFirst({
			orderBy: [desc(resumeVersion.versionNumber)],
			where: eq(resumeVersion.resumeId, resumeId),
		})

		return success((latestVersion?.versionNumber ?? 0) + 1)
	} catch (error) {
		return failure({
			error: error instanceof Error ? error.message : 'Unknown error',
			message: 'Failed to get version number',
			type: 'DATABASE_ERROR',
		})
	}
}
