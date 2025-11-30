import { integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { resumes } from './resumes'

export const resumeVersions = pgTable('resume_versions', {
	id: uuid('id').primaryKey().defaultRandom(),
	resumeId: uuid('resume_id')
		.notNull()
		.references(() => resumes.id, { onDelete: 'cascade' }),
	versionNumber: integer('version_number').notNull(),
	content: jsonb('content').notNull(), // Stores the structured resume data
	commitMessage: text('commit_message'), // Optional description of changes
	createdAt: timestamp('created_at').defaultNow().notNull(),
})
