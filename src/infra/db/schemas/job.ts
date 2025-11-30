import { pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { user } from './user'

export const job = pgTable('job', {
	company: text('company'),
	description: text('description').notNull(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	title: text('title').notNull(),
	url: text('url'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	...auditFields,
})
