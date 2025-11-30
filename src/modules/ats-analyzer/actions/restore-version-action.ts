'use server'

import { db } from '@/infra/db/client'
import { resume, resumeVersion } from '@/infra/db/schemas'
import { failure, success, type Result } from '@shared/errors/result'
import { and, desc, eq } from 'drizzle-orm'
import { z } from 'zod'
import type { ResumeContent } from '../types/resume-content'
import { resumeContentSchema } from '../schemas/resume-content.schema'

/**
 * Schema for restore version input
 */
export const restoreVersionInputSchema = z.object({
  resumeId: z.string().min(1, 'Resume ID is required'),
  sourceVersionId: z.string().min(1, 'Source version ID is required'),
  commitMessage: z.string().optional(),
})

export type RestoreVersionInput = z.infer<typeof restoreVersionInputSchema>

export type RestoreVersionOutput = {
  versionId: string
  versionNumber: number
  content: ResumeContent
  createdAt: Date
}

/**
 * Restore a previous version of a resume
 *
 * Requirements: 7.4
 * - Loads content from specified version
 * - Creates a new version with the restored content
 * - The restored version becomes the current version
 */
export async function restoreVersionAction(
  userId: string,
  input: RestoreVersionInput
): Promise<Result<RestoreVersionOutput>> {
  // 1. Validate input
  const validatedFields = restoreVersionInputSchema.safeParse(input)

  if (!validatedFields.success) {
    return failure({
      type: 'VALIDATION_ERROR',
      message: 'Invalid input',
      error: 'Validation failed',
      details: validatedFields.error.flatten().fieldErrors,
    })
  }

  const { resumeId, sourceVersionId, commitMessage } = validatedFields.data

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

    // 3. Get the source version to restore
    const sourceVersion = await db.query.resumeVersion.findFirst({
      where: and(
        eq(resumeVersion.id, sourceVersionId),
        eq(resumeVersion.resumeId, resumeId)
      ),
    })

    if (!sourceVersion) {
      return failure({
        type: 'NOT_FOUND_ERROR',
        message: 'Source version not found',
        error: 'Version not found',
      })
    }

    // 4. Validate the source content against schema
    const contentValidation = resumeContentSchema.safeParse(sourceVersion.content)
    if (!contentValidation.success) {
      return failure({
        type: 'VALIDATION_ERROR',
        message: 'Source version content is invalid',
        error: 'Content validation failed',
        details: contentValidation.error.flatten().fieldErrors,
      })
    }

    const restoredContent = contentValidation.data as ResumeContent

    // 5. Get the latest version number
    const latestVersion = await db.query.resumeVersion.findFirst({
      orderBy: [desc(resumeVersion.versionNumber)],
      where: eq(resumeVersion.resumeId, resumeId),
    })

    const nextVersionNumber = (latestVersion?.versionNumber ?? 0) + 1

    // 6. Create new version with restored content
    const defaultCommitMessage = `Restored from version ${sourceVersion.versionNumber}`
    const [newVersion] = await db
      .insert(resumeVersion)
      .values({
        resumeId,
        versionNumber: nextVersionNumber,
        content: restoredContent,
        commitMessage: commitMessage || defaultCommitMessage,
      })
      .returning()

    // 7. Update resume to point to the new current version
    await db
      .update(resume)
      .set({ currentVersionId: newVersion.id })
      .where(eq(resume.id, resumeId))

    return success({
      versionId: newVersion.id,
      versionNumber: nextVersionNumber,
      content: restoredContent,
      createdAt: newVersion.createdAt,
    })
  } catch (error) {
    console.error('Restore version error:', error)
    return failure({
      type: 'DATABASE_ERROR',
      message: 'Failed to restore version',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

/**
 * Get a specific version's content
 * Useful for previewing before restoring
 */
export async function getVersionContent(
  userId: string,
  resumeId: string,
  versionId: string
): Promise<Result<{ content: ResumeContent; versionNumber: number }>> {
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

    // Get the version
    const version = await db.query.resumeVersion.findFirst({
      where: and(
        eq(resumeVersion.id, versionId),
        eq(resumeVersion.resumeId, resumeId)
      ),
    })

    if (!version) {
      return failure({
        type: 'NOT_FOUND_ERROR',
        message: 'Version not found',
        error: 'Version not found',
      })
    }

    // Validate content
    const contentValidation = resumeContentSchema.safeParse(version.content)
    if (!contentValidation.success) {
      return failure({
        type: 'VALIDATION_ERROR',
        message: 'Version content is invalid',
        error: 'Content validation failed',
      })
    }

    return success({
      content: contentValidation.data as ResumeContent,
      versionNumber: version.versionNumber,
    })
  } catch (error) {
    return failure({
      type: 'DATABASE_ERROR',
      message: 'Failed to get version content',
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}
