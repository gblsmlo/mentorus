import { pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { user } from './user'

export const resume = pgTable('resume', {
	competencies: text('competencies').array().default([]),
	currentVersionId: text('current_version_id'),
	headline: text('headline').notNull(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	status: text('status').notNull().default('draft'),
	summary: text('summary'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	...auditFields,
})
