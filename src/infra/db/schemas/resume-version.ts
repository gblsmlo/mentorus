import { integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { resume } from './resume'

export const resumeVersion = pgTable('resume_version', {
	commitMessage: text('commit_message'),
	content: jsonb('content').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	resumeId: text('resume_id')
		.notNull()
		.references(() => resume.id, { onDelete: 'cascade' }),
	versionNumber: integer('version_number').notNull(),
})
