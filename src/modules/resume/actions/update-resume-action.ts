'use server'

import { handleAuthError } from '@shared/errors/error-handler'
import { failure, type Result, success } from '@shared/errors/result'
import { revalidatePath } from 'next/cache'
import { resumeRepository } from '../repositories/resume-repository'
import { type UpdateResumeData, updateResumeSchema } from '../schemas'

type UpdateResumeOutput = {
	versionId: string
	versionNumber: number
}

/**
 * Update a resume by creating a new version (append-only)
 */
export const updateResumeAction = async (
	userId: string,
	formData: UpdateResumeData,
): Promise<Result<UpdateResumeOutput>> => {
	// 1. Validate input
	const validatedFields = updateResumeSchema.safeParse(formData)

	if (!validatedFields.success) {
		return failure({
			details: validatedFields.error.flatten().fieldErrors,
			error: 'Dados Inválidos',
			message: 'Por favor, corrija os campos destacados.',
			type: 'VALIDATION_ERROR',
		})
	}

	try {
		const { resumeId, content, commitMessage } = validatedFields.data

		// Update via repository (creates new version)
		const newVersion = await resumeRepository.update(resumeId, userId, content, commitMessage)

		if (!newVersion) {
			return failure({
				error: 'Resume não encontrado',
				message: 'Resume não encontrado ou você não tem permissão para acessá-lo.',
				type: 'NOT_FOUND_ERROR',
			})
		}

		revalidatePath('/dashboard/resumes')
		revalidatePath(`/dashboard/resumes/${resumeId}`)

		return success({
			versionId: newVersion.id,
			versionNumber: newVersion.versionNumber,
		})
	} catch (error) {
		return handleAuthError(error)
	}
}
