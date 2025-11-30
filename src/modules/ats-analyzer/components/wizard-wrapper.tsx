'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Stepper } from '@/components/ui/stepper'
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import type { Step, WizardStep } from '../types/wizard-types'

interface WizardWrapperProps {
	steps: WizardStep[]
	initialStep?: number
	onComplete: () => void
	onBack?: () => void
	storageKey: string
	canAdvance: boolean // From parent form validation
	isSubmitting?: boolean
	submitLabel?: string
}

export function WizardWrapper({
	steps,
	initialStep = 0,
	onComplete,
	onBack,
	storageKey,
	canAdvance,
	isSubmitting = false,
	submitLabel = 'Submit',
}: WizardWrapperProps) {
	const [currentStep, setCurrentStep] = useState(initialStep)
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
	const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

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

	const handleNext = () => {
		if (!canAdvance || isLastStep) return

		setCompletedSteps((prev) => new Set(prev).add(currentStep))
		setDirection('forward')
		setCurrentStep((prev) => prev + 1)
	}

	const handlePrevious = () => {
		if (isFirstStep) return

		setDirection('backward')
		setCurrentStep((prev) => prev - 1)
	}

	const handleStepClick = (stepIndex: number) => {
		// Only allow clicking on completed steps (backward navigation)
		if (completedSteps.has(stepIndex)) {
			setDirection(stepIndex < currentStep ? 'backward' : 'forward')
			setCurrentStep(stepIndex)
		}
	}

	const handleComplete = () => {
		if (!canAdvance) return

		// Mark final step as completed
		setCompletedSteps((prev) => new Set(prev).add(currentStep))

		// Clear localStorage draft
		localStorage.removeItem(storageKey)

		// Call parent completion handler
		onComplete()
	}

	// Animation variants for content transitions
	const variants = {
		center: {
			opacity: 1,
			x: 0,
		},
		enter: (direction: 'forward' | 'backward') => ({
			opacity: 0,
			x: direction === 'forward' ? 300 : -300,
		}),
		exit: (direction: 'forward' | 'backward') => ({
			opacity: 0,
			x: direction === 'forward' ? -300 : 300,
		}),
	}

	return (
		<div className="space-y-6">
			{/* Stepper Header */}
			<Card>
				<CardContent className="pt-6">
					<Stepper currentStep={currentStep} onStepClick={handleStepClick} steps={stepStates} />
				</CardContent>
			</Card>

			{/* Step Content with Animation */}
			<div className="relative overflow-hidden">
				<AnimatePresence custom={direction} mode="wait">
					<motion.div
						animate="center"
						custom={direction}
						exit="exit"
						initial="enter"
						key={currentStep}
						transition={{
							opacity: { duration: 0.2 },
							x: { damping: 30, stiffness: 300, type: 'spring' },
						}}
						variants={variants}
					>
						{steps[currentStep].component}
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Navigation Buttons */}
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
					<Button disabled={!canAdvance || isSubmitting} onClick={handleComplete} type="submit">
						{isSubmitting ? 'Saving...' : submitLabel}
						{!isSubmitting && <IconArrowRight className="ml-2 h-4 w-4" />}
					</Button>
				) : (
					<Button disabled={!canAdvance} onClick={handleNext} type="button">
						Next
						<IconArrowRight className="ml-2 h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
