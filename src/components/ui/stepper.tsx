'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface StepperProps {
	steps: string[]
	currentStep: number
	className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
	return (
		<nav aria-label="Progress" className={cn('w-full', className)}>
			<ol className="flex w-full items-center">
				{steps.map((step, index) => {
					const status =
						index < currentStep ? 'complete' : index === currentStep ? 'current' : 'upcoming'

					return (
						<li
							className={cn(
								'relative flex flex-1 flex-col items-center',
								index !== steps.length - 1 &&
									"after:-translate-y-1/2 after:absolute after:top-4 after:left-1/2 after:z-[-1] after:h-[2px] after:w-full after:bg-border after:content-['']",
								index !== steps.length - 1 && index < currentStep && 'after:bg-primary',
							)}
							key={step}
						>
							<div className="group flex flex-col items-center">
								<span
									aria-current={status === 'current' ? 'step' : undefined}
									className={cn(
										'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background font-medium text-sm transition-colors duration-200',
										status === 'complete' && 'border-primary bg-primary text-primary-foreground',
										status === 'current' && 'border-primary text-primary',
										status === 'upcoming' && 'border-muted-foreground text-muted-foreground',
									)}
								>
									{status === 'complete' ? <Check className="h-5 w-5" /> : <span>{index + 1}</span>}
								</span>
								<span
									className={cn(
										'mt-2 font-medium text-xs uppercase tracking-wider',
										status === 'complete' && 'text-primary',
										status === 'current' && 'text-primary',
										status === 'upcoming' && 'text-muted-foreground',
									)}
								>
									{step}
								</span>
							</div>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}
