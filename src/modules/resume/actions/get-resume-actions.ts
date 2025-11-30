'use server'

import { resumeRepository } from '../repositories/resume-repository'

/**
 * Get all resumes for a user
 */
export async function getUserResumesAction(userId: string) {
	return await resumeRepository.findAllByUserId(userId)
}

/**
 * Get a single resume with its current version
 */
export async function getResumeAction(userId: string, resumeId: string) {
	return await resumeRepository.findById(resumeId, userId)
}

/**
 * Get all versions of a resume (history)
 */
export async function getResumeHistoryAction(userId: string, resumeId: string) {
	return await resumeRepository.getHistory(resumeId, userId)
}

/**
 * Get a specific resume version
 */
export async function getResumeVersionAction(userId: string, versionId: string) {
	return await resumeRepository.getVersion(versionId, userId)
}
