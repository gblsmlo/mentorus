import { integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { job } from './job'
import { resume } from './resume'
import { user } from './user'

export const applicationStatusEnum = pgEnum('application_status', [
	'draft',
	'optimizing',
	'applied',
	'interviewing',
	'offer',
	'rejected',
])

export const application = pgTable('application', {
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	jobId: text('job_id')
		.notNull()
		.references(() => job.id, { onDelete: 'cascade' }),
	matchScore: integer('match_score'),
	notes: text('notes'),
	resumeId: text('resume_id')
		.notNull()
		.references(() => resume.id, { onDelete: 'cascade' }),
	status: applicationStatusEnum('status').default('draft').notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.$onUpdate(() => new Date())
		.notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
})
