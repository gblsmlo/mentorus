import { jsonb, pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { user } from './user'

export const project = pgTable('project', {
	description: text('description'),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	name: text('name').notNull(),
	technologies: jsonb('technologies').$type<string[]>().default([]),
	url: text('url'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	...auditFields,
})
