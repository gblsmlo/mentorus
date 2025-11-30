/**
 * Property Test: ResumeContent Round-Trip Serialization
 *
 * **Feature: optimization-cockpit, Property 8: ResumeContent Round-Trip Serialization**
 * **Validates: Requirements 8.3**
 *
 * For any valid ResumeContent object, serializing to JSON and then deserializing
 * back SHALL produce an object that is deeply equal to the original.
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { resumeContentSchema } from '../../schemas/resume-content.schema'
import { resumeContentArbitrary } from '../arbitraries/resume-content.arbitrary'

describe('ResumeContent Serialization Properties', () => {
	it('Property 8: Round-trip serialization preserves data integrity', () => {
		fc.assert(
			fc.property(resumeContentArbitrary, (resumeContent) => {
				// Serialize to JSON string
				const serialized = JSON.stringify(resumeContent)

				// Deserialize back to object
				const deserialized = JSON.parse(serialized)

				// Validate the deserialized object against the schema
				const parseResult = resumeContentSchema.safeParse(deserialized)

				// The deserialized object should be valid
				expect(parseResult.success).toBe(true)

				// The deserialized object should be deeply equal to the original
				expect(deserialized).toEqual(resumeContent)
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 8: Validated content round-trips correctly', () => {
		fc.assert(
			fc.property(resumeContentArbitrary, (resumeContent) => {
				// First validate the input
				const validatedInput = resumeContentSchema.parse(resumeContent)

				// Serialize validated content
				const serialized = JSON.stringify(validatedInput)

				// Deserialize and validate again
				const deserialized = JSON.parse(serialized)
				const validatedOutput = resumeContentSchema.parse(deserialized)

				// Both validated objects should be equal
				expect(validatedOutput).toEqual(validatedInput)
			}),
			{ numRuns: 100 },
		)
	})
})
