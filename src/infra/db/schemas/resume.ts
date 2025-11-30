import { pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { user } from './user'

export const resume = pgTable('resume', {
	currentVersionId: text('current_version_id'),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	title: text('title').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	...auditFields,
})
