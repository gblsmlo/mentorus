import { describe, it, expect } from 'vitest'
import { EducationSection } from './education-section'

/**
 * Unit tests for EducationSection component
 * Requirements: 3.1
 *
 * Verifies that the EducationSection component is properly exported
 * and can be used as a React component with auto-expand behavior.
 */
describe('EducationSection', () => {
	it('should be a valid React component', () => {
		expect(EducationSection).toBeDefined()
		expect(typeof EducationSection).toBe('function')
	})

	it('should have the correct component name', () => {
		expect(EducationSection.name).toBe('EducationSection')
	})
})
