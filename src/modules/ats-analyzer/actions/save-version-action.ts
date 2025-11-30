'use server'

import { db } from '@/infra/db/client'
import { resume, resumeVersion } from '@/infra/db/schemas'
import { failure, success, type Result } from '@shared/errors/result'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { resumeContentSchema } from '../schemas/resume-content.schema'

/**
 * Schema for save version input
 */
export const saveVersionInputSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  content: resumeContentSchema,
  commitMessage: z.string().optional(),
  atsScore: z.number().min(0).max(100).optional(),
})

export type SaveVersionInput = z.infer<typeof saveVersionInputSchema>

export type SaveVersionOutput = {
  versionId: string
  versionNumber: number
  createdAt: Date
}

/**
 * Save a new version of a resume
 *
 * Requirements: 7.1, 7.2
 * - Validates content against Zod schema before persisting
 * - Increments version number (max existing + 1)
 * - Stores complete ResumeContent snapshot with optional commit message
 */
export async function saveVersionAction(
  userId: string,
  input: SaveVersionInput
): Promise<Result<SaveVersionOutput>> {
  // 1. Validate input against schema
  const validatedFields = saveVersionInputSchema.safeParse(input)

  if (!validatedFields.success) {
    return failure({
      type: 'VALIDATION_ERROR',
      message: 'Invalid resume content',
      error: 'Validation failed',
      details: validatedFields.error.format(),
    })
  }

  const { resumeId, content, commitMessage } = validatedFields.data

  try {
    // 2. Verify ownership of the resume
    const existingResume = await db.query.resume.findFirst({
      where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
    })

    if (!existingResume) {
      return failure({
        type: 'NOT_FOUND_ERROR',
        message: 'Resume not found or access denied',
        error: 'Resume not found',
      })
    }

    // 3. Get the latest version number for this resume
    const latestVersion = await db.query.resumeVersion.findFirst({
      orderBy: [desc(resumeVersion.versionNumber)],
      where: eq(resumeVersion.resumeId, resumeId),
    })

    // 4. Calculate next version number (max existing + 1)
    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

    // 5. Create new version with complete snapshot
    const [newVersion] = await db
      .insert(resumeVersion)
      .values({
        resumeId,
        versionNumber: nextVersionNumber,
        content,
        commitMessage: commitMessage || `Version ${nextVersionNumber}`,
      })
      .returning()

    // 6. Update resume to point to the new current version
    await db
      .update(resume)
      .set({ currentVersionId: newVersion.id })
      .where(eq(resume.id, resumeId))

    return success({
      versionId: newVersion.id,
      versionNumber: nextVersionNumber,
      createdAt: newVersion.createdAt,
    })
  } catch (error) {
    console.error('Save version error:', error)
    return failure({
      type: 'DATABASE_ERROR',
      message: 'Failed to save version',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get the next version number for a resume
 * Useful for displaying to users before they save
 */
export async function getNextVersionNumber(
  userId: string,
  resumeId: string
): Promise<Result<number>> {
  try {
    // Verify ownership
    const existingResume = await db.query.resume.findFirst({
      where: and(eq(resume.id, resumeId), eq(resume.userId, userId)),
    })

    if (!existingResume) {
      return failure({
        type: 'NOT_FOUND_ERROR',
        message: 'Resume not found or access denied',
        error: 'Resume not found',
      })
    }

    const latestVersion = await db.query.resumeVersion.findFirst({
      orderBy: [desc(resumeVersion.versionNumber)],
      where: eq(resumeVersion.resumeId, resumeId),
    })

    return success((latestVersion?.versionNumber ?? 0) + 1)
  } catch (error) {
    return failure({
      type: 'DATABASE_ERROR',
      message: 'Failed to get version number',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
