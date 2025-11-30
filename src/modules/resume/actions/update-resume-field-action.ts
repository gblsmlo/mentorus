'use server'

import { failure, type Result, success } from '@/shared/errors/result'
import { revalidatePath } from 'next/cache'
import { resumeRepository } from '../repositories/resume-repository'
import type { ResumeContent } from '../schemas'

interface UpdateResumeFieldInput {
	resumeId: string
	userId: string
	field: keyof ResumeContent
	value: string | string[] | Record<string, unknown>
}

export async function updateResumeFieldAction(
	input: UpdateResumeFieldInput,
): Promise<Result<{ versionId: string; versionNumber: number }>> {
	try {
		// Verify ownership using findById
		const resume = await resumeRepository.findById(input.resumeId, input.userId)

		if (!resume) {
			return failure({
				error: 'Resume not found',
				message: 'Resume não encontrado',
				type: 'DATABASE_ERROR',
			})
		}

		// Get current content
		const currentContent = (resume.currentVersion?.content || {}) as ResumeContent

		// Update the specific field
		const updatedContent: ResumeContent = {
			...currentContent,
			[input.field]: input.value,
		}

		// Create new version with updated content using update method
		const newVersion = await resumeRepository.update(
			input.resumeId,
			input.userId,
			updatedContent,
			`Updated ${String(input.field)}`,
		)

		if (!newVersion) {
			return failure({
				error: 'Failed to update',
				message: 'Não foi possível atualizar o campo',
				type: 'DATABASE_ERROR',
			})
		}

		// Revalidate cache
		revalidatePath('/dashboard/resumes')
		revalidatePath(`/dashboard/resume/${input.resumeId}`)

		return success({
			versionId: newVersion.id,
			versionNumber: newVersion.versionNumber,
		})
	} catch (error) {
		console.error('Error updating resume field:', error)
		return failure({
			error: 'Update failed',
			message: 'Ocorreu um erro ao atualizar',
			type: 'DATABASE_ERROR',
		})
	}
}
