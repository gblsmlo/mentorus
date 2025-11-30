'use server'

import { db } from '@/infra/db/client'
import { job } from '@/infra/db/schemas'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { jobInputSchema } from '../schemas'

/**
 * Save a job description for analysis
 */
export async function saveJob(userId: string, data: unknown) {
	const validated = jobInputSchema.parse(data)

	const [newJob] = await db
		.insert(job)
		.values({
			company: validated.company || null,
			description: validated.description,
			title: validated.title,
			url: validated.url || null,
			userId,
		})
		.returning()

	revalidatePath('/jobs')

	return newJob
}

/**
 * Get all jobs for a user
 */
export async function getUserJobs(userId: string) {
	const jobs = await db.query.job.findMany({
		orderBy: [desc(job.createdAt)],
		where: eq(job.userId, userId),
	})

	return jobs
}

/**
 * Get a single job
 */
export async function getJob(userId: string, jobId: string) {
	const existingJob = await db.query.job.findFirst({
		where: and(eq(job.id, jobId), eq(job.userId, userId)),
	})

	if (!existingJob) {
		throw new Error('Job not found or access denied')
	}

	return existingJob
}

/**
 * Update a job description
 */
export async function updateJob(userId: string, jobId: string, data: unknown) {
	const validated = jobInputSchema.parse(data)

	// Verify ownership
	const existingJob = await getJob(userId, jobId)

	const [updated] = await db
		.update(job)
		.set({
			company: validated.company || null,
			description: validated.description,
			title: validated.title,
			url: validated.url || null,
		})
		.where(eq(job.id, jobId))
		.returning()

	revalidatePath('/jobs')
	revalidatePath(`/jobs/${jobId}`)

	return updated
}

/**
 * Delete a job
 */
export async function deleteJob(userId: string, jobId: string) {
	// Verify ownership
	await getJob(userId, jobId)

	await db.delete(job).where(eq(job.id, jobId))

	revalidatePath('/jobs')

	return { success: true }
}
