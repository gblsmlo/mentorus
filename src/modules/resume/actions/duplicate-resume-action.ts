'use server'

import { handleAuthError } from '@shared/errors/error-handler'
import { failure, type Result, success } from '@shared/errors/result'
import { revalidatePath } from 'next/cache'
import { resumeRepository } from '../repositories/resume-repository'

type DuplicateResumeOutput = {
	resumeId: string
	versionId: string
	versionNumber: number
}

/**
 * Duplicate an existing resume (deep copy)
 * Creates a new resume with content from the source resume's latest version
 */
export const duplicateResumeAction = async (
	userId: string,
	sourceResumeId: string,
	newTitle: string,
): Promise<Result<DuplicateResumeOutput>> => {
	try {
		const result = await resumeRepository.duplicate(userId, sourceResumeId, newTitle)

		if (!result) {
			return failure({
				error: 'Resume não encontrado',
				message: 'Resume de origem não encontrado ou você não tem permissão para acessá-lo.',
				type: 'NOT_FOUND_ERROR',
			})
		}

		revalidatePath('/dashboard/resumes')

		return success({
			resumeId: result.resume.id,
			versionId: result.version.id,
			versionNumber: result.version.versionNumber,
		})
	} catch (error) {
		return handleAuthError(error)
	}
}
