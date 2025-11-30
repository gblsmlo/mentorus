'use server'

import { db } from '@/infra/db/client'
import { resume, resumeVersion } from '@/infra/db/schemas'
import { failure, type Result, success } from '@shared/errors/result'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { resumeContentSchema } from '../schemas/resume-content.schema'
import type { ResumeContent } from '../types/resume-content'

/**
 * Schema for restore version input
 */
export const restoreVersionInputSchema = z.object({
	commitMessage: z.string().optional(),
	resumeId: z.string().min(1, 'Resume ID is required'),
	sourceVersionId: z.string().min(1, 'Source version ID is required'),
})

export type RestoreVersionInput = z.infer<typeof restoreVersionInputSchema>

export type RestoreVersionOutput = {
	versionId: string
	versionNumber: number
	content: ResumeContent
	createdAt: Date
}

/**
 * Restore a previous version of a resume
 *
 * Requirements: 7.4
 * - Loads content from specified version
 * - Creates a new version with the restored content
 * - The restored version becomes the current version
 */
export async function restoreVersionAction(
	userId: string,
	input: RestoreVersionInput,
): Promise<Result<RestoreVersionOutput>> {
	// 1. Validate input
	const validatedFields = restoreVersionInputSchema.safeParse(input)

	if (!validatedFields.success) {
		return failure({
			details: validatedFields.error.flatten().fieldErrors,
			error: 'Validation failed',
			message: 'Invalid input',
			type: 'VALIDATION_ERROR',
		})
	}

	const { resumeId, sourceVersionId, commitMessage } = validatedFields.data

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

		// 3. Get the source version to restore
		const sourceVersion = await db.query.resumeVersion.findFirst({
			where: and(eq(resumeVersion.id, sourceVersionId), eq(resumeVersion.resumeId, resumeId)),
		})

		if (!sourceVersion) {
			return failure({
				error: 'Version not found',
				message: 'Source version not found',
				type: 'NOT_FOUND_ERROR',
			})
		}

		// 4. Validate the source content against schema
		const contentValidation = resumeContentSchema.safeParse(sourceVersion.content)
		if (!contentValidation.success) {
			return failure({
				details: contentValidation.error.flatten().fieldErrors,
				error: 'Content validation failed',
				message: 'Source version content is invalid',
				type: 'VALIDATION_ERROR',
			})
		}

		const restoredContent = contentValidation.data as ResumeContent

		// 5. Get the latest version number
		const latestVersion = await db.query.resumeVersion.findFirst({
			orderBy: [desc(resumeVersion.versionNumber)],
			where: eq(resumeVersion.resumeId, resumeId),
		})

		const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

		// 6. Create new version with restored content
		const defaultCommitMessage = `Restored from version ${sourceVersion.versionNumber}`
		const [newVersion] = await db
			.insert(resumeVersion)
			.values({
				commitMessage: commitMessage || defaultCommitMessage,
				content: restoredContent,
				resumeId,
				versionNumber: nextVersionNumber,
			})
			.returning()

		// 7. Update resume to point to the new current version
		await db.update(resume).set({ currentVersionId: newVersion.id }).where(eq(resume.id, resumeId))

		return success({
			content: restoredContent,
			createdAt: newVersion.createdAt,
			versionId: newVersion.id,
			versionNumber: nextVersionNumber,
		})
	} catch (error) {
		console.error('Restore version error:', error)
		return failure({
			error: error instanceof Error ? error.message : 'Unknown error',
			message: 'Failed to restore version',
			type: 'DATABASE_ERROR',
		})
	}
}

/**
 * Get a specific version's content
 * Useful for previewing before restoring
 */
export async function getVersionContent(
	userId: string,
	resumeId: string,
	versionId: string,
): Promise<Result<{ content: ResumeContent; versionNumber: number }>> {
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

		// Get the version
		const version = await db.query.resumeVersion.findFirst({
			where: and(eq(resumeVersion.id, versionId), eq(resumeVersion.resumeId, resumeId)),
		})

		if (!version) {
			return failure({
				error: 'Version not found',
				message: 'Version not found',
				type: 'NOT_FOUND_ERROR',
			})
		}

		// Validate content
		const contentValidation = resumeContentSchema.safeParse(version.content)
		if (!contentValidation.success) {
			return failure({
				error: 'Content validation failed',
				message: 'Version content is invalid',
				type: 'VALIDATION_ERROR',
			})
		}

		return success({
			content: contentValidation.data as ResumeContent,
			versionNumber: version.versionNumber,
		})
	} catch (error) {
		return failure({
			error: error instanceof Error ? error.message : 'Unknown error',
			message: 'Failed to get version content',
			type: 'DATABASE_ERROR',
		})
	}
}
