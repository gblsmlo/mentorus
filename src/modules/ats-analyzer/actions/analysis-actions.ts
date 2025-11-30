'use server'

import { db } from '@/infra/db/client'
import { resumeVersion, scan } from '@/infra/db/schemas'
import { and, desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import type { ResumeContent } from '../schemas'
import { matchResumeToJob } from '../utils/resume-matcher'
import { getJob } from './job-actions'
import { getResumeVersion } from './resume-actions'

/**
 * Analyze a resume version against a job description
 */
export async function analyzeResume(userId: string, resumeVersionId: string, jobId: string) {
	// Get the resume version
	const version = await getResumeVersion(userId, resumeVersionId)
	const resumeContent = version.content as ResumeContent

	// Get the job
	const job = await getJob(userId, jobId)

	// Perform the analysis
	const matchResult = matchResumeToJob(resumeContent, job.description)

	// Store the scan results
	const [newScan] = await db
		.insert(scan)
		.values({
			feedback: matchResult.feedback,
			jobId,
			matchedKeywords: matchResult.matchedKeywords,
			matchScore: matchResult.matchScore.toString(),
			missingKeywords: matchResult.missingKeywords,
			resumeVersionId,
			userId,
		})
		.returning()

	revalidatePath(`/resumes/${version.resumeId}/analyze`)

	return {
		feedback: matchResult.feedback,
		matchedKeywords: matchResult.matchedKeywords,
		matchScore: matchResult.matchScore,
		missingKeywords: matchResult.missingKeywords,
		scanId: newScan.id,
	}
}

/**
 * Get scan history for a specific resume (all versions)
 */
export async function getScanHistory(userId: string, resumeId: string) {
	// Get all version IDs for this resume
	const versions = await db.query.resumeVersion.findMany({
		where: eq(resumeVersion.resumeId, resumeId),
	})

	const versionIds = versions.map((v) => v.id)

	// Get all scans for these versions
	const scans = await db.query.scan.findMany({
		orderBy: [desc(scan.createdAt)],
		where: and(eq(scan.userId, userId)),
	})

	// Filter scans that belong to this resume's versions
	const relevantScans = scans.filter((s) => versionIds.includes(s.resumeVersionId))

	// Enrich with version and job details
	const enrichedScans = await Promise.all(
		relevantScans.map(async (scanRecord) => {
			const version = versions.find((v) => v.id === scanRecord.resumeVersionId)
			const job = await db.query.job.findFirst({
				where: eq(scan.jobId, scanRecord.jobId),
			})

			return {
				...scanRecord,
				commitMessage: version?.commitMessage,
				jobCompany: job?.company,
				jobTitle: job?.title,
				versionNumber: version?.versionNumber,
			}
		}),
	)

	return enrichedScans
}

/**
 * Get a specific scan result
 */
export async function getScan(userId: string, scanId: string) {
	const scanRecord = await db.query.scan.findFirst({
		where: and(eq(scan.id, scanId), eq(scan.userId, userId)),
	})

	if (!scanRecord) {
		throw new Error('Scan not found or access denied')
	}

	// Get related data
	const version = await db.query.resumeVersion.findFirst({
		where: eq(resumeVersion.id, scanRecord.resumeVersionId),
	})

	const job = await db.query.job.findFirst({
		where: eq(scan.jobId, scanRecord.jobId),
	})

	return {
		...scanRecord,
		job,
		version,
	}
}

/**
 * Compare performance across versions for the same job
 */
export async function compareVersions(userId: string, resumeId: string, jobId: string) {
	// Verify job ownership
	await getJob(userId, jobId)

	// Get all versions
	const versions = await db.query.resumeVersion.findMany({
		orderBy: [desc(resumeVersion.versionNumber)],
		where: eq(resumeVersion.resumeId, resumeId),
	})

	// Get scans for each version with this job
	const comparisons = await Promise.all(
		versions.map(async (version) => {
			const scanRecord = await db.query.scan.findFirst({
				orderBy: [desc(scan.createdAt)], // Get latest scan if multiple
				where: and(
					eq(scan.userId, userId),
					eq(scan.resumeVersionId, version.id),
					eq(scan.jobId, jobId),
				),
			})

			return {
				commitMessage: version.commitMessage,
				createdAt: version.createdAt,
				matchScore: scanRecord ? Number.parseFloat(scanRecord.matchScore) : null,
				scanId: scanRecord?.id,
				versionId: version.id,
				versionNumber: version.versionNumber,
			}
		}),
	)

	return comparisons
}

/**
 * Delete a scan
 */
export async function deleteScan(userId: string, scanId: string) {
	// Verify ownership
	await getScan(userId, scanId)

	await db.delete(scan).where(eq(scan.id, scanId))

	revalidatePath('/resumes')

	return { success: true }
}
