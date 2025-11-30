'use client'

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
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createResume, updateResume } from '../actions/resume-actions'
import { createResumeSchema, type ResumeContent } from '../schemas'
import type { WizardStep } from '../types/wizard-types'
import { EducationSection } from './form-sections/education-section'
import { ExperienceSection } from './form-sections/experience-section'
import { PersonalInfoSection } from './form-sections/personal-info-section'
import { ProjectsSection } from './form-sections/projects-section'
import { SkillsSection } from './form-sections/skills-section'
import { WizardWrapper } from './wizard-wrapper'

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
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [commitMessage, setCommitMessage] = useState('')

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
		mode: 'onChange', // Enable real-time validation for step advancement
		resolver: zodResolver(createResumeSchema),
	})

	// Define wizard steps
	const wizardSteps: WizardStep[] = useMemo(
		() => [
			{
				component: <PersonalInfoSection control={form.control} />,
				id: 'personal',
				label: 'Personal Info',
				validationFields: ['content.personalInfo.name', 'content.personalInfo.email'],
			},
			{
				component: <ExperienceSection control={form.control} />,
				id: 'experience',
				label: 'Experience',
			},
			{
				component: <EducationSection control={form.control} />,
				id: 'education',
				label: 'Education',
			},
			{
				component: <SkillsSection control={form.control} />,
				id: 'skills',
				label: 'Skills',
			},
			{
				component: <ProjectsSection control={form.control} />,
				id: 'projects',
				label: 'Projects',
			},
		],
		[form.control],
	)

	// Check if current step can advance (all required fields valid)
	const canAdvance = useMemo(() => {
		const errors = form.formState.errors
		const title = form.getValues('title')

		// Always require title
		if (!title) return false
		if (errors.title) return false

		// For personal info step, check required fields
		if (errors.content?.personalInfo?.name || errors.content?.personalInfo?.email) {
			return false
		}

		// All other required validations are handled by the schema
		return true
	}, [form.formState.errors, form])

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
				router.push(`/dashboard/resumes/${result.resumeId}`)
			}
		} catch (error) {
			toast.error('Failed to save resume', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	const handleComplete = () => {
		form.handleSubmit(onSubmit)()
	}

	return (
		<Form {...form}>
			<div className="space-y-6">
				{/* Resume Title */}
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

				{/* Wizard Steps */}
				<WizardWrapper
					canAdvance={canAdvance}
					isSubmitting={isSubmitting}
					onBack={() => router.back()}
					onComplete={handleComplete}
					steps={wizardSteps}
					storageKey={`resume-draft-${userId}${resumeId ? `-${resumeId}` : ''}`}
					submitLabel={resumeId ? 'Save New Version' : 'Create Resume'}
				/>

				{/* Commit Message (only for updates) */}
				{resumeId && (
					<Card>
						<CardHeader>
							<CardTitle>Version Message (Optional)</CardTitle>
							<CardDescription>
								Describe what changed in this version (like a Git commit message)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Input
								onChange={(e) => setCommitMessage(e.target.value)}
								placeholder="e.g., Added React skills and recent project"
								value={commitMessage}
							/>
						</CardContent>
					</Card>
				)}
			</div>
		</Form>
	)
}
