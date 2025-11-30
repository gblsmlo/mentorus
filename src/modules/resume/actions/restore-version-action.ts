'use server'

import { handleAuthError } from '@shared/errors/error-handler'
import { failure, type Result } from '@shared/errors/result'
import { resumeRepository } from '../repositories/resume-repository'
import type { ResumeContent } from '../schemas'
import { type RestoreVersionData, restoreVersionSchema } from '../schemas'
import { updateResumeAction } from './update-resume-action'

type RestoreVersionOutput = {
	versionId: string
	versionNumber: number
}

/**
 * Restore an old version (creates a new version with old content)
 */
export const restoreVersionAction = async (
	userId: string,
	formData: RestoreVersionData,
): Promise<Result<RestoreVersionOutput>> => {
	// 1. Validate input
	const validatedFields = restoreVersionSchema.safeParse(formData)

	if (!validatedFields.success) {
		return failure({
			details: validatedFields.error.flatten().fieldErrors,
			error: 'Dados Inválidos',
			message: 'Por favor, corrija os campos destacados.',
			type: 'VALIDATION_ERROR',
		})
	}

	try {
		const { sourceVersionId, resumeId, commitMessage } = validatedFields.data

		// Get the source version content
		const sourceVersion = await resumeRepository.getVersion(sourceVersionId, userId)

		if (!sourceVersion) {
			return failure({
				error: 'Versão não encontrada',
				message: 'Versão não encontrada ou você não tem permissão para acessá-la.',
				type: 'NOT_FOUND_ERROR',
			})
		}

		// Create a new version with the old content
		return await updateResumeAction(userId, {
			commitMessage,
			content: sourceVersion.content as ResumeContent,
			resumeId,
		})
	} catch (error) {
		return handleAuthError(error)
	}
}
