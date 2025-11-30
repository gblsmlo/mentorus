import { boolean, jsonb, pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { user } from './user'

/**
 * Experience table - stores work experiences that can be reused across multiple resumes
 * Many-to-many relationship with resume table through resume_experience junction table
 */
export const experience = pgTable('experience', {
	bullets: jsonb('bullets').$type<string[]>().default([]),
	company: text('company').notNull(),
	current: boolean('current').default(false),
	description: text('description'),
	endDate: text('end_date'),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	startDate: text('start_date').notNull(),
	title: text('title').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	...auditFields,
})
