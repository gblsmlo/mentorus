'use client'

import { Button } from '@/components/ui/button'
import { Stepper } from '@/components/ui/stepper'
import type { Step, WizardStep } from '@modules/ats-analyzer/types/wizard-types'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

interface WizardWrapperProps {
	steps: WizardStep[]
	initialStep?: number
	onComplete: () => void
	onBack?: () => void
	storageKey: string
	// New: Dynamic validation per step
	canAdvanceFromStep?: (currentStep: number) => boolean
	// New: Callback when step changes (for auto-save)
	onStepChange?: (newStep: number, oldStep: number) => Promise<void>
	isSubmitting?: boolean
	submitLabel?: string
}

export function WizardWrapper({
	steps,
	initialStep = 0,
	onComplete,
	onBack,
	storageKey,
	canAdvanceFromStep,
	onStepChange,
	isSubmitting = false,
	submitLabel = 'Submit',
}: WizardWrapperProps) {
	const [currentStep, setCurrentStep] = useState(initialStep)
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
	const [isChangingStep, setIsChangingStep] = useState(false)

	const isFirstStep = currentStep === 0
	const isLastStep = currentStep === steps.length - 1

	// Generate step states for Stepper component
	const stepStates: Step[] = steps.map((step, index) => ({
		hasError: false,
		id: step.id,
		isActive: index === currentStep,
		isCompleted: completedSteps.has(index),
		label: step.label,
	}))

	// Auto-save to localStorage when step changes
	useEffect(() => {
		const saveData = {
			completedSteps: Array.from(completedSteps),
			currentStep,
			timestamp: new Date().toISOString(),
		}
		localStorage.setItem(storageKey, JSON.stringify(saveData))
	}, [currentStep, completedSteps, storageKey])

	// Load saved progress on mount
	useEffect(() => {
		const saved = localStorage.getItem(storageKey)
		if (saved) {
			try {
				const data = JSON.parse(saved)
				if (data.currentStep !== undefined) {
					setCurrentStep(data.currentStep)
				}
				if (data.completedSteps) {
					setCompletedSteps(new Set(data.completedSteps))
				}
			} catch (error) {
				console.error('Failed to load wizard progress:', error)
			}
		}
	}, [storageKey])

	const handleNext = async () => {
		const canAdvance = canAdvanceFromStep ? canAdvanceFromStep(currentStep) : true
		if (!canAdvance || isLastStep || isChangingStep) return

		setIsChangingStep(true)
		const oldStep = currentStep
		const newStep = currentStep + 1

		// Call onStepChange if provided (for auto-save)
		if (onStepChange) {
			try {
				await onStepChange(newStep, oldStep)
			} catch (error) {
				console.error('Error in onStepChange:', error)
				setIsChangingStep(false)
				return
			}
		}

		setCompletedSteps((prev) => new Set(prev).add(currentStep))
		setCurrentStep(newStep)
		setIsChangingStep(false)
	}

	const handlePrevious = () => {
		if (isFirstStep) return

		setCurrentStep((prev) => prev - 1)
	}

	const handleStepClick = (stepIndex: number) => {
		// Only allow clicking on completed steps (backward navigation)
		if (completedSteps.has(stepIndex)) {
			setCurrentStep(stepIndex)
		}
	}

	const handleComplete = () => {
		const canAdvance = canAdvanceFromStep ? canAdvanceFromStep(currentStep) : true
		if (!canAdvance) return

		// Mark final step as completed
		setCompletedSteps((prev) => new Set(prev).add(currentStep))

		// Clear localStorage draft
		localStorage.removeItem(storageKey)

		// Call parent completion handler
		onComplete()
	}

	return (
		<div className="space-y-6">
			<Stepper currentStep={currentStep} onStepClick={handleStepClick} steps={stepStates} />

			<div className="relative overflow-hidden">{steps[currentStep].component}</div>

			<div className="flex justify-between gap-4">
				<Button
					disabled={isSubmitting}
					onClick={isFirstStep ? onBack : handlePrevious}
					type="button"
					variant="outline"
				>
					<IconArrowLeft className="mr-2 h-4 w-4" />
					{isFirstStep ? 'Cancel' : 'Previous'}
				</Button>

				{isLastStep ? (
					<Button
						disabled={
							!(canAdvanceFromStep ? canAdvanceFromStep(currentStep) : true) || isSubmitting
						}
						onClick={handleComplete}
						type="submit"
					>
						{isSubmitting ? 'Saving...' : submitLabel}
						{!isSubmitting && <IconArrowRight className="ml-2 h-4 w-4" />}
					</Button>
				) : (
					<Button
						disabled={
							!(canAdvanceFromStep ? canAdvanceFromStep(currentStep) : true) || isChangingStep
						}
						onClick={handleNext}
						type="button"
					>
						{isChangingStep ? 'Saving...' : 'Next'}
						{!isChangingStep && <IconArrowRight className="ml-2 h-4 w-4" />}
					</Button>
				)}
			</div>
		</div>
	)
}
