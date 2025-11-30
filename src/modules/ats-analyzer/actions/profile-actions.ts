'use server'

import { db } from '@/infra/db/client'
import { userProfile } from '@/infra/db/schemas'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getUserProfile(userId: string) {
	const profile = await db.query.userProfile.findFirst({
		where: eq(userProfile.userId, userId),
	})

	return profile
}

export async function upsertUserProfile(
	userId: string,
	data: {
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
	},
) {
	const existing = await getUserProfile(userId)

	if (existing) {
		const [updated] = await db
			.update(userProfile)
			.set({
				education: data.education || existing.education,
				personalInfo: data.personalInfo,
				skills: data.skills || existing.skills,
			})
			.where(eq(userProfile.userId, userId))
			.returning()

		revalidatePath('/profile')
		return updated
	}
	// Create new profile
	const [created] = await db
		.insert(userProfile)
		.values({
			education: data.education || [],
			personalInfo: data.personalInfo,
			skills: data.skills || {
				certifications: [],
				languages: [],
				soft: [],
				technical: [],
			},
			userId,
		})
		.returning()

	revalidatePath('/profile')
	return created
}

export async function hasCompletedProfile(userId: string): Promise<boolean> {
	const profile = await getUserProfile(userId)

	if (!profile) return false

	const hasName = !!profile.personalInfo.name && profile.personalInfo.name.length > 0
	const hasEmail = !!profile.personalInfo.email && profile.personalInfo.email.length > 0

	return hasName && hasEmail
}
