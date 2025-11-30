'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@components/ui/alert'
import { zodResolver } from '@hookform/resolvers/zod'
import type { WizardStep } from '@modules/ats-analyzer/types/wizard-types'
import { isFailure, isSuccess } from '@shared/errors/result'
import { sleep } from '@utils/sleep'
import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateResumeAction } from '../actions/update-resume-action'
import { EducationSection } from '../components/education-section'
import { ExperienceSection } from '../components/experience-section'
import { ProjectsSection } from '../components/projects-section'
import { ResumeInfoSection } from '../components/resume-info-section'
import { SkillsSection } from '../components/skills-section'
import { WizardWrapper } from '../components/wizard-wrapper'
import { createResumeSchema, type ResumeContent } from '../schemas'

interface UpdateResumeFormProps {
	userId: string
	resumeId: string
	initialData: {
		headline: string
		content: ResumeContent
	}
	onSuccess?: () => void
}

export function UpdateResumeForm({
	userId,
	resumeId,
	initialData,
	onSuccess,
}: UpdateResumeFormProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()
	const [commitMessage, setCommitMessage] = useState('')

	const form = useForm({
		defaultValues: {
			content: initialData.content,
			headline: initialData.headline,
		},
		mode: 'onChange',
		resolver: zodResolver(createResumeSchema),
	})

	const isSubmitPending = isPending || form.formState.isSubmitting

	// Define wizard steps
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

	// Check if current step can advance
	const canAdvance = useMemo(() => {
		const errors = form.formState.errors
		const headline = form.getValues('content.headline')

		if (!headline || headline.trim() === '') return false
		if (errors.content?.headline) return false

		return true
	}, [form.formState.errors, form])

	const handleSubmit = (formData: { title: string; content: ResumeContent }) => {
		form.clearErrors()

		startTransition(async () => {
			const result = await updateResumeAction(userId, {
				commitMessage: commitMessage || `Update: ${new Date().toLocaleString()}`,
				content: formData.content,
				resumeId,
			})

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
				toast.success('Resume atualizado com sucesso!', {
					description: 'Uma nova versão foi criada.',
				})

				await sleep(1000)

				if (onSuccess) {
					onSuccess()
				} else {
					router.refresh()
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
					storageKey={`resume-draft-${userId}-${resumeId}`}
					submitLabel="Salvar Nova Versão"
				/>

				{/* Commit message input */}
				<Card>
					<CardHeader>
						<CardTitle>Mensagem da Versão (Opcional)</CardTitle>
						<CardDescription>
							Descreva o que mudou nesta versão (como uma mensagem de commit do Git)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Input
							disabled={isSubmitPending}
							onChange={(e) => setCommitMessage(e.target.value)}
							placeholder="ex: Adicionei habilidades em React e projeto recente"
							value={commitMessage}
						/>
					</CardContent>
				</Card>
			</div>
		</Form>
	)
}
