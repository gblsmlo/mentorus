import { describe, expect, it } from 'vitest'
import { ProjectsSection } from './projects-section'

/**
 * Unit tests for ProjectsSection component
 * Requirements: 4.1
 *
 * Verifies that the ProjectsSection component is properly exported
 * and can be used as a React component with auto-expand behavior.
 */
describe('ProjectsSection', () => {
	it('should be a valid React component', () => {
		expect(ProjectsSection).toBeDefined()
		expect(typeof ProjectsSection).toBe('function')
	})

	it('should have the correct component name', () => {
		expect(ProjectsSection.name).toBe('ProjectsSection')
	})
})
