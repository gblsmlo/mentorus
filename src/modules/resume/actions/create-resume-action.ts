'use server'

import { getUserProfile } from '@modules/ats-analyzer/actions/profile-actions'
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
		const { title, content } = validatedFields.data

		// Get user's master profile to seed personal info
		const masterProfile = await getUserProfile(userId)

		// Merge master profile data with provided content
		const seededContent = {
			...content,
			education: content.education.length > 0 ? content.education : masterProfile?.education || [],
			skills: {
				soft: [...(masterProfile?.skills?.soft || []), ...content.skills.soft],
				technical: [...(masterProfile?.skills?.technical || []), ...content.skills.technical],
			},
		}

		const result = await resumeRepository.create(userId, {
			content: seededContent,
			title,
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
