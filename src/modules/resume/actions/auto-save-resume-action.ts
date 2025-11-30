'use server'

import { failure, type Result, success } from '@shared/errors/result'
import { revalidatePath } from 'next/cache'
import { resumeRepository } from '../repositories/resume-repository'
import { type ResumeContent, resumeContentSchema } from '../schemas'

interface AutoSaveResumeInput {
	resumeId?: string // undefined = create new, string = update existing
	content: Partial<ResumeContent>
}

/**
 * Auto-save resume action - for wizard navigation
 * Creates resume on first step, updates on subsequent steps
 */
export async function autoSaveResumeAction(
	userId: string,
	data: AutoSaveResumeInput,
): Promise<Result<{ resumeId: string; versionId: string; versionNumber: number }>> {
	try {
		// If no resumeId, create new resume (Step 1 -> Step 2)
		if (!data.resumeId) {
			// Validate minimum required fields for creation
			if (!data.content.headline) {
				return failure({
					error: 'Headline é obrigatório',
					message: 'Por favor, forneça um headline para o resume',
					type: 'VALIDATION_ERROR',
				})
			}

			const result = await resumeRepository.create(userId, {
				competencies: data.content.competencies,
				headline: data.content.headline,
				summary: data.content.summary,
			})

			revalidatePath('/dashboard/resumes')

			return success({
				resumeId: result.resume.id,
				versionId: result.version.id,
				versionNumber: result.version.versionNumber,
			})
		}

		// Update existing resume
		const existing = await resumeRepository.findById(data.resumeId, userId)
		if (!existing) {
			return failure({
				error: 'Resume não encontrado',
				message: 'Resume não encontrado ou você não tem permissão para acessá-lo',
				type: 'NOT_FOUND_ERROR',
			})
		}

		// Merge with existing content
		const currentContent = (existing.currentVersion?.content as ResumeContent) || {}
		const mergedContent: ResumeContent = {
			competencies: data.content.competencies ?? currentContent.competencies ?? [],
			education: data.content.education ?? currentContent.education ?? [],
			experience: data.content.experience ?? currentContent.experience ?? [],
			headline: data.content.headline ?? currentContent.headline ?? '',
			projects: data.content.projects ?? currentContent.projects ?? [],
			skills: data.content.skills ?? currentContent.skills ?? { soft: [], technical: [] },
			summary: data.content.summary ?? currentContent.summary,
		}

		// Validate merged content
		const validationResult = resumeContentSchema.safeParse(mergedContent)
		if (!validationResult.success) {
			return failure({
				error: 'Dados inválidos',
				message: validationResult.error.message,
				type: 'VALIDATION_ERROR',
			})
		}

		// Create new version with auto-save message
		const newVersion = await resumeRepository.update(
			data.resumeId,
			userId,
			mergedContent,
			'Auto-save from wizard',
		)

		if (!newVersion) {
			return failure({
				error: 'Erro ao salvar resume',
				message: 'Não foi possível salvar o resume',
				type: 'DATABASE_ERROR',
			})
		}

		revalidatePath('/dashboard/resumes')
		revalidatePath(`/dashboard/resumes/${data.resumeId}`)

		return success({
			resumeId: data.resumeId,
			versionId: newVersion.id,
			versionNumber: newVersion.versionNumber,
		})
	} catch (error) {
		console.error('Error auto-saving resume:', error)
		return failure({
			error: 'Erro ao salvar resume',
			message: 'Ocorreu um erro inesperado',
			type: 'DATABASE_ERROR',
		})
	}
}
