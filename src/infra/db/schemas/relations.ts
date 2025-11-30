import { relations } from 'drizzle-orm'
import { application } from './application'
import { job } from './job'
import { resume } from './resume'
import { user } from './user'

export const applicationRelations = relations(application, ({ one }) => ({
	job: one(job, {
		fields: [application.jobId],
		references: [job.id],
	}),
	resume: one(resume, {
		fields: [application.resumeId],
		references: [resume.id],
	}),
	user: one(user, {
		fields: [application.userId],
		references: [user.id],
	}),
}))
