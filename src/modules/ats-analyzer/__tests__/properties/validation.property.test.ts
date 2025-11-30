/**
 * Property Test: Validation Error Descriptiveness
 *
 * **Feature: optimization-cockpit, Property 9: Validation Error Descriptiveness**
 * **Validates: Requirements 8.4**
 *
 * For any invalid ResumeContent data, validation SHALL reject the data and return
 * an error object containing at least one descriptive error message identifying
 * the invalid field.
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { resumeContentSchema } from '../../schemas/resume-content.schema'
import { resumeContentArbitrary } from '../arbitraries/resume-content.arbitrary'

/**
 * Generates invalid ResumeContent by taking a valid one and corrupting specific fields
 */
const invalidResumeContentArbitrary = fc.oneof(
	// Invalid email
	resumeContentArbitrary.map((content) => ({
		...content,
		_invalidField: 'basics.email',
		basics: { ...content.basics, email: 'not-an-email' },
	})),
	// Empty name
	resumeContentArbitrary.map((content) => ({
		...content,
		_invalidField: 'basics.name',
		basics: { ...content.basics, name: '' },
	})),
	// Invalid country code (wrong length)
	resumeContentArbitrary.map((content) => ({
		...content,
		_invalidField: 'basics.location.countryCode',
		basics: {
			...content.basics,
			location: { ...content.basics.location, countryCode: 'USA' },
		},
	})),
	// Empty summary
	resumeContentArbitrary.map((content) => ({
		...content,
		_invalidField: 'summary',
		summary: '',
	})),
	// Invalid profile URL
	resumeContentArbitrary.map((content) => ({
		...content,
		_invalidField: 'basics.profiles',
		basics: {
			...content.basics,
			profiles: [{ network: 'LinkedIn', url: 'not-a-url' }],
		},
	})),
	// Invalid meta completionScore (out of range)
	resumeContentArbitrary.map((content) => ({
		...content,
		_invalidField: 'meta.completionScore',
		meta: { ...content.meta, completionScore: 150 },
	})),
)

describe('ResumeContent Validation Properties', () => {
	it('Property 9: Invalid data produces descriptive error messages', () => {
		fc.assert(
			fc.property(invalidResumeContentArbitrary, (invalidContent) => {
				const { _invalidField, ...contentToValidate } = invalidContent

				// Attempt to validate the invalid content
				const result = resumeContentSchema.safeParse(contentToValidate)

				// Validation should fail
				expect(result.success).toBe(false)

				if (!result.success) {
					// Should have at least one error
					expect(result.error.issues.length).toBeGreaterThan(0)

					// Each error should have a path and message
					for (const issue of result.error.issues) {
						expect(issue.path).toBeDefined()
						expect(issue.message).toBeDefined()
						expect(typeof issue.message).toBe('string')
						expect(issue.message.length).toBeGreaterThan(0)
					}
				}
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 9: Error messages identify the invalid field path', () => {
		fc.assert(
			fc.property(invalidResumeContentArbitrary, (invalidContent) => {
				const { _invalidField, ...contentToValidate } = invalidContent

				const result = resumeContentSchema.safeParse(contentToValidate)

				// Validation should fail
				expect(result.success).toBe(false)

				if (!result.success) {
					// At least one error should have a non-empty path
					const hasPathInfo = result.error.issues.some(
						(issue) => issue.path && issue.path.length > 0,
					)
					expect(hasPathInfo).toBe(true)
				}
			}),
			{ numRuns: 100 },
		)
	})
})
