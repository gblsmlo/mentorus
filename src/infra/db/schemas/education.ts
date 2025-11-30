import { pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { user } from './user'

/**
 * Education table - stores education records that can be reused across multiple resumes
 * Many-to-many relationship with resume table through resume_education junction table
 */
export const education = pgTable('education', {
	degree: text('degree').notNull(),
	field: text('field'),
	gpa: text('gpa'),
	graduationDate: text('graduation_date'),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	school: text('school').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	...auditFields,
})
