'use server'

import { authServer } from '@infra/auth/server'
import { revalidatePath } from 'next/cache'
import { userProfileRepository } from '../repositories/user-profile-repository'
import { personalInfoSchema } from '../schemas/profile-schemas'

export async function getProfile() {
	const session = await authServer.api.getSession({
		headers: await import('next/headers').then((mod) => mod.headers()),
	})

	if (!session?.user?.id) {
		throw new Error('Unauthorized')
	}

	const profile = await userProfileRepository.findByUserId(session.user.id)

	// If no profile exists, return default structure with user info
	if (!profile) {
		return {
			education: [],
			personalInfo: {
				email: session.user.email,
				github: '',
				linkedin: '',
				location: '',
				name: session.user.name,
				phone: '',
				website: '',
			},
			skills: {
				certifications: [],
				languages: [],
				soft: [],
				technical: [],
			},
		}
	}

	return profile
}

export async function updateProfile(data: unknown) {
	// 1. Auth Check
	const session = await authServer.api.getSession({
		headers: await import('next/headers').then((mod) => mod.headers()),
	})

	if (!session?.user?.id) {
		throw new Error('Unauthorized')
	}

	// 2. Fetch existing profile to merge data
	const existingProfile = await userProfileRepository.findByUserId(session.user.id)
	const currentPersonalInfo = existingProfile?.personalInfo || {}

	// 3. Input Validation (allow partial updates)
	// We use personalInfoSchema but we need to handle the merge before validation if we want to validate the final state,
	// OR we validate the partial input against a partial schema.
	// Since personalInfoSchema has optional fields, it might pass, but we want to ensure we don't lose data.

	// Let's assume 'data' is a partial update. We merge it with current info.
	const mergedData = {
		...currentPersonalInfo,
		...(data as object),
	}

	const validated = personalInfoSchema.parse(mergedData)

	// 4. Update via Repository
	const result = await userProfileRepository.upsert(session.user.id, {
		personalInfo: validated,
	})

	// 5. Revalidate
	revalidatePath('/dashboard/settings/account/profile')

	return result
}
