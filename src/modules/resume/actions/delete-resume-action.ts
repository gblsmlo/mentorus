'use server'

import { handleAuthError } from '@shared/errors/error-handler'
import { failure, type Result, success } from '@shared/errors/result'
import { revalidatePath } from 'next/cache'
import { resumeRepository } from '../repositories/resume-repository'

type DeleteResumeOutput = {
	success: true
}

/**
 * Delete a resume and all its versions
 */
export const deleteResumeAction = async (
	userId: string,
	resumeId: string,
): Promise<Result<DeleteResumeOutput>> => {
	try {
		const deleted = await resumeRepository.delete(resumeId, userId)

		if (!deleted) {
			return failure({
				error: 'Resume não encontrado',
				message: 'Resume não encontrado ou você não tem permissão para excluí-lo.',
				type: 'NOT_FOUND_ERROR',
			})
		}

		revalidatePath('/dashboard/resumes')

		return success({ success: true })
	} catch (error) {
		return handleAuthError(error)
	}
}
