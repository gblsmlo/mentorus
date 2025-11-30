import { db } from '@/infra/db/client'
import {
	education,
	experience,
	project,
	resume,
	resumeEducation,
	resumeExperience,
	resumeProject,
	resumeSkill,
	skill,
} from '@/infra/db/schemas'
import { eq } from 'drizzle-orm'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('Junction Tables - Many-to-Many Relationships', () => {
	const testUserId = 'test-junction-user'
	let createdResumeIds: string[] = []
	let createdExperienceIds: string[] = []
	let createdEducationIds: string[] = []
	let createdProjectIds: string[] = []
	let createdSkillIds: string[] = []

	afterEach(async () => {
		// Cleanup in reverse order due to foreign keys
		for (const resumeId of createdResumeIds) {
			await db.delete(resume).where(eq(resume.id, resumeId))
		}
		for (const expId of createdExperienceIds) {
			await db.delete(experience).where(eq(experience.id, expId))
		}
		for (const eduId of createdEducationIds) {
			await db.delete(education).where(eq(education.id, eduId))
		}
		for (const projId of createdProjectIds) {
			await db.delete(project).where(eq(project.id, projId))
		}
		for (const skillId of createdSkillIds) {
			await db.delete(skill).where(eq(skill.id, skillId))
		}

		createdResumeIds = []
		createdExperienceIds = []
		createdEducationIds = []
		createdProjectIds = []
		createdSkillIds = []
	})

	describe('Resume-Experience Junction', () => {
		it('should maintain order of experiences in a resume', async () => {
			// Create 3 experiences
			const [exp1] = await db
				.insert(experience)
				.values({
					company: 'Company A',
					startDate: '2020-01',
					title: 'Software Engineer',
					userId: testUserId,
				})
				.returning()
			createdExperienceIds.push(exp1.id)

			const [exp2] = await db
				.insert(experience)
				.values({
					company: 'Company B',
					startDate: '2021-01',
					title: 'Senior Engineer',
					userId: testUserId,
				})
				.returning()
			createdExperienceIds.push(exp2.id)

			const [exp3] = await db
				.insert(experience)
				.values({
					company: 'Company C',
					startDate: '2022-01',
					title: 'Lead Engineer',
					userId: testUserId,
				})
				.returning()
			createdExperienceIds.push(exp3.id)

			// Create resume
			const [testResume] = await db
				.insert(resume)
				.values({
					headline: 'Test Resume',
					userId: testUserId,
				})
				.returning()
			createdResumeIds.push(testResume.id)

			// Add experiences in specific order: exp2 (order 0), exp1 (order 1), exp3 (order 2)
			await db.insert(resumeExperience).values({
				experienceId: exp2.id,
				order: 0,
				resumeId: testResume.id,
			})

			await db.insert(resumeExperience).values({
				experienceId: exp1.id,
				order: 1,
				resumeId: testResume.id,
			})

			await db.insert(resumeExperience).values({
				experienceId: exp3.id,
				order: 2,
				resumeId: testResume.id,
			})

			// Fetch experiences ordered by 'order' field
			const linkedExperiences = await db
				.select({
					company: experience.company,
					order: resumeExperience.order,
				})
				.from(resumeExperience)
				.innerJoin(experience, eq(resumeExperience.experienceId, experience.id))
				.where(eq(resumeExperience.resumeId, testResume.id))
				.orderBy(resumeExperience.order)

			expect(linkedExperiences).toHaveLength(3)
			expect(linkedExperiences[0].company).toBe('Company B') // order 0
			expect(linkedExperiences[1].company).toBe('Company A') // order 1
			expect(linkedExperiences[2].company).toBe('Company C') // order 2
		})

		it('should allow same experience in multiple resumes', async () => {
			// Create 1 shared experience
			const [sharedExp] = await db
				.insert(experience)
				.values({
					company: 'Shared Company',
					startDate: '2020-01',
					title: 'Shared Role',
					userId: testUserId,
				})
				.returning()
			createdExperienceIds.push(sharedExp.id)

			// Create 2 different resumes
			const [resume1] = await db
				.insert(resume)
				.values({
					headline: 'Resume 1',
					userId: testUserId,
				})
				.returning()
			createdResumeIds.push(resume1.id)

			const [resume2] = await db
				.insert(resume)
				.values({
					headline: 'Resume 2',
					userId: testUserId,
				})
				.returning()
			createdResumeIds.push(resume2.id)

			// Link same experience to both resumes
			await db.insert(resumeExperience).values({
				experienceId: sharedExp.id,
				order: 0,
				resumeId: resume1.id,
			})

			await db.insert(resumeExperience).values({
				experienceId: sharedExp.id,
				order: 0,
				resumeId: resume2.id,
			})

			// Verify both resumes have the same experience
			const resume1Experiences = await db
				.select()
				.from(resumeExperience)
				.where(eq(resumeExperience.resumeId, resume1.id))

			const resume2Experiences = await db
				.select()
				.from(resumeExperience)
				.where(eq(resumeExperience.resumeId, resume2.id))

			expect(resume1Experiences[0].experienceId).toBe(sharedExp.id)
			expect(resume2Experiences[0].experienceId).toBe(sharedExp.id)
		})
	})

	describe('Cascade Delete Behavior', () => {
		it('should cascade delete junction records when resume is deleted', async () => {
			// Create experience
			const [exp] = await db
				.insert(experience)
				.values({
					company: 'Test Company',
					startDate: '2020-01',
					title: 'Test Role',
					userId: testUserId,
				})
				.returning()
			createdExperienceIds.push(exp.id)

			// Create resume
			const [testResume] = await db
				.insert(resume)
				.values({
					headline: 'Test Resume',
					userId: testUserId,
				})
				.returning()
			createdResumeIds.push(testResume.id)

			// Link experience to resume
			await db.insert(resumeExperience).values({
				experienceId: exp.id,
				order: 0,
				resumeId: testResume.id,
			})

			// Verify junction record exists
			const junctionBefore = await db
				.select()
				.from(resumeExperience)
				.where(eq(resumeExperience.resumeId, testResume.id))

			expect(junctionBefore).toHaveLength(1)

			// Delete resume
			await db.delete(resume).where(eq(resume.id, testResume.id))
			createdResumeIds = createdResumeIds.filter((id) => id !== testResume.id)

			// Verify junction records were deleted (CASCADE)
			const junctionAfter = await db
				.select()
				.from(resumeExperience)
				.where(eq(resumeExperience.resumeId, testResume.id))

			expect(junctionAfter).toHaveLength(0)

			// Verify experience record still exists
			const expStillExists = await db.select().from(experience).where(eq(experience.id, exp.id))

			expect(expStillExists).toHaveLength(1)
		})

		it('should cascade delete all junction types when resume is deleted', async () => {
			// Create one of each entity
			const [exp] = await db
				.insert(experience)
				.values({
					company: 'Test',
					startDate: '2020-01',
					title: 'Test',
					userId: testUserId,
				})
				.returning()
			createdExperienceIds.push(exp.id)

			const [edu] = await db
				.insert(education)
				.values({
					degree: 'BS',
					school: 'Test University',
					userId: testUserId,
				})
				.returning()
			createdEducationIds.push(edu.id)

			const [proj] = await db
				.insert(project)
				.values({
					name: 'Test Project',
					userId: testUserId,
				})
				.returning()
			createdProjectIds.push(proj.id)

			const [sk] = await db
				.insert(skill)
				.values({
					category: 'technical',
					name: 'TypeScript',
					userId: testUserId,
				})
				.returning()
			createdSkillIds.push(sk.id)

			// Create resume
			const [testResume] = await db
				.insert(resume)
				.values({
					headline: 'Test Resume',
					userId: testUserId,
				})
				.returning()
			createdResumeIds.push(testResume.id)

			// Link all entities
			await db.insert(resumeExperience).values({
				experienceId: exp.id,
				order: 0,
				resumeId: testResume.id,
			})
			await db.insert(resumeEducation).values({
				educationId: edu.id,
				order: 0,
				resumeId: testResume.id,
			})
			await db.insert(resumeProject).values({
				order: 0,
				projectId: proj.id,
				resumeId: testResume.id,
			})
			await db.insert(resumeSkill).values({
				order: 0,
				resumeId: testResume.id,
				skillId: sk.id,
			})

			// Delete resume
			await db.delete(resume).where(eq(resume.id, testResume.id))
			createdResumeIds = createdResumeIds.filter((id) => id !== testResume.id)

			// Verify ALL junction records were deleted
			const expJunction = await db
				.select()
				.from(resumeExperience)
				.where(eq(resumeExperience.resumeId, testResume.id))
			const eduJunction = await db
				.select()
				.from(resumeEducation)
				.where(eq(resumeEducation.resumeId, testResume.id))
			const projJunction = await db
				.select()
				.from(resumeProject)
				.where(eq(resumeProject.resumeId, testResume.id))
			const skillJunction = await db
				.select()
				.from(resumeSkill)
				.where(eq(resumeSkill.resumeId, testResume.id))

			expect(expJunction).toHaveLength(0)
			expect(eduJunction).toHaveLength(0)
			expect(projJunction).toHaveLength(0)
			expect(skillJunction).toHaveLength(0)

			// Verify entities still exist
			expect(await db.select().from(experience).where(eq(experience.id, exp.id))).toHaveLength(1)
			expect(await db.select().from(education).where(eq(education.id, edu.id))).toHaveLength(1)
			expect(await db.select().from(project).where(eq(project.id, proj.id))).toHaveLength(1)
			expect(await db.select().from(skill).where(eq(skill.id, sk.id))).toHaveLength(1)
		})

		it('should delete entity when it has no more resume associations', async () => {
			// This tests the OPPOSITE - when should we delete entities?
			// Answer: When user explicitly deletes the entity (not when resume is deleted)

			const [exp] = await db
				.insert(experience)
				.values({
					company: 'Orphan Company',
					startDate: '2020-01',
					title: 'Orphan Role',
					userId: testUserId,
				})
				.returning()
			createdExperienceIds.push(exp.id)

			// Create resume and link
			const [testResume] = await db
				.insert(resume)
				.values({
					headline: 'Test',
					userId: testUserId,
				})
				.returning()
			createdResumeIds.push(testResume.id)

			await db.insert(resumeExperience).values({
				experienceId: exp.id,
				order: 0,
				resumeId: testResume.id,
			})

			// Delete resume (junction is CASCADE deleted)
			await db.delete(resume).where(eq(resume.id, testResume.id))
			createdResumeIds = createdResumeIds.filter((id) => id !== testResume.id)

			// Experience should STILL exist (orphaned but available for reuse)
			const orphanedExp = await db.select().from(experience).where(eq(experience.id, exp.id))

			expect(orphanedExp).toHaveLength(1)
			expect(orphanedExp[0].company).toBe('Orphan Company')
		})
	})

	describe('Multiple Entities Per Resume', () => {
		it('should support multiple experiences with different order values', async () => {
			const experiences = []
			for (let i = 0; i < 5; i++) {
				const [exp] = await db
					.insert(experience)
					.values({
						company: `Company ${i}`,
						startDate: `202${i}-01`,
						title: `Role ${i}`,
						userId: testUserId,
					})
					.returning()
				createdExperienceIds.push(exp.id)
				experiences.push(exp)
			}

			const [testResume] = await db
				.insert(resume)
				.values({
					headline: 'Multi-Experience Resume',
					userId: testUserId,
				})
				.returning()
			createdResumeIds.push(testResume.id)

			// Add in random order
			await db.insert(resumeExperience).values({
				experienceId: experiences[3].id,
				order: 0,
				resumeId: testResume.id,
			})
			await db.insert(resumeExperience).values({
				experienceId: experiences[1].id,
				order: 1,
				resumeId: testResume.id,
			})
			await db.insert(resumeExperience).values({
				experienceId: experiences[4].id,
				order: 2,
				resumeId: testResume.id,
			})
			await db.insert(resumeExperience).values({
				experienceId: experiences[0].id,
				order: 3,
				resumeId: testResume.id,
			})
			await db.insert(resumeExperience).values({
				experienceId: experiences[2].id,
				order: 4,
				resumeId: testResume.id,
			})

			// Fetch ordered
			const ordered = await db
				.select({
					company: experience.company,
					order: resumeExperience.order,
				})
				.from(resumeExperience)
				.innerJoin(experience, eq(resumeExperience.experienceId, experience.id))
				.where(eq(resumeExperience.resumeId, testResume.id))
				.orderBy(resumeExperience.order)

			expect(ordered).toHaveLength(5)
			expect(ordered[0].company).toBe('Company 3')
			expect(ordered[1].company).toBe('Company 1')
			expect(ordered[2].company).toBe('Company 4')
			expect(ordered[3].company).toBe('Company 0')
			expect(ordered[4].company).toBe('Company 2')
		})
	})
})
