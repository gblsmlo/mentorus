import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const jobs = pgTable('jobs', {
	id: uuid('id').primaryKey().defaultRandom(),
	title: text('title'),
	company: text('company'),
	description: text('description').notNull(), // The raw job description text
	sourceUrl: text('source_url'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
})
