import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { uuidv7 } from 'uuidv7'
import { user } from './user'

/**
 * Master Profile - Single Source of Truth for user's static information
 * This data is used to seed new resumes, preventing data re-entry
 */
export const userProfile = pgTable('user_profile', {
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),

	// Default education list (can be overridden per resume)
	education: jsonb('education').default([]).$type<
		Array<{
			school: string
			degree: string
			field?: string
			graduationDate?: string
			gpa?: string
		}>
	>(),
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv7()),

	// Core personal information (reused across all resumes)
	personalInfo: jsonb('personal_info').notNull().$type<{
		name: string
		email: string
		phone?: string
		location?: string
		linkedin?: string
		github?: string
		website?: string
	}>(),

	// Default skills (can be extended per resume)
	skills: jsonb('skills')
		.default({
			certifications: [],
			languages: [],
			soft: [],
			technical: [],
		})
		.$type<{
			technical: string[]
			soft: string[]
			languages: string[]
			certifications: string[]
		}>(),
	updatedAt: timestamp('updated_at', { withTimezone: true })
		.$onUpdate(() => new Date())
		.notNull(),
	userId: text('user_id')
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: 'cascade' }),
})
