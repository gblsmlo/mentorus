'use client'

import type { PersonalInfo } from '../schemas/profile-schemas'
import { ProfileBasicForm } from './profile-basic-form'
import { ProfileSocialForm } from './profile-social-form'

interface ProfileFormProps {
	initialData: PersonalInfo
}

export function ProfileForm({ initialData }: ProfileFormProps) {
	return (
		<div className="space-y-8">
			<ProfileBasicForm initialData={initialData} />
			<ProfileSocialForm initialData={initialData} />
		</div>
	)
}
