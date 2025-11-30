import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { jobs } from './jobs'
import { resumeVersions } from './resume-versions'

export const scans = pgTable('scans', {
	id: uuid('id').primaryKey().defaultRandom(),
	resumeVersionId: uuid('resume_version_id')
		.notNull()
		.references(() => resumeVersions.id, { onDelete: 'cascade' }),
	jobId: uuid('job_id')
		.notNull()
		.references(() => jobs.id, { onDelete: 'cascade' }),
	matchScore: integer('match_score'), // 0-100
	analysisResult: jsonb('analysis_result'), // Detailed feedback, keywords found, etc.
	createdAt: timestamp('created_at').defaultNow().notNull(),
})
