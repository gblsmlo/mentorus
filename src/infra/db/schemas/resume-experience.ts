import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { experience } from './experience'
import { resume } from './resume'

/**
 * Junction table for many-to-many relationship between resume and experience
 * Allows multiple resumes to share the same experiences and vice versa
 */
export const resumeExperience = pgTable('resume_experience', {
	experienceId: text('experience_id')
		.notNull()
		.references(() => experience.id, { onDelete: 'cascade' }),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	order: integer('order').notNull().default(0), // For ordering experiences within a resume
	resumeId: text('resume_id')
		.notNull()
		.references(() => resume.id, { onDelete: 'cascade' }),
	...auditFields,
})
