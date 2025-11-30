'use client'

import { Form } from '@/components/ui/form'
import { Alert, AlertDescription } from '@components/ui/alert'
import { zodResolver } from '@hookform/resolvers/zod'
import type { WizardStep } from '@modules/ats-analyzer/types/wizard-types'
import { isFailure, isSuccess } from '@shared/errors/result'
import { sleep } from '@utils/sleep'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { autoSaveResumeAction } from '../actions/auto-save-resume-action'
import { createResumeAction } from '../actions/create-resume-action'
import { EducationSection } from '../components/education-section'
import { ExperienceSection } from '../components/experience-section'
import { ProjectsSection } from '../components/projects-section'
import { ResumeInfoSection } from '../components/resume-info-section'
import { SkillsSection } from '../components/skills-section'
import { WizardWrapper } from '../components/wizard-wrapper'
import {
	type CreateResumeData,
	createResumeSchema,
	type ResumeContent,
	step1Schema,
	step2Schema,
	step3Schema,
	step4Schema,
	step5Schema,
} from '../schemas'

interface CreateResumeFormProps {
	userId: string
	initialData?: {
		title: string
		content: ResumeContent
	}
	onSuccess?: (resumeId: string) => void
}

export function CreateResumeForm({ userId, initialData, onSuccess }: CreateResumeFormProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [resumeId, setResumeId] = useState<string | null>(null)
	const [isAutoSaving, setIsAutoSaving] = useState(false)

	const form = useForm({
		defaultValues: initialData || {
			content: {
				competencies: [],
				education: [],
				experience: [],
				headline: '',
				projects: [],
				skills: {
					soft: [],
					technical: [],
				},
				summary: '',
			},
		},
		mode: 'onChange',
		resolver: zodResolver(createResumeSchema),
	})

	const isSubmitPending = isPending || form.formState.isSubmitting

	const wizardSteps: WizardStep[] = useMemo(
		() => [
			{
				component: <ResumeInfoSection control={form.control} />,
				id: 'resume-info',
				label: 'Info',
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
				component: <ProjectsSection control={form.control} />,
				id: 'projects',
				label: 'Projects',
			},
			{
				component: <SkillsSection control={form.control} />,
				id: 'skills',
				label: 'Skills',
			},
		],
		[form.control],
	)

	// Validate each step independently
	const canAdvanceFromStep = (currentStep: number): boolean => {
		const formValues = form.getValues('content')

		switch (currentStep) {
			case 0: // Step 1 - Info
				return step1Schema.safeParse(formValues).success

			case 1: {
				// Step 2 - Experience
				const experiences = formValues.experience || []
				// Allow empty array or valid experiences
				if (experiences.length === 0) return true
				return step2Schema.safeParse({ experience: experiences }).success
			}

			case 2: {
				// Step 3 - Education
				const education = formValues.education || []
				// Allow empty array or valid education
				if (education.length === 0) return true
				return step3Schema.safeParse({ education }).success
			}

			case 3: {
				// Step 4 - Projects
				const projects = formValues.projects || []
				// Allow empty array or valid projects
				if (projects.length === 0) return true
				return step4Schema.safeParse({ projects }).success
			}

			case 4: // Step 5 - Skills (always valid, all optional)
				return true

			default:
				return true
		}
	}

	// Auto-save when navigating between steps
	const handleStepChange = async (newStep: number, oldStep: number) => {
		// Only save when advancing (not when going back)
		if (newStep <= oldStep) return

		setIsAutoSaving(true)

		try {
			const content = form.getValues('content')
			const result = await autoSaveResumeAction(userId, {
				content,
				resumeId: resumeId || undefined,
			})

			if (isSuccess(result)) {
				// Save resumeId after first creation
				if (!resumeId) {
					setResumeId(result.data.resumeId)
				}
				toast.success('Progresso salvo automaticamente')
			} else if (isFailure(result)) {
				toast.error('Erro ao salvar', {
					description: result.message,
				})
			}
		} catch (error) {
			console.error('Auto-save error:', error)
		} finally {
			setIsAutoSaving(false)
		}
	}

	const handleSubmit = (formData: CreateResumeData) => {
		form.clearErrors()

		startTransition(async () => {
			const result = await createResumeAction(userId, formData)

			// Handle failure
			if (isFailure(result)) {
				form.setError('root', {
					message: result.message,
				})

				toast.error(result.error || 'Ocorreu um erro', {
					description: result.message,
				})

				return
			}

			// Handle success
			if (isSuccess(result)) {
				toast.success('Resume criado com sucesso!')

				await sleep(1000)

				if (onSuccess) {
					onSuccess(result.data.resumeId)
				} else {
					router.push(`/dashboard/resumes/${result.data.resumeId}`)
				}
			}
		})
	}

	const handleComplete = () => {
		form.handleSubmit(handleSubmit)()
	}

	return (
		<Form {...form}>
			<div className="space-y-6">
				{form.formState.errors.root && (
					<Alert variant="destructive">
						<AlertDescription>{form.formState.errors.root.message}</AlertDescription>
					</Alert>
				)}

				<WizardWrapper
					canAdvanceFromStep={canAdvanceFromStep}
					isSubmitting={isSubmitPending || isAutoSaving}
					onBack={() => router.back()}
					onComplete={handleComplete}
					onStepChange={handleStepChange}
					steps={wizardSteps}
					storageKey={`resume-draft-${userId}`}
					submitLabel="Criar Resume"
				/>
			</div>
		</Form>
	)
}
