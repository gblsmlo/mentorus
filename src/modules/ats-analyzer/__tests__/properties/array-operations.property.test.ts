/**
 * Property Test: Work Experience Array Invariants
 *
 * **Feature: optimization-cockpit, Property 4: Work Experience Array Invariants**
 * **Validates: Requirements 5.2**
 *
 * For any work experience array:
 * - Adding an entry SHALL increase the array length by 1
 * - Removing an entry SHALL decrease the array length by 1
 * - Reordering SHALL preserve all entries (same length, same elements)
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import type { ResumeWorkExperience } from '../../types/resume-content'
import { workArbitrary } from '../arbitraries/resume-content.arbitrary'

/**
 * Pure functions that model the array operations used in WorkExperienceSection
 * These mirror the behavior of useFieldArray's append, remove, and move operations
 */

function appendWorkExperience(
	array: ResumeWorkExperience[],
	item: ResumeWorkExperience,
): ResumeWorkExperience[] {
	return [...array, item]
}

function removeWorkExperience(
	array: ResumeWorkExperience[],
	index: number,
): ResumeWorkExperience[] {
	if (index < 0 || index >= array.length) {
		return array
	}
	return array.filter((_, i) => i !== index)
}

function moveWorkExperience(
	array: ResumeWorkExperience[],
	fromIndex: number,
	toIndex: number,
): ResumeWorkExperience[] {
	if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length) {
		return array
	}
	const result = [...array]
	const [removed] = result.splice(fromIndex, 1)
	result.splice(toIndex, 0, removed)
	return result
}

describe('Work Experience Array Operations Properties', () => {
	it('Property 4.1: Adding an entry increases array length by 1', () => {
		fc.assert(
			fc.property(
				fc.array(workArbitrary, { maxLength: 10, minLength: 0 }),
				workArbitrary,
				(initialArray, newItem) => {
					const originalLength = initialArray.length
					const resultArray = appendWorkExperience(initialArray, newItem)

					// Length should increase by exactly 1
					expect(resultArray.length).toBe(originalLength + 1)

					// The new item should be at the end
					expect(resultArray[resultArray.length - 1]).toEqual(newItem)

					// Original items should be preserved in order
					for (let i = 0; i < originalLength; i++) {
						expect(resultArray[i]).toEqual(initialArray[i])
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 4.2: Removing an entry decreases array length by 1', () => {
		fc.assert(
			fc.property(fc.array(workArbitrary, { maxLength: 10, minLength: 1 }), (initialArray) => {
				// Generate a valid index to remove
				const indexToRemove = Math.floor(Math.random() * initialArray.length)
				const originalLength = initialArray.length
				const removedItem = initialArray[indexToRemove]
				const resultArray = removeWorkExperience(initialArray, indexToRemove)

				// Length should decrease by exactly 1
				expect(resultArray.length).toBe(originalLength - 1)

				// The removed item should not be at the same index
				if (resultArray.length > 0 && indexToRemove < resultArray.length) {
					expect(resultArray[indexToRemove]).not.toEqual(removedItem)
				}

				// All remaining items should be from the original array
				for (const item of resultArray) {
					expect(initialArray).toContainEqual(item)
				}
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 4.3: Reordering preserves all entries (same length, same elements)', () => {
		fc.assert(
			fc.property(
				fc.array(workArbitrary, { maxLength: 10, minLength: 2 }),
				fc.nat(),
				fc.nat(),
				(initialArray, fromSeed, toSeed) => {
					// Generate valid indices
					const fromIndex = fromSeed % initialArray.length
					const toIndex = toSeed % initialArray.length

					const resultArray = moveWorkExperience(initialArray, fromIndex, toIndex)

					// Length should remain the same
					expect(resultArray.length).toBe(initialArray.length)

					// All original elements should still be present
					const originalIds = initialArray.map((item) => item.id).sort()
					const resultIds = resultArray.map((item) => item.id).sort()
					expect(resultIds).toEqual(originalIds)

					// Each element should appear exactly once
					const idCounts = new Map<string, number>()
					for (const item of resultArray) {
						idCounts.set(item.id, (idCounts.get(item.id) || 0) + 1)
					}
					for (const count of idCounts.values()) {
						expect(count).toBe(1)
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 4.4: Remove with invalid index returns unchanged array', () => {
		fc.assert(
			fc.property(
				fc.array(workArbitrary, { maxLength: 10, minLength: 0 }),
				fc.integer(),
				(initialArray, invalidIndex) => {
					// Only test with truly invalid indices
					fc.pre(invalidIndex < 0 || invalidIndex >= initialArray.length)

					const resultArray = removeWorkExperience(initialArray, invalidIndex)

					// Array should be unchanged
					expect(resultArray.length).toBe(initialArray.length)
					expect(resultArray).toEqual(initialArray)
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 4.5: Move with invalid indices returns unchanged array', () => {
		fc.assert(
			fc.property(
				fc.array(workArbitrary, { maxLength: 10, minLength: 1 }),
				fc.integer(),
				fc.integer(),
				(initialArray, fromIndex, toIndex) => {
					// Only test with at least one invalid index
					fc.pre(
						fromIndex < 0 ||
							fromIndex >= initialArray.length ||
							toIndex < 0 ||
							toIndex >= initialArray.length,
					)

					const resultArray = moveWorkExperience(initialArray, fromIndex, toIndex)

					// Array should be unchanged
					expect(resultArray.length).toBe(initialArray.length)
					expect(resultArray).toEqual(initialArray)
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 4.6: Sequential add and remove returns to original length', () => {
		fc.assert(
			fc.property(
				fc.array(workArbitrary, { maxLength: 10, minLength: 0 }),
				workArbitrary,
				(initialArray, newItem) => {
					const originalLength = initialArray.length

					// Add an item
					const afterAdd = appendWorkExperience(initialArray, newItem)
					expect(afterAdd.length).toBe(originalLength + 1)

					// Remove the last item (the one we just added)
					const afterRemove = removeWorkExperience(afterAdd, afterAdd.length - 1)

					// Should be back to original length
					expect(afterRemove.length).toBe(originalLength)

					// Original items should be preserved
					expect(afterRemove).toEqual(initialArray)
				},
			),
			{ numRuns: 100 },
		)
	})
})
