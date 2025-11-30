import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { education } from './education'
import { resume } from './resume'

/**
 * Junction table for many-to-many relationship between resume and education
 * Allows multiple resumes to share the same education records and vice versa
 */
export const resumeEducation = pgTable('resume_education', {
	educationId: text('education_id')
		.notNull()
		.references(() => education.id, { onDelete: 'cascade' }),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	order: integer('order').notNull().default(0), // For ordering education within a resume
	resumeId: text('resume_id')
		.notNull()
		.references(() => resume.id, { onDelete: 'cascade' }),
	...auditFields,
})
