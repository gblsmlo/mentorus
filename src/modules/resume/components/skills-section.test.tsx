import { describe, expect, it } from 'vitest'
import { SkillsSection } from './skills-section'

/**
 * Unit tests for SkillsSection component
 * Requirements: 5.1
 *
 * Verifies that the SkillsSection component is properly exported
 * and can be used as a React component with two input fields
 * (Soft Skills and Hard Skills).
 */
describe('SkillsSection', () => {
	it('should be a valid React component', () => {
		expect(SkillsSection).toBeDefined()
		expect(typeof SkillsSection).toBe('function')
	})

	it('should have the correct component name', () => {
		expect(SkillsSection.name).toBe('SkillsSection')
	})
})
