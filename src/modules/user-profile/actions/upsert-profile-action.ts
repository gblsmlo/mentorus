'use server'

import { handleAuthError } from '@shared/errors/error-handler'
import { failure, type Result, success } from '@shared/errors/result'
import { revalidatePath } from 'next/cache'
import { userProfileRepository } from '../repositories/user-profile-repository'
import { type UpsertProfileData, upsertProfileSchema } from '../schemas/profile-schemas'

type UpsertProfileOutput = {
	success: true
}

/**
 * Create or update user profile
 */
export const upsertProfileAction = async (
	userId: string,
	formData: UpsertProfileData,
): Promise<Result<UpsertProfileOutput>> => {
	// 1. Validate input
	const validatedFields = upsertProfileSchema.safeParse(formData)

	if (!validatedFields.success) {
		return failure({
			details: validatedFields.error.flatten().fieldErrors,
			error: 'Dados Inválidos',
			message: 'Por favor, corrija os campos destacados.',
			type: 'VALIDATION_ERROR',
		})
	}

	try {
		const { personalInfo, education, skills } = validatedFields.data

		// Upsert via repository
		await userProfileRepository.upsert(userId, {
			education,
			personalInfo,
			skills,
		})

		revalidatePath('/dashboard/profile')
		revalidatePath('/dashboard/settings')

		return success({ success: true })
	} catch (error) {
		return handleAuthError(error)
	}
}
