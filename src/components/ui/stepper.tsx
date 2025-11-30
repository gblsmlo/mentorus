'use client'

import { cn } from '@/lib/utils'
import type { Step } from '@/modules/ats-analyzer/types/wizard-types'
import { IconCheck } from '@tabler/icons-react'
import { motion } from 'framer-motion'

interface StepperProps {
	steps: Step[]
	currentStep: number
	onStepClick?: (stepIndex: number) => void
}

export function Stepper({ steps, currentStep: _currentStep, onStepClick }: StepperProps) {
	return (
		<nav aria-label="Progress" className="w-full">
			<ol className="flex items-center justify-between" role="progressbar">
				{steps.map((step, index) => {
					const isClickable = step.isCompleted && onStepClick
					const isLast = index === steps.length - 1

					return (
						<li className={cn('flex items-center', !isLast && 'flex-1')} key={step.id}>
							{/* Step Circle */}
							<button
								aria-current={step.isActive ? 'step' : undefined}
								aria-label={`${step.label}${step.isCompleted ? ' (Completed)' : ''}`}
								className={cn(
									'relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
									'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
									{
										// Error state
										'border-destructive bg-background text-destructive': step.hasError,
										// Pending state
										'border-muted-foreground/30 bg-background/50 text-muted-foreground':
											!step.isActive && !step.isCompleted && !step.hasError,
										// Active state
										'border-primary bg-background text-primary': step.isActive && !step.isCompleted,
										// Completed state
										'border-primary bg-primary text-primary-foreground': step.isCompleted,
										'cursor-default': !isClickable,
										// Clickable cursor
										'cursor-pointer hover:scale-105': isClickable,
									},
								)}
								disabled={!isClickable}
								onClick={() => isClickable && onStepClick(index)}
								type="button"
							>
								{step.isCompleted ? (
									<motion.div
										animate={{ opacity: 1, scale: 1 }}
										initial={{ opacity: 0, scale: 0 }}
										transition={{ duration: 0.2 }}
									>
										<IconCheck className="h-5 w-5" />
									</motion.div>
								) : (
									<span
										className={cn('font-semibold text-sm', {
											'font-bold': step.isActive,
										})}
									>
										{index + 1}
									</span>
								)}
							</button>

							{/* Step Label */}
							<div className="ml-2 min-w-0 flex-1">
								<p
									className={cn('truncate text-sm', {
										'font-bold text-foreground': step.isActive,
										'font-medium text-foreground': step.isCompleted,
										'font-normal text-muted-foreground': !step.isActive && !step.isCompleted,
									})}
								>
									{step.label}
								</p>
							</div>

							{/* Connecting Line */}
							{!isLast && (
								<div className="mx-4 h-0.5 flex-1">
									<div
										className={cn('h-full rounded-full transition-colors', {
											'bg-muted-foreground/30': !step.isCompleted,
											'bg-primary': step.isCompleted,
										})}
									/>
								</div>
							)}
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
