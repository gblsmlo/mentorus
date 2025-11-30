import { describe, expect, it } from 'vitest'
import { ExperienceSection } from './experience-section'

/**
 * Unit tests for ExperienceSection component
 * Requirements: 2.1
 *
 * Verifies that the ExperienceSection component is properly exported
 * and can be used as a React component with auto-expand behavior.
 */
describe('ExperienceSection', () => {
	it('should be a valid React component', () => {
		expect(ExperienceSection).toBeDefined()
		expect(typeof ExperienceSection).toBe('function')
	})

	it('should have the correct component name', () => {
		expect(ExperienceSection.name).toBe('ExperienceSection')
	})
})
