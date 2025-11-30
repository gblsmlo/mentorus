'use server'

import { handleAuthError } from '@shared/errors/error-handler'
import { failure, type Result, success } from '@shared/errors/result'
import { revalidatePath } from 'next/cache'
import { resumeRepository } from '../repositories/resume-repository'
import { type CreateResumeData, createResumeSchema } from '../schemas'

type CreateResumeOutput = {
	resumeId: string
	versionId: string
	versionNumber: number
}

export const createResumeAction = async (
	userId: string,
	formData: CreateResumeData,
): Promise<Result<CreateResumeOutput>> => {
	const validatedFields = createResumeSchema.safeParse(formData)

	if (!validatedFields.success) {
		return failure({
			details: validatedFields.error.flatten().fieldErrors,
			error: 'Dados Inválidos',
			message: 'Por favor, corrija os campos destacados.',
			type: 'VALIDATION_ERROR',
		})
	}

	try {
		const { content } = validatedFields.data

		const result = await resumeRepository.create(userId, {
			competencies: content.competencies,
			headline: content.headline,
			summary: content.summary,
		})

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
