import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CreateResumeForm } from './create-resume-form'

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		back: vi.fn(),
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}))

// Mock sonner
vi.mock('sonner', () => ({
	toast: {
		error: vi.fn(),
		success: vi.fn(),
	},
}))

describe('CreateResumeForm - Step 1 Validation', () => {
	const mockUserId = 'test-user-id'

	it('should render with headline field as required', () => {
		render(<CreateResumeForm userId={mockUserId} />)

		const headlineLabel = screen.getByText(/Headline/i)
		expect(headlineLabel).toBeDefined()

		// Check for required indicator (asterisk)
		const requiredIndicator = headlineLabel.querySelector('.text-destructive')
		expect(requiredIndicator).toBeDefined()
		expect(requiredIndicator?.textContent).toBe('*')
	})

	it('should show competencies field as optional (no asterisk)', () => {
		render(<CreateResumeForm userId={mockUserId} />)

		const competenciesLabel = screen.getByText(/Competencies/i)

		// These should NOT have required indicator
		const competenciesAsterisk = competenciesLabel.querySelector('.text-destructive')

		expect(competenciesAsterisk).toBeNull()
	})

	it('should have proper placeholder for headline field', () => {
		render(<CreateResumeForm userId={mockUserId} />)

		const headlineInput = screen.getByPlaceholderText(
			/Senior Software Engineer \| Full Stack Developer/i,
		)
		expect(headlineInput).toBeDefined()
	})

	// Note: Full canAdvance logic testing would require form state manipulation
	// which is better suited for integration tests with user interactions
	// For now, we verify the UI elements that support the validation
})

describe('CreateResumeForm - Default Values', () => {
	const mockUserId = 'test-user-id'

	it('should initialize form without title field', () => {
		const { container } = render(<CreateResumeForm userId={mockUserId} />)

		// Should NOT find any input with name="title" or label="Title"
		const titleInputs = container.querySelectorAll('input[name="title"]')
		const titleLabels = Array.from(container.querySelectorAll('label')).filter((label) =>
			label.textContent?.toLowerCase().includes('title'),
		)

		expect(titleInputs.length).toBe(0)
		expect(titleLabels.length).toBe(0)
	})

	it('should initialize with empty headline', () => {
		render(<CreateResumeForm userId={mockUserId} />)

		const headlineInput = screen.getByPlaceholderText(
			/Senior Software Engineer/i,
		) as HTMLInputElement

		expect(headlineInput.value).toBe('')
	})
})

describe('CreateResumeForm - Initial Data', () => {
	const mockUserId = 'test-user-id'

	it('should populate form with provided initial data', () => {
		const initialData = {
			content: {
				competencies: ['Leadership', 'Architecture'],
				education: [],
				experience: [],
				headline: 'Principal Engineer',
				projects: [],
				skills: { soft: [], technical: [] },
				summary: 'Test summary',
			},
		}

		render(<CreateResumeForm initialData={initialData} userId={mockUserId} />)

		const headlineInput = screen.getByPlaceholderText(
			/Senior Software Engineer/i,
		) as HTMLInputElement

		waitFor(() => {
			expect(headlineInput.value).toBe('Principal Engineer')
		})
	})
})
