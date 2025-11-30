import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { project } from './project'
import { resume } from './resume'

/**
 * Junction table for many-to-many relationship between resume and project
 * Allows multiple resumes to share the same projects and vice versa
 */
export const resumeProject = pgTable('resume_project', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	order: integer('order').notNull().default(0), // For ordering projects within a resume
	projectId: text('project_id')
		.notNull()
		.references(() => project.id, { onDelete: 'cascade' }),
	resumeId: text('resume_id')
		.notNull()
		.references(() => resume.id, { onDelete: 'cascade' }),
	...auditFields,
})
