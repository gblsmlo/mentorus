'use client'

import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { upsertUserProfile } from '../actions/profile-actions'
import { EducationSection } from './form-sections/education-section'
import { PersonalInfoSection } from './form-sections/personal-info-section'
import { SkillsSection } from './form-sections/skills-section'

const profileSchema = z.object({
	education: z.array(
		z.object({
			degree: z.string().min(1),
			field: z.string().optional(),
			gpa: z.string().optional(),
			graduationDate: z.string().optional(),
			school: z.string().min(1),
		}),
	),
	personalInfo: z.object({
		email: z.string().email('Invalid email'),
		github: z.string().url().optional().or(z.literal('')),
		linkedin: z.string().url().optional().or(z.literal('')),
		location: z.string().optional(),
		name: z.string().min(1, 'Name is required'),
		phone: z.string().optional(),
		website: z.string().url().optional().or(z.literal('')),
	}),
	skills: z.object({
		certifications: z.array(z.string()),
		languages: z.array(z.string()),
		soft: z.array(z.string()),
		technical: z.array(z.string()),
	}),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface ProfileFormProps {
	userId: string
	initialData?: {
		id?: string
		userId?: string
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
		}> | null
		skills?: {
			technical: string[]
			soft: string[]
			languages: string[]
			certifications: string[]
		} | null
		createdAt?: Date
		updatedAt?: Date
	} | null
}

export function ProfileForm({ userId, initialData }: ProfileFormProps) {
	const router = useRouter()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useForm<ProfileFormData>({
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
		resolver: zodResolver(profileSchema),
	})

	async function onSubmit(data: ProfileFormData) {
		setIsSubmitting(true)
		try {
			await upsertUserProfile(userId, data)
			toast.success('Profile updated successfully!')
			router.refresh()
		} catch (error) {
			toast.error('Failed to update profile', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<Form {...form}>
			<form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
				<PersonalInfoSection control={form.control} />
				<EducationSection control={form.control} />
				<SkillsSection control={form.control} />

				<div className="flex justify-end gap-4">
					<Button
						disabled={isSubmitting}
						onClick={() => router.back()}
						type="button"
						variant="outline"
					>
						Cancel
					</Button>
					<Button disabled={isSubmitting} type="submit">
						{isSubmitting ? 'Saving...' : 'Save Profile'}
					</Button>
				</div>
			</form>
		</Form>
	)
}
