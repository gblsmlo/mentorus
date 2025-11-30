'use server'

/**
 * ATS Analyzer Resume Actions
 *
 * This file re-exports resume actions from the canonical resume module
 * and adds ATS-specific functionality when needed.
 *
 * REFACTORED: Removed duplicate implementations to follow DRY principle.
 * All core resume operations now use the resume module as the single source of truth.
 */

import { resumeRepository } from '@/modules/resume/repositories/resume-repository'

/**
 * Get all resumes for a user
 * Re-exported from resume repository
 */
export async function getUserResumes(userId: string) {
	return await resumeRepository.findAllByUserId(userId)
}

/**
 * Get a single resume with its current version
 * Re-exported from resume repository
 */
export async function getResume(userId: string, resumeId: string) {
	return await resumeRepository.findById(resumeId, userId)
}
