import { db } from '@/infra/db/client'
import { resume } from '@/infra/db/schemas'
import { isFailure, isSuccess } from '@shared/errors/result'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { createResumeAction } from '../actions/create-resume-action'
import { deleteResumeAction } from '../actions/delete-resume-action'
import { duplicateResumeAction } from '../actions/duplicate-resume-action'
import {
	getResumeAction,
	getResumeHistoryAction,
	getResumeVersionAction,
	getUserResumesAction,
} from '../actions/get-resume-actions'
import { updateResumeAction } from '../actions/update-resume-action'

describe('Resume Actions Integration Tests', () => {
	const testUserId = 'test-user-action-id'
	let createdResumeIds: string[] = []

	afterEach(async () => {
		for (const resumeId of createdResumeIds) {
			await db.delete(resume).where(eq(resume.id, resumeId))
		}
		createdResumeIds = []
	})

	describe('createResumeAction', () => {
		it('should create resume with valid data', async () => {
			const formData = {
				content: {
					headline: 'Senior Full Stack Engineer',
				},
			}

			const result = await createResumeAction(testUserId, formData)

			expect(isSuccess(result)).toBe(true)
			if (isSuccess(result)) {
				expect(result.data.resumeId).toBeDefined()
				expect(result.data.versionId).toBeDefined()
				expect(result.data.versionNumber).toBe(1)

				createdResumeIds.push(result.data.resumeId)

				// Verify in database
				const [dbResume] = await db.select().from(resume).where(eq(resume.id, result.data.resumeId))

				expect(dbResume).toBeDefined()
				expect(dbResume.headline).toBe('Senior Full Stack Engineer')
				expect(dbResume.userId).toBe(testUserId)
			}
		})

		it('should create resume with all optional fields', async () => {
			const formData = {
				content: {
					competencies: ['Product Thinking', 'System Design', 'Team Building'],
					headline: 'Engineering Manager',
					summary: 'Leading high-performing engineering teams',
				},
			}

			const result = await createResumeAction(testUserId, formData)

			expect(isSuccess(result)).toBe(true)
			if (isSuccess(result)) {
				createdResumeIds.push(result.data.resumeId)

				const [dbResume] = await db.select().from(resume).where(eq(resume.id, result.data.resumeId))

				expect(dbResume.headline).toBe('Engineering Manager')
				expect(dbResume.competencies).toEqual([
					'Product Thinking',
					'System Design',
					'Team Building',
				])
				expect(dbResume.summary).toBe('Leading high-performing engineering teams')
			}
		})

		it('should fail validation when headline is missing', async () => {
			const formData = {
				content: {
					// headline missing
				},
			}

			const result = await createResumeAction(
				testUserId,
				formData as { content: { headline: string } },
			)

			expect(isSuccess(result)).toBe(false)
			if (!isSuccess(result)) {
				expect(result.type).toBe('VALIDATION_ERROR')
				expect(result.error).toBe('Dados Inválidos')
			}
		})

		it('should fail validation when headline is empty string', async () => {
			const formData = {
				content: {
					headline: '',
				},
			}

			const result = await createResumeAction(testUserId, formData)

			expect(isSuccess(result)).toBe(false)
			if (!isSuccess(result)) {
				expect(result.type).toBe('VALIDATION_ERROR')
			}
		})
	})

	describe('duplicateResumeAction', () => {
		it('should duplicate resume with new headline', async () => {
			// Create original
			const createResult = await createResumeAction(testUserId, {
				content: {
					competencies: ['Skill A', 'Skill B'],
					headline: 'Original Headline',
					summary: 'Original summary',
				},
			})

			expect(isSuccess(createResult)).toBe(true)
			if (!isSuccess(createResult)) return

			createdResumeIds.push(createResult.data.resumeId)

			// Duplicate
			const duplicateResult = await duplicateResumeAction(
				createResult.data.resumeId,
				'Duplicated Headline',
			)

			expect(isSuccess(duplicateResult)).toBe(true)
			if (isSuccess(duplicateResult)) {
				createdResumeIds.push(duplicateResult.data.resumeId)

				// Verify duplicated resume
				const [dbResume] = await db
					.select()
					.from(resume)
					.where(eq(resume.id, duplicateResult.data.resumeId))

				expect(dbResume.headline).toBe('Duplicated Headline')
				expect(dbResume.competencies).toEqual(['Skill A', 'Skill B'])
				expect(dbResume.summary).toBe('Original summary')
				expect(dbResume.userId).toBe(testUserId)
			}
		})

		it('should fail when trying to duplicate non-existent resume', async () => {
			const result = await duplicateResumeAction('non-existent-id', 'New Headline')

			expect(isSuccess(result)).toBe(false)
			if (!isSuccess(result)) {
				expect(result.type).toBe('NOT_FOUND_ERROR')
			}
		})
	})

	describe('updateResumeAction', () => {
		it('should update resume with valid data and create new version', async () => {
			// Create original resume
			const createResult = await createResumeAction(testUserId, {
				content: {
					headline: 'Original Headline',
				},
			})

			expect(isSuccess(createResult)).toBe(true)
			if (!isSuccess(createResult)) return

			createdResumeIds.push(createResult.data.resumeId)

			// Update resume
			const updateResult = await updateResumeAction(testUserId, {
				commitMessage: 'Updated headline',
				content: {
					competencies: ['New Skill'],
					headline: 'Updated Headline',
					summary: 'New summary',
				},
				resumeId: createResult.data.resumeId,
			})

			expect(isSuccess(updateResult)).toBe(true)
			if (isSuccess(updateResult)) {
				expect(updateResult.data.versionNumber).toBe(2)
				expect(updateResult.data.versionId).toBeDefined()
			}
		})

		it('should fail when resume not found', async () => {
			const result = await updateResumeAction(testUserId, {
				content: {
					headline: 'Test',
				},
				resumeId: 'non-existent-id',
			})

			expect(isSuccess(result)).toBe(false)
			if (!isSuccess(result)) {
				expect(result.type).toBe('NOT_FOUND_ERROR')
			}
		})

		it('should fail validation when content is invalid', async () => {
			const result = await updateResumeAction(testUserId, {
				content: {
					headline: '', // Empty headline
				},
				resumeId: 'some-id',
			})

			expect(isSuccess(result)).toBe(false)
			if (!isSuccess(result)) {
				expect(result.type).toBe('VALIDATION_ERROR')
			}
		})

		it('should use custom commit message when provided', async () => {
			const createResult = await createResumeAction(testUserId, {
				content: { headline: 'Test' },
			})

			if (!isSuccess(createResult)) return
			createdResumeIds.push(createResult.data.resumeId)

			const updateResult = await updateResumeAction(testUserId, {
				commitMessage: 'Custom commit message',
				content: { headline: 'Updated' },
				resumeId: createResult.data.resumeId,
			})

			expect(isSuccess(updateResult)).toBe(true)
		})
	})

	describe('deleteResumeAction', () => {
		it('should delete resume successfully', async () => {
			// Create resume
			const createResult = await createResumeAction(testUserId, {
				content: { headline: 'To be deleted' },
			})

			expect(isSuccess(createResult)).toBe(true)
			if (!isSuccess(createResult)) return

			const resumeId = createResult.data.resumeId

			// Delete resume
			const deleteResult = await deleteResumeAction(testUserId, resumeId)

			expect(isSuccess(deleteResult)).toBe(true)
			if (isSuccess(deleteResult)) {
				expect(deleteResult.data.success).toBe(true)
			}

			// Verify it's deleted
			const [found] = await db.select().from(resume).where(eq(resume.id, resumeId))
			expect(found).toBeUndefined()
		})

		it('should fail when resume not found', async () => {
			const result = await deleteResumeAction(testUserId, 'non-existent-id')

			expect(isSuccess(result)).toBe(false)
			if (!isSuccess(result)) {
				expect(result.type).toBe('NOT_FOUND_ERROR')
			}
		})

		it('should fail when user does not own resume', async () => {
			// Create resume with one user
			const createResult = await createResumeAction(testUserId, {
				content: { headline: 'Test' },
			})

			if (!isSuccess(createResult)) return
			createdResumeIds.push(createResult.data.resumeId)

			// Try to delete with different user
			const deleteResult = await deleteResumeAction('different-user-id', createResult.data.resumeId)

			expect(isSuccess(deleteResult)).toBe(false)
			if (!isSuccess(deleteResult)) {
				expect(deleteResult.type).toBe('NOT_FOUND_ERROR')
			}
		})
	})

	describe('getResumeAction', () => {
		it('should get resume by id with current version', async () => {
			const createResult = await createResumeAction(testUserId, {
				content: {
					competencies: ['Skill 1'],
					headline: 'Test Resume',
					summary: 'Test summary',
				},
			})

			if (!isSuccess(createResult)) return
			createdResumeIds.push(createResult.data.resumeId)

			const resume = await getResumeAction(testUserId, createResult.data.resumeId)

			expect(resume).toBeDefined()
			expect(resume?.headline).toBe('Test Resume')
			expect(resume?.currentVersion).toBeDefined()
			expect(resume?.currentVersion?.versionNumber).toBe(1)
		})

		it('should return null for non-existent resume', async () => {
			const resume = await getResumeAction(testUserId, 'non-existent-id')
			expect(resume).toBeNull()
		})

		it('should return null when user does not own resume', async () => {
			const createResult = await createResumeAction(testUserId, {
				content: { headline: 'Test' },
			})

			if (!isSuccess(createResult)) return
			createdResumeIds.push(createResult.data.resumeId)

			const resume = await getResumeAction('different-user-id', createResult.data.resumeId)
			expect(resume).toBeNull()
		})
	})

	describe('getUserResumesAction', () => {
		it('should get all resumes for a user', async () => {
			// Create multiple resumes
			const result1 = await createResumeAction(testUserId, {
				content: { headline: 'Resume 1' },
			})
			const result2 = await createResumeAction(testUserId, {
				content: { headline: 'Resume 2' },
			})

			if (!isSuccess(result1) || !isSuccess(result2)) return
			createdResumeIds.push(result1.data.resumeId, result2.data.resumeId)

			const resumes = await getUserResumesAction(testUserId)

			expect(resumes.length).toBeGreaterThanOrEqual(2)
			const headlines = resumes.map((r) => r.headline)
			expect(headlines).toContain('Resume 1')
			expect(headlines).toContain('Resume 2')
		})

		it('should return empty array when user has no resumes', async () => {
			const resumes = await getUserResumesAction('user-with-no-resumes')
			expect(resumes).toEqual([])
		})
	})

	describe('getResumeHistoryAction', () => {
		it('should get all versions of a resume', async () => {
			// Create resume
			const createResult = await createResumeAction(testUserId, {
				content: { headline: 'Original' },
			})

			if (!isSuccess(createResult)) return
			createdResumeIds.push(createResult.data.resumeId)

			// Update to create version 2
			await updateResumeAction(testUserId, {
				commitMessage: 'Update 1',
				content: { headline: 'Updated 1' },
				resumeId: createResult.data.resumeId,
			})

			// Update to create version 3
			await updateResumeAction(testUserId, {
				commitMessage: 'Update 2',
				content: { headline: 'Updated 2' },
				resumeId: createResult.data.resumeId,
			})

			const history = await getResumeHistoryAction(testUserId, createResult.data.resumeId)

			expect(history).toBeDefined()
			expect(history?.length).toBe(3)
			expect(history?.[0].versionNumber).toBe(3) // Most recent first
			expect(history?.[1].versionNumber).toBe(2)
			expect(history?.[2].versionNumber).toBe(1)
		})

		it('should return null for non-existent resume', async () => {
			const history = await getResumeHistoryAction(testUserId, 'non-existent-id')
			expect(history).toBeNull()
		})
	})

	describe('getResumeVersionAction', () => {
		it('should get specific version by id', async () => {
			const createResult = await createResumeAction(testUserId, {
				content: { headline: 'Test' },
			})

			if (!isSuccess(createResult)) return
			createdResumeIds.push(createResult.data.resumeId)

			const version = await getResumeVersionAction(testUserId, createResult.data.versionId)

			expect(version).toBeDefined()
			expect(version?.versionNumber).toBe(1)
			expect(version?.commitMessage).toBe('Initial version')
		})

		it('should return null for non-existent version', async () => {
			const version = await getResumeVersionAction(testUserId, 'non-existent-version-id')
			expect(version).toBeNull()
		})

		it('should return null when user does not own resume', async () => {
			const createResult = await createResumeAction(testUserId, {
				content: { headline: 'Test' },
			})

			if (!isSuccess(createResult)) return
			createdResumeIds.push(createResult.data.resumeId)

			const version = await getResumeVersionAction('different-user-id', createResult.data.versionId)
			expect(version).toBeNull()
		})
	})
})
