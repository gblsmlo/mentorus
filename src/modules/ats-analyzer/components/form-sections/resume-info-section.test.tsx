import { describe, expect, it } from 'vitest'
import { ResumeInfoSection } from './resume-info-section'

/**
 * Unit tests for ResumeInfoSection component
 * Requirements: 1.1
 *
 * Verifies that the ResumeInfoSection component is properly exported
 * and can be used as a React component.
 */
describe('ResumeInfoSection', () => {
	it('should be a valid React component', () => {
		expect(ResumeInfoSection).toBeDefined()
		expect(typeof ResumeInfoSection).toBe('function')
	})

	it('should have the correct component name', () => {
		expect(ResumeInfoSection.name).toBe('ResumeInfoSection')
	})
})
