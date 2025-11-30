import { describe, expect, it } from 'vitest'
import { createResumeSchema, resumeContentSchema, step1Schema } from './schemas'

describe('Resume Schemas Validation Tests', () => {
	describe('resumeContentSchema', () => {
		it('should validate with only headline (required field)', () => {
			const data = {
				headline: 'Senior Software Engineer',
			}

			const result = resumeContentSchema.safeParse(data)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.headline).toBe('Senior Software Engineer')
				expect(result.data.competencies).toEqual([])
			}
		})

		it('should fail when headline is empty', () => {
			const data = {
				headline: '',
			}

			const result = resumeContentSchema.safeParse(data)
			expect(result.success).toBe(false)
		})

		it('should fail when headline is missing', () => {
			const data = {
				// headline missing
			}

			const result = resumeContentSchema.safeParse(data)
			expect(result.success).toBe(false)
		})

		it('should validate with all fields populated', () => {
			const data = {
				competencies: ['Leadership', 'Architecture'],
				education: [],
				experience: [],
				headline: 'Staff Engineer',
				projects: [],
				skills: { soft: [], technical: [] },
				summary: 'Expert in distributed systems',
			}

			const result = resumeContentSchema.safeParse(data)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.headline).toBe('Staff Engineer')
				expect(result.data.competencies).toEqual(['Leadership', 'Architecture'])
				expect(result.data.summary).toBe('Expert in distributed systems')
			}
		})

		it('should apply default values for optional arrays', () => {
			const data = {
				headline: 'Full Stack Developer',
			}

			const result = resumeContentSchema.safeParse(data)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.competencies).toEqual([])
				expect(result.data.education).toEqual([])
				expect(result.data.experience).toEqual([])
				expect(result.data.projects).toEqual([])
				// Updated: new structure uses hard/soft/tools instead of technical/soft
				expect(result.data.skills).toEqual({ hard: [], soft: [], tools: [] })
			}
		})
	})

	describe('step1Schema', () => {
		it('should validate with only headline', () => {
			const data = {
				headline: 'Backend Engineer',
			}

			const result = step1Schema.safeParse(data)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.headline).toBe('Backend Engineer')
				expect(result.data.competencies).toEqual([])
			}
		})

		it('should validate with all step 1 fields', () => {
			const data = {
				competencies: ['TDD', 'DDD', 'Microservices'],
				headline: 'Senior Backend Engineer',
			}

			const result = step1Schema.safeParse(data)
			expect(result.success).toBe(true)
			if (result.success) {
				expect(result.data.headline).toBe('Senior Backend Engineer')
				expect(result.data.competencies).toEqual(['TDD', 'DDD', 'Microservices'])
			}
		})

		it('should fail when headline is empty', () => {
			const data = {
				headline: '',
			}

			const result = step1Schema.safeParse(data)
			expect(result.success).toBe(false)
		})

		it('should fail when headline is missing', () => {
			const data = {
				// headline missing
			}

			const result = step1Schema.safeParse(data)
			expect(result.success).toBe(false)
		})
	})

	describe('createResumeSchema', () => {
		it('should validate with only required content fields', () => {
			const data = {
				content: {
					headline: 'DevOps Engineer',
				},
			}

			const result = createResumeSchema.safeParse(data)
			expect(result.success).toBe(true)
		})

		it('should fail when headline is missing in content', () => {
			const data = {
				content: {
					// headline missing
				},
			}

			const result = createResumeSchema.safeParse(data)
			expect(result.success).toBe(false)
		})

		it('should validate with full content', () => {
			const data = {
				content: {
					competencies: ['Agile', 'Scrum'],
					education: [],
					experience: [],
					headline: 'Principal Engineer',
					projects: [],
					skills: { soft: ['Communication'], technical: ['TypeScript', 'React'] },
					summary: 'Building scalable systems',
				},
			}

			const result = createResumeSchema.safeParse(data)
			expect(result.success).toBe(true)
		})

		it('should NOT require title field (removed in refactoring)', () => {
			const data = {
				content: {
					headline: 'Software Architect',
				},
				title: 'This should not be required',
			}

			const result = createResumeSchema.safeParse(data)
			// Should succeed even without title
			expect(result.success).toBe(true)
		})
	})

	describe('Deprecated Fields', () => {
		it('should still accept deprecated fields for backward compatibility during migration', () => {
			const data = {
				// Deprecated fields
				education: [
					{
						degree: 'BS Computer Science',
						school: 'MIT',
					},
				],
				experience: [
					{
						bullets: ['Led team of 10'],
						company: 'Google',
						current: true,
						startDate: '2020-01',
						title: 'Engineering Manager',
					},
				],
				headline: 'Engineering Manager',
				projects: [
					{
						name: 'Cloud Platform',
					},
				],
				skills: {
					soft: ['Leadership'],
					technical: ['Go', 'Kubernetes'],
				},
			}

			const result = resumeContentSchema.safeParse(data)
			expect(result.success).toBe(true)
		})
	})
})
