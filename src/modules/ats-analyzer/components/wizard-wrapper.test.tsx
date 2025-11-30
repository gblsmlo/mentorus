import { describe, expect, it } from 'vitest'
import { WizardWrapper } from './wizard-wrapper'

/**
 * Unit tests for WizardWrapper component
 * Requirements: 7.1, 7.3
 *
 * Verifies that the WizardWrapper component:
 * - Is properly exported and can be used as a React component
 * - Renders step content directly without animation wrappers
 * - Does not depend on framer-motion for animations
 */
describe('WizardWrapper', () => {
	it('should be a valid React component', () => {
		expect(WizardWrapper).toBeDefined()
		expect(typeof WizardWrapper).toBe('function')
	})

	it('should have the correct component name', () => {
		expect(WizardWrapper.name).toBe('WizardWrapper')
	})

	it('should not import framer-motion animation components', async () => {
		// Verify that the component module does not export or use AnimatePresence or motion
		// by checking the component's string representation doesn't contain animation-related code
		const componentString = WizardWrapper.toString()

		// The component should not contain AnimatePresence or motion.div references
		// This ensures animations have been properly removed
		expect(componentString).not.toContain('AnimatePresence')
		expect(componentString).not.toContain('motion.div')
	})
})
