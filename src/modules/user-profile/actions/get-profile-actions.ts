'use server'

import { userProfileRepository } from '../repositories/user-profile-repository'

/**
 * Get user profile by user ID
 */
export async function getUserProfileAction(userId: string) {
	return await userProfileRepository.findByUserId(userId)
}

/**
 * Check if user has completed their profile
 */
export async function hasCompletedProfileAction(userId: string): Promise<boolean> {
	const profile = await userProfileRepository.findByUserId(userId)

	if (!profile) return false

	const hasName = !!profile.personalInfo.name && profile.personalInfo.name.length > 0
	const hasEmail = !!profile.personalInfo.email && profile.personalInfo.email.length > 0

	return hasName && hasEmail
}
