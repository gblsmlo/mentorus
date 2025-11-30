'use server'

import { authServer } from '@/infra/auth/server'
import { applicationRepository } from '@/modules/ats-analyzer/repositories/application-repository'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { z } from 'zod'

// Helper to get session
async function getSession() {
	return await authServer.api.getSession({
		headers: await headers(),
	})
}

const createApplicationSchema = z.object({
	jobId: z.string().uuid(),
	notes: z.string().optional(),
	resumeId: z.string().uuid(),
	status: z
		.enum(['draft', 'optimizing', 'applied', 'interviewing', 'offer', 'rejected'])
		.optional(),
})

const updateStatusSchema = z.object({
	applicationId: z.string().uuid(),
	status: z.enum(['draft', 'optimizing', 'applied', 'interviewing', 'offer', 'rejected']),
})

const switchResumeSchema = z.object({
	applicationId: z.string().uuid(),
	resumeId: z.string().uuid(),
})

const saveApplicationResumeSchema = z.object({
	applicationId: z.string().uuid(),
	content: z.any(), // ResumeContent
	title: z.string(),
})

export async function createApplication(data: z.infer<typeof createApplicationSchema>) {
	const session = await getSession()
	if (!session) {
		throw new Error('Unauthorized')
	}

	const validated = createApplicationSchema.parse(data)

	const newApplication = await applicationRepository.create({
		...validated,
		status: validated.status || 'draft',
		userId: session.user.id,
	})

	revalidatePath('/dashboard/applications')
	return newApplication
}

export async function updateApplicationStatus(data: z.infer<typeof updateStatusSchema>) {
	const session = await getSession()
	if (!session) {
		throw new Error('Unauthorized')
	}

	const validated = updateStatusSchema.parse(data)

	// Verify ownership (repository could handle this, but explicit check is good)
	const app = await applicationRepository.findById(validated.applicationId)
	if (!app || app.userId !== session.user.id) {
		throw new Error('Application not found or access denied')
	}

	const updated = await applicationRepository.updateStatus(
		validated.applicationId,
		validated.status,
	)

	revalidatePath('/dashboard/applications')
	revalidatePath(`/dashboard/applications/${validated.applicationId}`)
	return updated
}

export async function switchResumeForApplication(data: z.infer<typeof switchResumeSchema>) {
	const session = await getSession()
	if (!session) {
		throw new Error('Unauthorized')
	}

	const validated = switchResumeSchema.parse(data)

	const app = await applicationRepository.findById(validated.applicationId)
	if (!app || app.userId !== session.user.id) {
		throw new Error('Application not found or access denied')
	}

	const updated = await applicationRepository.updateResume(
		validated.applicationId,
		validated.resumeId,
	)

	revalidatePath(`/dashboard/applications/${validated.applicationId}`)
	return updated
}

export async function saveApplicationResume(data: z.infer<typeof saveApplicationResumeSchema>) {
	const session = await getSession()
	if (!session) {
		throw new Error('Unauthorized')
	}

	const validated = saveApplicationResumeSchema.parse(data)

	const app = await applicationRepository.findById(validated.applicationId)
	if (!app || app.userId !== session.user.id) {
		throw new Error('Application not found or access denied')
	}

	// Auto-Fork Logic:
	// Check if the current resume is used by other applications
	const appsUsingResume = await applicationRepository.findAllByUserId(session.user.id)
	const usageCount = appsUsingResume.filter((a) => a.resumeId === app.resumeId).length

	let targetResumeId = app.resumeId

	// If used by more than just this application (or if it's the first time and we want to be safe), fork it.
	if (usageCount > 1) {
		// Fork!
		const { duplicateResume } = await import('./resume-actions')
		const newTitle = `${validated.title} (for ${app.job.company || 'Job'})`
		const duplicated = await duplicateResume(session.user.id, app.resumeId, newTitle)

		// Link new resume to application
		await applicationRepository.updateResume(app.id, duplicated.resumeId)
		targetResumeId = duplicated.resumeId
	}

	// Update the target resume (whether original or forked)
	const { updateResume } = await import('./resume-actions')
	await updateResume(session.user.id, {
		commitMessage: `Optimization for ${app.job.company || 'Job'}`,
		content: validated.content,
		resumeId: targetResumeId,
	})

	revalidatePath(`/dashboard/applications/${app.id}`)
	return { resumeId: targetResumeId, success: true }
}
