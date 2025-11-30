'use client'

import { Form } from '@/components/ui/form'
import { Alert, AlertDescription } from '@components/ui/alert'
import { zodResolver } from '@hookform/resolvers/zod'
import type { WizardStep } from '@modules/ats-analyzer/types/wizard-types'
import { isFailure, isSuccess } from '@shared/errors/result'
import { sleep } from '@utils/sleep'
import { useRouter } from 'next/navigation'
import { useMemo, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { createResumeAction } from '../actions/create-resume-action'
import { EducationSection } from '../components/education-section'
import { ExperienceSection } from '../components/experience-section'
import { ProjectsSection } from '../components/projects-section'
import { ResumeInfoSection } from '../components/resume-info-section'
import { SkillsSection } from '../components/skills-section'
import { WizardWrapper } from '../components/wizard-wrapper'
import { type CreateResumeData, createResumeSchema, type ResumeContent } from '../schemas'

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

	const form = useForm({
		defaultValues: initialData || {
			content: {
				about: '',
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
			title: '',
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
				label: 'Resume Info',
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

	// Check if current step can advance (all required fields valid)
	const canAdvance = useMemo(() => {
		const errors = form.formState.errors
		const title = form.getValues('title')

		// Always require title (validated in Step 1 - Resume Info)
		if (!title || title.trim() === '') return false
		if (errors.title) return false

		// All other required validations are handled by the schema
		return true
	}, [form.formState.errors, form])

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
				{/* Root error display */}
				{form.formState.errors.root && (
					<Alert variant="destructive">
						<AlertDescription>{form.formState.errors.root.message}</AlertDescription>
					</Alert>
				)}

				<WizardWrapper
					canAdvance={canAdvance}
					isSubmitting={isSubmitPending}
					onBack={() => router.back()}
					onComplete={handleComplete}
					steps={wizardSteps}
					storageKey={`resume-draft-${userId}`}
					submitLabel="Criar Resume"
				/>
			</div>
		</Form>
	)
}
