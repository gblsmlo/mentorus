import { db } from '@/infra/db/client'
import { resume, resumeVersion } from '@/infra/db/schemas'
import { and, desc, eq } from 'drizzle-orm'
import type { ResumeContent } from '../schemas'

export class ResumeRepository {
	/**
	 * Create a new resume with initial version (v1)
	 */
	async create(
		userId: string,
		data: {
			title: string
			content: ResumeContent
		},
	) {
		const [newResume] = await db
			.insert(resume)
			.values({
				title: data.title,
				userId,
			})
			.returning()

		// Create version 1
		const [version1] = await db
			.insert(resumeVersion)
			.values({
				commitMessage: 'Initial version',
				content: data.content,
				resumeId: newResume.id,
				versionNumber: 1,
			})
			.returning()

		// Update resume to point to currentVersionId
		await db
			.update(resume)
			.set({ currentVersionId: version1.id })
			.where(eq(resume.id, newResume.id))

		return {
			resume: newResume,
			version: version1,
		}
	}

	/**
	 * Find resume by ID with ownership verification
	 */
	async findById(resumeId: string, userId: string) {
		const existingResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
		})

		if (!existingResume) {
			return null
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
	 * Find all resumes for a user
	 */
	async findAllByUserId(userId: string) {
		return await db.query.resume.findMany({
			orderBy: [desc(resume.createdAt)],
			where: eq(resume.userId, userId),
		})
	}

	/**
	 * Update resume by creating a new version (append-only)
	 */
	async update(resumeId: string, userId: string, content: ResumeContent, commitMessage?: string) {
		// Verify ownership
		const existingResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
		})

		if (!existingResume) {
			return null
		}

		// Get the latest version number
		const latestVersion = await db.query.resumeVersion.findFirst({
			orderBy: [desc(resumeVersion.versionNumber)],
			where: eq(resumeVersion.resumeId, resumeId),
		})

		const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

		// Create new version
		const [newVersion] = await db
			.insert(resumeVersion)
			.values({
				commitMessage: commitMessage || `Update v${nextVersionNumber}`,
				content,
				resumeId,
				versionNumber: nextVersionNumber,
			})
			.returning()

		// Update current version pointer
		await db.update(resume).set({ currentVersionId: newVersion.id }).where(eq(resume.id, resumeId))

		return newVersion
	}

	/**
	 * Delete resume and all its versions
	 */
	async delete(resumeId: string, userId: string) {
		// Verify ownership
		const existingResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
		})

		if (!existingResume) {
			return false
		}

		await db.delete(resume).where(eq(resume.id, resumeId))
		return true
	}

	/**
	 * Get all versions of a resume (history)
	 */
	async getHistory(resumeId: string, userId: string) {
		// Verify ownership
		const existingResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
		})

		if (!existingResume) {
			return null
		}

		return await db.query.resumeVersion.findMany({
			orderBy: [desc(resumeVersion.versionNumber)],
			where: eq(resumeVersion.resumeId, resumeId),
		})
	}

	/**
	 * Get a specific resume version
	 */
	async getVersion(versionId: string, userId: string) {
		const version = await db.query.resumeVersion.findFirst({
			where: eq(resumeVersion.id, versionId),
		})

		if (!version) {
			return null
		}

		// Verify ownership
		const existingResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, version.resumeId), eq(resume.userId, userId)),
		})

		if (!existingResume) {
			return null
		}

		return version
	}

	/**
	 * Duplicate an existing resume (deep copy)
	 */
	async duplicate(userId: string, sourceResumeId: string, newTitle: string) {
		// Verify ownership of source resume
		const sourceResume = await db.query.resume.findFirst({
			where: and(eq(resume.id, sourceResumeId), eq(resume.userId, userId)),
		})

		if (!sourceResume) {
			return null
		}

		// Get the latest version of the source resume
		const latestVersion = await db.query.resumeVersion.findFirst({
			orderBy: [desc(resumeVersion.versionNumber)],
			where: eq(resumeVersion.resumeId, sourceResumeId),
		})

		if (!latestVersion) {
			return null
		}

		// Create new resume
		const [newResume] = await db
			.insert(resume)
			.values({
				title: newTitle,
				userId,
			})
			.returning()

		// Create version 1 with copied content
		const [version1] = await db
			.insert(resumeVersion)
			.values({
				commitMessage: `Duplicated from "${sourceResume.title}"`,
				content: latestVersion.content,
				resumeId: newResume.id,
				versionNumber: 1,
			})
			.returning()

		// Update resume to point to currentVersionId
		await db
			.update(resume)
			.set({ currentVersionId: version1.id })
			.where(eq(resume.id, newResume.id))

		return {
			resume: newResume,
			version: version1,
		}
	}

	/**
	 * Verify ownership helper
	 */
	async verifyOwnership(resumeId: string, userId: string): Promise<boolean> {
		const result = await this.findById(resumeId, userId)
		return !!result
	}
}

export const resumeRepository = new ResumeRepository()
