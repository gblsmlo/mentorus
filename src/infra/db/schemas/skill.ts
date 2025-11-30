import { pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { user } from './user'

/**
 * Skill table - stores individual skills that can be reused across multiple resumes
 * Many-to-many relationship with resume table through resume_skill junction table
 */
export const skill = pgTable('skill', {
	category: text('category').notNull(), // 'technical' or 'soft'
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	name: text('name').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	...auditFields,
})
