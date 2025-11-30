import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { parseCommaSeparated } from './parsers'

/**
 * Feature: resume-form-wizard-refactor, Property 1: Comma-separated input conversion
 * Validates: Requirements 1.4, 5.2, 5.3
 *
 * For any string input containing commas, when converted to an array,
 * the system should produce an array where each element is trimmed of
 * whitespace and empty strings are removed.
 */
describe('Property 1: Comma-separated input conversion', () => {
	it('should produce trimmed, non-empty strings for any comma-separated input', () => {
		// Arbitrary for strings that may contain commas, spaces, and various characters
		const commaSeparatedStringArb = fc.string({ minLength: 0, maxLength: 200 })

		fc.assert(
			fc.property(commaSeparatedStringArb, (input) => {
				const result = parseCommaSeparated(input)

				// Property 1: Result should be an array
				expect(Array.isArray(result)).toBe(true)

				// Property 2: Every element should be trimmed (no leading/trailing whitespace)
				for (const item of result) {
					expect(item).toBe(item.trim())
				}

				// Property 3: No element should be empty
				for (const item of result) {
					expect(item.length).toBeGreaterThan(0)
				}

				// Property 4: Result should not contain more elements than comma-separated parts
				const maxPossibleParts = input.split(',').length
				expect(result.length).toBeLessThanOrEqual(maxPossibleParts)
			}),
			{ numRuns: 100 },
		)
	})

	it('should preserve non-whitespace content from each comma-separated segment', () => {
		// Generate arrays of non-empty strings that don't contain commas (valid input segments)
		// We filter out commas because they would cause additional splits when joined
		const validSegmentsArb = fc.array(
			fc.string({ minLength: 1, maxLength: 30 })
				.filter((s) => s.trim().length > 0 && !s.includes(',')),
			{ minLength: 1, maxLength: 10 },
		)

		fc.assert(
			fc.property(validSegmentsArb, (segments) => {
				// Join with commas and optional whitespace
				const input = segments.map((s) => s.trim()).join(', ')
				const result = parseCommaSeparated(input)

				// Each trimmed segment should appear in the result
				const trimmedSegments = segments.map((s) => s.trim()).filter((s) => s.length > 0)
				expect(result).toEqual(trimmedSegments)
			}),
			{ numRuns: 100 },
		)
	})
})

/**
 * Unit tests for parseCommaSeparated edge cases
 * Requirements: 1.4, 5.2, 5.3
 */
describe('parseCommaSeparated unit tests', () => {
	it('should handle single value', () => {
		expect(parseCommaSeparated('React')).toEqual(['React'])
	})

	it('should handle multiple values', () => {
		expect(parseCommaSeparated('React, Node, TypeScript')).toEqual(['React', 'Node', 'TypeScript'])
	})

	it('should trim extra spaces', () => {
		expect(parseCommaSeparated('React ,  Node ,   TypeScript')).toEqual([
			'React',
			'Node',
			'TypeScript',
		])
	})

	it('should handle trailing comma', () => {
		expect(parseCommaSeparated('React, Node,')).toEqual(['React', 'Node'])
	})

	it('should handle empty string', () => {
		expect(parseCommaSeparated('')).toEqual([])
	})

	it('should handle only commas', () => {
		expect(parseCommaSeparated(',,,')).toEqual([])
	})

	it('should handle leading comma', () => {
		expect(parseCommaSeparated(',React, Node')).toEqual(['React', 'Node'])
	})

	it('should handle multiple consecutive commas', () => {
		expect(parseCommaSeparated('React,,Node,,,TypeScript')).toEqual(['React', 'Node', 'TypeScript'])
	})

	it('should handle whitespace-only segments', () => {
		expect(parseCommaSeparated('React,   , Node')).toEqual(['React', 'Node'])
	})

	it('should handle tabs and mixed whitespace', () => {
		expect(parseCommaSeparated('React\t, \tNode ,\t TypeScript')).toEqual([
			'React',
			'Node',
			'TypeScript',
		])
	})
})
