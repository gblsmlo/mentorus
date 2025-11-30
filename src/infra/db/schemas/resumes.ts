import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { user } from './user'

export const resumes = pgTable('resumes', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	title: text('title').notNull(),
	currentVersionId: uuid('current_version_id'), // Will reference resume_versions.id, but circular dependency needs care or just loose coupling
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
