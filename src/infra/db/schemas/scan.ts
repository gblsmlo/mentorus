import { jsonb, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { job } from './job'
import { resumeVersion } from './resume-version'
import { user } from './user'

export const scan = pgTable('scan', {
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	feedback: text('feedback'),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	jobId: text('job_id')
		.notNull()
		.references(() => job.id, { onDelete: 'cascade' }),
	matchedKeywords: jsonb('matched_keywords').notNull(),
	matchScore: numeric('match_score', { precision: 5, scale: 2 }).notNull(),
	missingKeywords: jsonb('missing_keywords').notNull(),
	resumeVersionId: text('resume_version_id')
		.notNull()
		.references(() => resumeVersion.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
})
