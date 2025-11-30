export interface Step {
	id: string
	label: string
	isCompleted: boolean
	isActive: boolean
	hasError: boolean
}

export interface WizardStep {
	id: string
	label: string
	component: React.ReactNode
	validationFields?: string[] // Field paths to validate for this step
}

export interface WizardState {
	currentStep: number
	completedSteps: Set<number>
	stepErrors: Map<number, boolean>
}
