import { integer, pgTable, text } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { auditFields } from '../helpers'
import { resume } from './resume'
import { skill } from './skill'

export const resumeSkill = pgTable('resume_skill', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),
	order: integer('order').notNull().default(0),
	resumeId: text('resume_id')
		.notNull()
		.references(() => resume.id, { onDelete: 'cascade' }),
	skillId: text('skill_id')
		.notNull()
		.references(() => skill.id, { onDelete: 'cascade' }),
	...auditFields,
})
