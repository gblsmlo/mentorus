'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Stepper } from '@/components/ui/stepper'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createResume, updateResume } from '../actions/resume-actions'
import { createResumeSchema, type ResumeContent } from '../schemas'
import { EducationSection } from './form-sections/education-section'
import { ExperienceSection } from './form-sections/experience-section'
import { PersonalInfoSection } from './form-sections/personal-info-section'
import { ProjectsSection } from './form-sections/projects-section'
import { SkillsSection } from './form-sections/skills-section'

interface ResumeFormProps {
	userId: string
	resumeId?: string
	initialData?: {
		title: string
		content: ResumeContent
	}
	onSave?: (data: { title: string; content: ResumeContent }) => Promise<void>
}

export function ResumeForm({ userId, resumeId, initialData, onSave }: ResumeFormProps) {
	const router = useRouter()
	const [currentStep, setCurrentStep] = useState(0)
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [commitMessage, setCommitMessage] = useState('')
	const steps = ['Personal', 'Experience', 'Education', 'Skills', 'Projects', 'Review']

	const form = useForm({
		defaultValues: initialData || {
			content: {
				education: [],
				experience: [],
				personalInfo: {
					email: '',
					github: '',
					linkedin: '',
					location: '',
					name: '',
					phone: '',
					website: '',
				},
				projects: [],
				skills: {
					certifications: [],
					languages: [],
					soft: [],
					technical: [],
				},
				summary: '',
			},
			title: '',
		},
		mode: 'onChange', // Enable validation on change for better UX
		resolver: zodResolver(createResumeSchema),
	})

	// Mapping steps to field names for validation
	const stepFields = [
		['content.personalInfo'], // Personal
		['content.experience'], // Experience
		['content.education'], // Education
		['content.skills'], // Skills
		['content.projects'], // Projects
		[], // Review (no specific fields to validate before entering)
	]

	const nextStep = async () => {
		const fields = stepFields[currentStep]
		const isValid = await form.trigger(fields as any)

		if (isValid) {
			if (currentStep < steps.length - 1) {
				setCurrentStep((prev) => prev + 1)
				// Auto-save draft logic could go here
				if (resumeId || onSave) {
					// Silent save
					const values = form.getValues()
					if (onSave) {
						await onSave(values as any)
					} else if (resumeId) {
						await updateResume(userId, {
							commitMessage: 'Auto-save: Step ' + steps[currentStep],
							content: values.content,
							resumeId,
						})
					}
				}
			}
		}
	}

	const prevStep = () => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1)
		}
	}

	async function onSubmit(data: { title: string; content: ResumeContent }) {
		setIsSubmitting(true)
		try {
			if (onSave) {
				await onSave(data)
				return
			}

			if (resumeId) {
				// Update existing resume (creates new version)
				await updateResume(userId, {
					commitMessage: commitMessage || `Update: ${new Date().toLocaleString()}`,
					content: data.content,
					resumeId,
				})
				toast.success('Resume updated successfully!', {
					description: 'A new version has been created.',
				})
			} else {
				// Create new resume
				const result = await createResume(userId, data)
				toast.success('Resume created successfully!')
				router.push(`/resumes/${result.resumeId}`)
			}
		} catch (error) {
			toast.error('Failed to save resume', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className="space-y-8">
			<Stepper currentStep={currentStep} steps={steps} />

			<Form {...form}>
				<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
					{/* Resume Title - Only show on first step or make it always visible? 
                        Decision: Keep it always visible but maybe smaller or just part of Personal step.
                        For now, keeping it at the top but maybe we can move it to Personal step later.
                    */}
					<Card>
						<CardHeader>
							<CardTitle>Resume Information</CardTitle>
							<CardDescription>Give your resume a descriptive title</CardDescription>
						</CardHeader>
						<CardContent>
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Resume Title</FormLabel>
										<FormControl>
											<Input placeholder="e.g., Software Engineer Resume" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="min-h-[400px]">
						{currentStep === 0 && (
							<div className="fade-in slide-in-from-right-4 animate-in space-y-4 duration-300">
								<h2 className="font-semibold text-xl">Personal Information</h2>
								<PersonalInfoSection control={form.control} />
							</div>
						)}
						{currentStep === 1 && (
							<div className="fade-in slide-in-from-right-4 animate-in space-y-4 duration-300">
								<h2 className="font-semibold text-xl">Experience</h2>
								<ExperienceSection control={form.control} />
							</div>
						)}
						{currentStep === 2 && (
							<div className="fade-in slide-in-from-right-4 animate-in space-y-4 duration-300">
								<h2 className="font-semibold text-xl">Education</h2>
								<EducationSection control={form.control} />
							</div>
						)}
						{currentStep === 3 && (
							<div className="fade-in slide-in-from-right-4 animate-in space-y-4 duration-300">
								<h2 className="font-semibold text-xl">Skills</h2>
								<SkillsSection control={form.control} />
							</div>
						)}
						{currentStep === 4 && (
							<div className="fade-in slide-in-from-right-4 animate-in space-y-4 duration-300">
								<h2 className="font-semibold text-xl">Projects</h2>
								<ProjectsSection control={form.control} />
							</div>
						)}
						{currentStep === 5 && (
							<div className="fade-in slide-in-from-right-4 animate-in space-y-4 duration-300">
								<h2 className="font-semibold text-xl">Review & Finish</h2>
								<Card>
									<CardHeader>
										<CardTitle>Ready to finalize?</CardTitle>
										<CardDescription>
											Review your information. You can go back to edit any section.
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										{resumeId && (
											<div className="space-y-2">
												<FormLabel>Version Message (Optional)</FormLabel>
												<Input
													onChange={(e) => setCommitMessage(e.target.value)}
													placeholder="e.g., Added React skills and recent project"
													value={commitMessage}
												/>
											</div>
										)}
										<div className="rounded-md bg-muted p-4">
											<p className="text-muted-foreground text-sm">
												Click "Finish" to save your resume. You can always edit it later.
											</p>
										</div>
									</CardContent>
								</Card>
							</div>
						)}
					</div>

					{/* Navigation Buttons */}
					<div className="flex justify-between border-t pt-4">
						<Button
							disabled={isSubmitting}
							onClick={currentStep === 0 ? () => router.back() : prevStep}
							type="button"
							variant="outline"
						>
							{currentStep === 0 ? 'Cancel' : 'Back'}
						</Button>

						{currentStep === steps.length - 1 ? (
							<Button disabled={isSubmitting} type="submit">
								{isSubmitting ? 'Saving...' : 'Finish'}
							</Button>
						) : (
							<Button disabled={isSubmitting} onClick={nextStep} type="button">
								Next
							</Button>
						)}
					</div>
				</form>
			</Form>
		</div>
	)
}
