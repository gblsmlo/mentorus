'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Spinner } from '@/components/ui/spiner'
import { Alert, AlertDescription } from '@components/ui/alert'
import { zodResolver } from '@hookform/resolvers/zod'
// Import form sections from resume module (they're shared)
import { EducationSection } from '@modules/resume/components/education-section'
import { SkillsSection } from '@modules/resume/components/skills-section'
import { isFailure, isSuccess } from '@shared/errors/result'
import { sleep } from '@utils/sleep'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { upsertProfileAction } from '../actions/upsert-profile-action'
// Import personal info section from user-profile
import { PersonalInfoSection } from '../components/personal-info-section'
import { type UpsertProfileData, upsertProfileSchema } from '../schemas/profile-schemas'

interface ProfileFormProps {
	userId: string
	initialData?: {
		personalInfo: {
			name: string
			email: string
			phone?: string
			location?: string
			linkedin?: string
			github?: string
			website?: string
		}
		education?: Array<{
			school: string
			degree: string
			field?: string
			graduationDate?: string
			gpa?: string
		}>
		skills?: {
			technical: string[]
			soft: string[]
			languages: string[]
			certifications: string[]
		}
	} | null
	onSuccess?: () => void
}

export function ProfileForm({ userId, initialData, onSuccess }: ProfileFormProps) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	const form = useForm<UpsertProfileData>({
		defaultValues: {
			education: initialData?.education || [],
			personalInfo: initialData?.personalInfo || {
				email: '',
				github: '',
				linkedin: '',
				location: '',
				name: '',
				phone: '',
				website: '',
			},
			skills: initialData?.skills || {
				certifications: [],
				languages: [],
				soft: [],
				technical: [],
			},
		},
		resolver: zodResolver(upsertProfileSchema),
	})

	const isSubmitPending = isPending || form.formState.isSubmitting

	const handleSubmit = (formData: UpsertProfileData) => {
		form.clearErrors()

		startTransition(async () => {
			const result = await upsertProfileAction(userId, formData)

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
				toast.success('Perfil atualizado com sucesso!')

				await sleep(1000)

				if (onSuccess) {
					onSuccess()
				} else {
					router.refresh()
				}
			}
		})
	}

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
				{/* Root error display */}
				{form.formState.errors.root && (
					<Alert variant="destructive">
						<AlertDescription>{form.formState.errors.root.message}</AlertDescription>
					</Alert>
				)}

				<PersonalInfoSection control={form.control} />
				<EducationSection control={form.control} />
				<SkillsSection control={form.control} />

				<div className="flex justify-end gap-4">
					<Button
						disabled={isSubmitPending}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						Cancelar
					</Button>
					<Button disabled={isSubmitPending} type="submit">
						{isSubmitPending && <Spinner />}
						{isSubmitPending ? 'Salvando...' : 'Salvar Perfil'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
