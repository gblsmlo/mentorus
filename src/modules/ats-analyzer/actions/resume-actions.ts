'use server'

import { db } from '@/infra/db/client'
import { resume, resumeVersion } from '@/infra/db/schemas'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import {
	createResumeSchema,
	type ResumeContent,
	restoreVersionSchema,
	updateResumeSchema,
} from '../schemas'

/**
 * Create a new resume with initial version (v1)
 */
export async function createResume(userId: string, data: unknown) {
	const validated = createResumeSchema.parse(data)

	const [newResume] = await db
		.insert(resume)
		.values({
			title: validated.title,
			userId,
		})
		.returning()

	// Create version 1
	const [version1] = await db
		.insert(resumeVersion)
		.values({
			commitMessage: 'Initial version',
			content: validated.content,
			resumeId: newResume.id,
			versionNumber: 1,
		})
		.returning()

	// Update resume to point to currentVersionId
	await db.update(resume).set({ currentVersionId: version1.id }).where(eq(resume.id, newResume.id))

	revalidatePath('/resumes')

	return {
		resumeId: newResume.id,
		versionId: version1.id,
		versionNumber: 1,
	}
}

/**
 * Update a resume by creating a new version (append-only)
 */
export async function updateResume(userId: string, data: unknown) {
	const validated = updateResumeSchema.parse(data)

	// Verify ownership
	const existingResume = await db.query.resume.findFirst({
		where: and(eq(resume.id, validated.resumeId), eq(resume.userId, userId)),
	})

	if (!existingResume) {
		throw new Error('Resume not found or access denied')
	}

	// Get the latest version number
	const latestVersion = await db.query.resumeVersion.findFirst({
		orderBy: [desc(resumeVersion.versionNumber)],
		where: eq(resumeVersion.resumeId, validated.resumeId),
	})

	const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

	// Create new version
	const [newVersion] = await db
		.insert(resumeVersion)
		.values({
			commitMessage: validated.commitMessage || `Update v${nextVersionNumber}`,
			content: validated.content,
			resumeId: validated.resumeId,
			versionNumber: nextVersionNumber,
		})
		.returning()

	// Update current version pointer
	await db
		.update(resume)
		.set({ currentVersionId: newVersion.id })
		.where(eq(resume.id, validated.resumeId))

	revalidatePath('/resumes')
	revalidatePath(`/resumes/${validated.resumeId}`)

	return {
		versionId: newVersion.id,
		versionNumber: nextVersionNumber,
	}
}

/**
 * Get all versions of a resume (history)
 */
export async function getResumeHistory(userId: string, resumeId: string) {
	// Verify ownership
	const existingResume = await db.query.resume.findFirst({
		where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
	})

	if (!existingResume) {
		throw new Error('Resume not found or access denied')
	}

	const versions = await db.query.resumeVersion.findMany({
		orderBy: [desc(resumeVersion.versionNumber)],
		where: eq(resumeVersion.resumeId, resumeId),
	})

	return versions
}

/**
 * Get a specific resume version
 */
export async function getResumeVersion(userId: string, versionId: string) {
	const version = await db.query.resumeVersion.findFirst({
		where: eq(resumeVersion.id, versionId),
	})

	if (!version) {
		throw new Error('Version not found')
	}

	// Verify ownership
	const existingResume = await db.query.resume.findFirst({
		where: and(eq(resume.id, version.resumeId), eq(resume.userId, userId)),
	})

	if (!existingResume) {
		throw new Error('Access denied')
	}

	return version
}

/**
 * Restore an old version (creates a new version with old content)
 */
export async function restoreVersion(userId: string, data: unknown) {
	const validated = restoreVersionSchema.parse(data)

	// Get the source version content
	const sourceVersion = await getResumeVersion(userId, validated.sourceVersionId)

	// Create a new version with the old content
	return updateResume(userId, {
		commitMessage: validated.commitMessage,
		content: sourceVersion.content as ResumeContent,
		resumeId: validated.resumeId,
	})
}

/**
 * Get all resumes for a user
 */
export async function getUserResumes(userId: string) {
	const resumes = await db.query.resume.findMany({
		orderBy: [desc(resume.createdAt)],
		where: eq(resume.userId, userId),
	})

	return resumes
}

/**
 * Get a single resume with its current version
 */
export async function getResume(userId: string, resumeId: string) {
	const existingResume = await db.query.resume.findFirst({
		where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
	})

	if (!existingResume) {
		throw new Error('Resume not found or access denied')
	}

	let currentVersion = null
	if (existingResume.currentVersionId) {
		currentVersion = await db.query.resumeVersion.findFirst({
			where: eq(resumeVersion.id, existingResume.currentVersionId),
		})
	}

	return {
		...existingResume,
		currentVersion,
	}
}

/**
 * Delete a resume and all its versions
 */
export async function deleteResume(userId: string, resumeId: string) {
	// Verify ownership
	const existingResume = await db.query.resume.findFirst({
		where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
	})

	if (!existingResume) {
		throw new Error('Resume not found or access denied')
	}

	await db.delete(resume).where(eq(resume.id, resumeId))

	revalidatePath('/resumes')

	return { success: true }
}
