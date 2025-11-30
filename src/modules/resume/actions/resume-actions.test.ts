import { db } from '@/infra/db/client'
import { resume } from '@/infra/db/schemas'
import { handleAuthError } from '@shared/errors/error-handler'
import { isSuccess } from '@shared/errors/result'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { createResumeAction } from '../actions/create-resume-action'
import { duplicateResumeAction } from '../actions/duplicate-resume-action'

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

			const result = await createResumeAction(testUserId, formData as any)

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
})
