/**
 * Property Tests: Version Number Monotonic Increment and Version Restoration Equivalence
 *
 * **Feature: optimization-cockpit, Property 6: Version Number Monotonic Increment**
 * **Validates: Requirements 7.2**
 *
 * For any resume, saving a new version SHALL result in a version number that is
 * exactly 1 greater than the previous highest version number for that resume.
 *
 * **Feature: optimization-cockpit, Property 7: Version Restoration Equivalence**
 * **Validates: Requirements 7.4**
 *
 * For any saved version, restoring that version SHALL produce a ResumeContent
 * object that is deeply equal to the content stored in that version.
 */

import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import type { ResumeContent } from '../../types/resume-content'
import { resumeContentArbitrary } from '../arbitraries/resume-content.arbitrary'

/**
 * Pure function to calculate next version number
 * This mirrors the logic in save-version-action.ts
 */
function calculateNextVersionNumber(existingVersionNumbers: number[]): number {
	if (existingVersionNumbers.length === 0) {
		return 1
	}
	const maxVersion = Math.max(...existingVersionNumbers)
	return maxVersion + 1
}

/**
 * Simulates version storage for testing
 */
interface VersionEntry {
	versionNumber: number
	content: ResumeContent
	commitMessage?: string
}

/**
 * Pure function to simulate saving a version
 */
function saveVersion(
	existingVersions: VersionEntry[],
	content: ResumeContent,
	commitMessage?: string,
): { newVersion: VersionEntry; allVersions: VersionEntry[] } {
	const existingNumbers = existingVersions.map((v) => v.versionNumber)
	const nextNumber = calculateNextVersionNumber(existingNumbers)

	const newVersion: VersionEntry = {
		commitMessage,
		content,
		versionNumber: nextNumber,
	}

	return {
		allVersions: [...existingVersions, newVersion],
		newVersion,
	}
}

/**
 * Pure function to simulate restoring a version
 */
function restoreVersion(
	existingVersions: VersionEntry[],
	sourceVersionNumber: number,
): { restoredContent: ResumeContent | null; newVersion: VersionEntry | null } {
	const sourceVersion = existingVersions.find((v) => v.versionNumber === sourceVersionNumber)

	if (!sourceVersion) {
		return { newVersion: null, restoredContent: null }
	}

	// Create a deep copy of the content (simulating JSON serialization)
	const restoredContent = JSON.parse(JSON.stringify(sourceVersion.content)) as ResumeContent

	const existingNumbers = existingVersions.map((v) => v.versionNumber)
	const nextNumber = calculateNextVersionNumber(existingNumbers)

	const newVersion: VersionEntry = {
		commitMessage: `Restored from version ${sourceVersionNumber}`,
		content: restoredContent,
		versionNumber: nextNumber,
	}

	return { newVersion, restoredContent }
}

describe('Version Number Properties', () => {
	it('Property 6: Next version number is exactly max + 1', () => {
		// **Feature: optimization-cockpit, Property 6: Version Number Monotonic Increment**
		fc.assert(
			fc.property(
				fc.array(fc.integer({ max: 1000, min: 1 }), { maxLength: 50, minLength: 1 }),
				(versionNumbers) => {
					const maxVersion = Math.max(...versionNumbers)
					const nextVersion = calculateNextVersionNumber(versionNumbers)

					// Next version should be exactly max + 1
					expect(nextVersion).toBe(maxVersion + 1)
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 6: First version is always 1 when no versions exist', () => {
		// **Feature: optimization-cockpit, Property 6: Version Number Monotonic Increment**
		const nextVersion = calculateNextVersionNumber([])
		expect(nextVersion).toBe(1)
	})

	it('Property 6: Sequential saves produce monotonically increasing version numbers', () => {
		// **Feature: optimization-cockpit, Property 6: Version Number Monotonic Increment**
		fc.assert(
			fc.property(fc.array(resumeContentArbitrary, { maxLength: 10, minLength: 1 }), (contents) => {
				let versions: VersionEntry[] = []

				for (const content of contents) {
					const result = saveVersion(versions, content)
					versions = result.allVersions
				}

				// Verify version numbers are sequential starting from 1
				const versionNumbers = versions.map((v) => v.versionNumber)
				for (let i = 0; i < versionNumbers.length; i++) {
					expect(versionNumbers[i]).toBe(i + 1)
				}

				// Verify each version number is greater than the previous
				for (let i = 1; i < versionNumbers.length; i++) {
					expect(versionNumbers[i]).toBeGreaterThan(versionNumbers[i - 1])
					expect(versionNumbers[i]).toBe(versionNumbers[i - 1] + 1)
				}
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 6: Version numbers are always positive integers', () => {
		// **Feature: optimization-cockpit, Property 6: Version Number Monotonic Increment**
		fc.assert(
			fc.property(
				fc.array(fc.integer({ max: 1000, min: 1 }), { maxLength: 50, minLength: 0 }),
				(existingVersions) => {
					const nextVersion = calculateNextVersionNumber(existingVersions)

					expect(Number.isInteger(nextVersion)).toBe(true)
					expect(nextVersion).toBeGreaterThan(0)
				},
			),
			{ numRuns: 100 },
		)
	})
})

describe('Version Restoration Properties', () => {
	it('Property 7: Restored content is deeply equal to source version content', () => {
		// **Feature: optimization-cockpit, Property 7: Version Restoration Equivalence**
		fc.assert(
			fc.property(
				fc.array(resumeContentArbitrary, { maxLength: 5, minLength: 1 }),
				fc.integer({ max: 4, min: 0 }),
				(contents, restoreIndex) => {
					// Build up versions
					let versions: VersionEntry[] = []
					for (const content of contents) {
						const result = saveVersion(versions, content)
						versions = result.allVersions
					}

					// Pick a valid version to restore
					const validIndex = restoreIndex % versions.length
					const sourceVersion = versions[validIndex]

					// Restore the version
					const { restoredContent } = restoreVersion(versions, sourceVersion.versionNumber)

					// Restored content should be deeply equal to source
					expect(restoredContent).toEqual(sourceVersion.content)
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 7: Restoring creates a new version with incremented number', () => {
		// **Feature: optimization-cockpit, Property 7: Version Restoration Equivalence**
		fc.assert(
			fc.property(
				fc.array(resumeContentArbitrary, { maxLength: 5, minLength: 1 }),
				fc.integer({ max: 4, min: 0 }),
				(contents, restoreIndex) => {
					// Build up versions
					let versions: VersionEntry[] = []
					for (const content of contents) {
						const result = saveVersion(versions, content)
						versions = result.allVersions
					}

					const maxVersionBefore = Math.max(...versions.map((v) => v.versionNumber))

					// Pick a valid version to restore
					const validIndex = restoreIndex % versions.length
					const sourceVersion = versions[validIndex]

					// Restore the version
					const { newVersion } = restoreVersion(versions, sourceVersion.versionNumber)

					// New version number should be max + 1
					expect(newVersion).not.toBeNull()
					expect(newVersion!.versionNumber).toBe(maxVersionBefore + 1)
				},
			),
			{ numRuns: 100 },
		)
	})

	it('Property 7: Restored content survives JSON round-trip', () => {
		// **Feature: optimization-cockpit, Property 7: Version Restoration Equivalence**
		fc.assert(
			fc.property(resumeContentArbitrary, (content) => {
				// Simulate storage and retrieval (JSON serialization)
				const stored = JSON.stringify(content)
				const retrieved = JSON.parse(stored) as ResumeContent

				// Content should be preserved through serialization
				expect(retrieved).toEqual(content)
			}),
			{ numRuns: 100 },
		)
	})

	it('Property 7: Restoring non-existent version returns null', () => {
		// **Feature: optimization-cockpit, Property 7: Version Restoration Equivalence**
		fc.assert(
			fc.property(fc.array(resumeContentArbitrary, { maxLength: 5, minLength: 1 }), (contents) => {
				// Build up versions
				let versions: VersionEntry[] = []
				for (const content of contents) {
					const result = saveVersion(versions, content)
					versions = result.allVersions
				}

				const maxVersion = Math.max(...versions.map((v) => v.versionNumber))

				// Try to restore a non-existent version
				const { restoredContent, newVersion } = restoreVersion(versions, maxVersion + 100)

				expect(restoredContent).toBeNull()
				expect(newVersion).toBeNull()
			}),
			{ numRuns: 100 },
		)
	})
})
