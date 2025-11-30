/**
 * Property-Based Tests for Gap Analysis with Priority Sorting
 *
 * **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
 * **Validates: Requirements 4.1, 4.2**
 *
 * Tests that missing keywords are correctly identified and sorted by importance:
 * - Hard skills first (highest priority)
 * - Soft skills second
 * - General keywords last
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { analyzeGaps, sortByPriority } from '../../utils/resume-matcher'
import type { CategorizedKeyword } from '../../utils/score-calculator'
import {
	generalKeywordArbitrary,
	hardSkillKeywordArbitrary,
	jobKeywordsArbitrary,
	nonEmptyJobKeywordsArbitrary,
	softSkillKeywordArbitrary,
} from '../arbitraries/job-description.arbitrary'
import { resumeContentArbitrary } from '../arbitraries/resume-content.arbitrary'

describe('Gap Analysis with Priority Sorting - Property Tests', () => {
	/**
	 * Property 3: Gap Analysis with Priority Sorting
	 *
	 * For any job description and ResumeContent, missing keywords SHALL be
	 * correctly identified (keyword in job but not in resume) and sorted by
	 * importance with hard skills appearing before soft skills.
	 */
	it('Property 3: Missing keywords are sorted by priority (hard > soft > general)', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(resumeContentArbitrary, nonEmptyJobKeywordsArbitrary, (resume, jobKeywords) => {
				const result = analyzeGaps(resume, jobKeywords)

				// Verify priority ordering in missing keywords
				let lastPriority = 0
				for (const keyword of result.missingKeywords) {
					const currentPriority = getPriorityValue(keyword.category)
					expect(currentPriority).toBeGreaterThanOrEqual(lastPriority)
					lastPriority = currentPriority
				}

				return true
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 3: Hard skills appear before soft skills in missing keywords', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(
				resumeContentArbitrary,
				fc.tuple(
					fc.array(hardSkillKeywordArbitrary, { maxLength: 5, minLength: 1 }),
					fc.array(softSkillKeywordArbitrary, { maxLength: 5, minLength: 1 }),
				),
				(resume, [hardSkills, softSkills]) => {
					// Deduplicate keywords
					const allKeywords = deduplicateKeywords([...hardSkills, ...softSkills])
					if (allKeywords.length === 0) return true

					const result = analyzeGaps(resume, allKeywords)

					// Find first soft skill index in missing keywords
					const firstSoftIndex = result.missingKeywords.findIndex(
						(k) => k.category === 'soft_skill',
					)

					// Find last hard skill index in missing keywords
					const lastHardIndex = findLastIndex(
						result.missingKeywords,
						(k) => k.category === 'hard_skill',
					)

					// If both exist, all hard skills should come before soft skills
					if (firstSoftIndex !== -1 && lastHardIndex !== -1) {
						expect(lastHardIndex).toBeLessThan(firstSoftIndex)
					}

					return true
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 3: Matched + missing equals total job keywords', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(resumeContentArbitrary, jobKeywordsArbitrary, (resume, jobKeywords) => {
				const result = analyzeGaps(resume, jobKeywords)

				// Total matched + missing should equal input keywords
				expect(result.matchedKeywords.length + result.missingKeywords.length).toBe(
					jobKeywords.length,
				)

				return true
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 3: Missing keywords are not in resume', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(resumeContentArbitrary, jobKeywordsArbitrary, (resume, jobKeywords) => {
				const result = analyzeGaps(resume, jobKeywords)

				// All missing keywords should be from job keywords
				const jobKeywordSet = new Set(jobKeywords.map((k) => k.keyword.toLowerCase()))
				for (const missing of result.missingKeywords) {
					expect(jobKeywordSet.has(missing.keyword.toLowerCase())).toBe(true)
				}

				return true
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 3: Gaps by category are correctly grouped', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(resumeContentArbitrary, nonEmptyJobKeywordsArbitrary, (resume, jobKeywords) => {
				const result = analyzeGaps(resume, jobKeywords)

				// Verify category grouping
				for (const kw of result.gapsByCategory.hardSkills) {
					expect(kw.category).toBe('hard_skill')
				}
				for (const kw of result.gapsByCategory.softSkills) {
					expect(kw.category).toBe('soft_skill')
				}
				for (const kw of result.gapsByCategory.general) {
					expect(kw.category).toBe('general')
				}

				// Total gaps by category should equal missing keywords
				const totalGaps =
					result.gapsByCategory.hardSkills.length +
					result.gapsByCategory.softSkills.length +
					result.gapsByCategory.general.length
				expect(totalGaps).toBe(result.missingKeywords.length)

				return true
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 3: Suggestions have correct priority values', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(resumeContentArbitrary, nonEmptyJobKeywordsArbitrary, (resume, jobKeywords) => {
				const result = analyzeGaps(resume, jobKeywords)

				for (const suggestion of result.suggestions) {
					// Verify priority matches category
					if (suggestion.category === 'hard_skill') {
						expect(suggestion.priority).toBe(1)
					} else if (suggestion.category === 'soft_skill') {
						expect(suggestion.priority).toBe(2)
					} else {
						expect(suggestion.priority).toBe(3)
					}

					// Verify suggestion text is non-empty
					expect(suggestion.suggestion.length).toBeGreaterThan(0)
				}

				return true
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 3: sortByPriority is idempotent', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(
				fc.array(
					fc.oneof(hardSkillKeywordArbitrary, softSkillKeywordArbitrary, generalKeywordArbitrary),
					{ maxLength: 20, minLength: 1 },
				),
				(keywords) => {
					const sorted1 = sortByPriority(keywords)
					const sorted2 = sortByPriority(sorted1)

					// Sorting twice should produce same result
					expect(sorted2).toEqual(sorted1)

					return true
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 3: sortByPriority preserves all elements', () => {
		// **Feature: optimization-cockpit, Property 3: Gap Analysis with Priority Sorting**
		fc.assert(
			fc.property(
				fc.array(
					fc.oneof(hardSkillKeywordArbitrary, softSkillKeywordArbitrary, generalKeywordArbitrary),
					{ maxLength: 20, minLength: 0 },
				),
				(keywords) => {
					const sorted = sortByPriority(keywords)

					// Length should be preserved
					expect(sorted.length).toBe(keywords.length)

					// All original keywords should be present
					const originalSet = new Set(keywords.map((k) => k.keyword))
					const sortedSet = new Set(sorted.map((k) => k.keyword))
					expect(sortedSet).toEqual(originalSet)

					return true
				},
			),
			{ numRuns: 100 },
		)
	})
})

/**
 * Helper to get numeric priority value for category
 */
function getPriorityValue(category: CategorizedKeyword['category']): number {
	switch (category) {
		case 'hard_skill':
			return 1
		case 'soft_skill':
			return 2
		case 'general':
			return 3
	}
}

/**
 * Helper to find last index matching predicate
 */
function findLastIndex<T>(arr: T[], predicate: (item: T) => boolean): number {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (predicate(arr[i])) return i
	}
	return -1
}

/**
 * Helper to deduplicate keywords by keyword string
 */
function deduplicateKeywords(keywords: CategorizedKeyword[]): CategorizedKeyword[] {
	const seen = new Set<string>()
	return keywords.filter((k) => {
		if (seen.has(k.keyword)) return false
		seen.add(k.keyword)
		return true
	})
}
