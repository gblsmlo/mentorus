import { db } from '@/infra/db/client'
import { resume, resumeVersion } from '@/infra/db/schemas'
import { eq } from 'drizzle-orm'
import { afterEach, describe, expect, it } from 'vitest'
import { resumeRepository } from '../repositories/resume-repository'

describe('Resume Repository Integration Tests', () => {
	const testUserId = 'test-user-id'
	let createdResumeIds: string[] = []

	// Cleanup after each test
	afterEach(async () => {
		for (const resumeId of createdResumeIds) {
			await db.delete(resume).where(eq(resume.id, resumeId))
		}
		createdResumeIds = []
	})

	describe('create', () => {
		it('should create a resume with only headline (required field)', async () => {
			const result = await resumeRepository.create(testUserId, {
				headline: 'Senior Software Engineer',
			})

			createdResumeIds.push(result.resume.id)

			expect(result.resume).toBeDefined()
			expect(result.resume.headline).toBe('Senior Software Engineer')
			expect(result.resume.userId).toBe(testUserId)
			expect(result.resume.competencies).toEqual([])
			expect(result.resume.summary).toBeNull()

			expect(result.version).toBeDefined()
			expect(result.version.versionNumber).toBe(1)
			expect(result.version.commitMessage).toBe('Initial version')
		})

		it('should create a resume with all optional fields populated', async () => {
			const result = await resumeRepository.create(testUserId, {
				competencies: ['Leadership', 'Architecture', 'Mentoring'],
				headline: 'Principal Software Engineer',
				summary: 'Expert in distributed systems',
			})

			createdResumeIds.push(result.resume.id)

			expect(result.resume.headline).toBe('Principal Software Engineer')
			expect(result.resume.competencies).toEqual(['Leadership', 'Architecture', 'Mentoring'])
			expect(result.resume.summary).toBe('Expert in distributed systems')
		})

		it('should create version with minimal content (no deprecated fields)', async () => {
			const result = await resumeRepository.create(testUserId, {
				headline: 'Full Stack Developer',
			})

			createdResumeIds.push(result.resume.id)

			const versionContent = result.version.content as Record<string, unknown>

			// Should have new fields
			expect(versionContent.headline).toBe('Full Stack Developer')
			expect(versionContent.competencies).toEqual([])
			expect(versionContent.summary).toBe('')

			// Should NOT have deprecated fields
			expect(versionContent.experience).toBeUndefined()
			expect(versionContent.education).toBeUndefined()
			expect(versionContent.projects).toBeUndefined()
			expect(versionContent.skills).toBeUndefined()
		})

		it('should set currentVersionId to the created version', async () => {
			const result = await resumeRepository.create(testUserId, {
				headline: 'DevOps Engineer',
			})

			createdResumeIds.push(result.resume.id)

			expect(result.resume.currentVersionId).toBe(result.version.id)
		})
	})

	describe('findById', () => {
		it('should find resume by id with ownership verification', async () => {
			const created = await resumeRepository.create(testUserId, {
				headline: 'Backend Engineer',
			})
			createdResumeIds.push(created.resume.id)

			const found = await resumeRepository.findById(created.resume.id, testUserId)

			expect(found).toBeDefined()
			expect(found?.id).toBe(created.resume.id)
			expect(found?.headline).toBe('Backend Engineer')
			expect(found?.currentVersion?.id).toBe(created.version.id)
		})

		it('should return null for non-existent resume', async () => {
			const found = await resumeRepository.findById('non-existent-id', testUserId)
			expect(found).toBeNull()
		})

		it('should return null when userId does not match (ownership check)', async () => {
			const created = await resumeRepository.create(testUserId, {
				headline: 'Frontend Engineer',
			})
			createdResumeIds.push(created.resume.id)

			const found = await resumeRepository.findById(created.resume.id, 'different-user-id')
			expect(found).toBeNull()
		})
	})

	describe('duplicate', () => {
		it('should duplicate a resume with new headline', async () => {
			const original = await resumeRepository.create(testUserId, {
				competencies: ['Skill 1', 'Skill 2'],
				headline: 'Original Headline',
				summary: 'Original summary',
			})
			createdResumeIds.push(original.resume.id)

			const duplicated = await resumeRepository.duplicate(
				testUserId,
				original.resume.id,
				'Duplicated Headline',
			)

			expect(duplicated).toBeDefined()
			createdResumeIds.push(duplicated!.resume.id)

			expect(duplicated!.resume.headline).toBe('Duplicated Headline')
			expect(duplicated!.resume.competencies).toEqual(['Skill 1', 'Skill 2'])
			expect(duplicated!.resume.summary).toBe('Original summary')
			expect(duplicated!.version.versionNumber).toBe(1)
			expect(duplicated!.version.commitMessage).toContain('Duplicated from')
		})

		it('should return null when trying to duplicate non-existent resume', async () => {
			const result = await resumeRepository.duplicate(testUserId, 'non-existent-id', 'New Headline')
			expect(result).toBeNull()
		})
	})

	describe('delete', () => {
		it('should delete resume and all its versions', async () => {
			const created = await resumeRepository.create(testUserId, {
				headline: 'To Be Deleted',
			})

			const deleted = await resumeRepository.delete(created.resume.id, testUserId)
			expect(deleted).toBe(true)

			const found = await resumeRepository.findById(created.resume.id, testUserId)
			expect(found).toBeNull()

			// Verify version is also deleted (cascade)
			const versions = await db
				.select()
				.from(resumeVersion)
				.where(eq(resumeVersion.resumeId, created.resume.id))
			expect(versions).toHaveLength(0)
		})

		it('should return false when trying to delete non-existent resume', async () => {
			const deleted = await resumeRepository.delete('non-existent-id', testUserId)
			expect(deleted).toBe(false)
		})
	})

	describe('JSONB Content - No Deprecated Fields', () => {
		it('should NOT store deprecated fields in version content', async () => {
			const result = await resumeRepository.create(testUserId, {
				headline: 'Test Engineer',
			})

			createdResumeIds.push(result.resume.id)

			const versionContent = result.version.content as Record<string, unknown>

			// Campos que NÃO devem existir (deprecated/moved to normalized tables)
			expect(versionContent.experience).toBeUndefined()
			expect(versionContent.education).toBeUndefined()
			expect(versionContent.projects).toBeUndefined()
			expect(versionContent.skills).toBeUndefined()

			// Apenas estes devem existir
			expect(versionContent).toHaveProperty('headline')
			expect(versionContent).toHaveProperty('competencies')
			expect(versionContent).toHaveProperty('summary')

			// Verificar valores
			expect(versionContent.headline).toBe('Test Engineer')
			expect(versionContent.competencies).toEqual([])
			expect(versionContent.summary).toBe('')
		})

		it('should store only minimal content even when all optional fields provided', async () => {
			const result = await resumeRepository.create(testUserId, {
				competencies: ['A', 'B', 'C'],
				headline: 'Senior Engineer',
				summary: 'Great summary',
			})

			createdResumeIds.push(result.resume.id)

			const versionContent = result.version.content as Record<string, unknown>

			// Should only have these 3 fields
			const contentKeys = Object.keys(versionContent)
			expect(contentKeys).toHaveLength(3)
			expect(contentKeys).toContain('headline')
			expect(contentKeys).toContain('competencies')
			expect(contentKeys).toContain('summary')

			// Verify values
			expect(versionContent.headline).toBe('Senior Engineer')
			expect(versionContent.competencies).toEqual(['A', 'B', 'C'])
			expect(versionContent.summary).toBe('Great summary')
		})
	})

	describe('CurrentVersionId Integrity', () => {
		it('should always set currentVersionId after creation', async () => {
			const result = await resumeRepository.create(testUserId, {
				headline: 'Test',
			})

			createdResumeIds.push(result.resume.id)

			// Verify in returned object
			expect(result.resume.currentVersionId).toBeDefined()
			expect(result.resume.currentVersionId).toBe(result.version.id)

			// Verify in database
			const found = await resumeRepository.findById(result.resume.id, testUserId)
			expect(found?.currentVersionId).toBe(result.version.id)
		})

		it('should have currentVersionId pointing to version 1 initially', async () => {
			const result = await resumeRepository.create(testUserId, {
				headline: 'Initial Resume',
			})

			createdResumeIds.push(result.resume.id)

			expect(result.version.versionNumber).toBe(1)
			expect(result.resume.currentVersionId).toBe(result.version.id)
		})
	})

	describe('Resume Table Schema - Direct Columns', () => {
		it('should store headline, competencies, summary as columns (not JSONB)', async () => {
			const result = await resumeRepository.create(testUserId, {
				competencies: ['Leadership', 'Architecture'],
				headline: 'Principal Engineer',
				summary: 'Building teams',
			})

			createdResumeIds.push(result.resume.id)

			// Verify types - these should be direct column values, not nested in JSONB
			expect(typeof result.resume.headline).toBe('string')
			expect(result.resume.headline).toBe('Principal Engineer')

			expect(Array.isArray(result.resume.competencies)).toBe(true)
			expect(result.resume.competencies).toEqual(['Leadership', 'Architecture'])

			expect(typeof result.resume.summary).toBe('string')
			expect(result.resume.summary).toBe('Building teams')

			// Should NOT have a 'title' property
			expect(result.resume).not.toHaveProperty('title')
			// Should NOT have an 'about' property
			expect(result.resume).not.toHaveProperty('about')
		})
	})
})
