import { db } from '@/infra/db/client'
import { application } from '@/infra/db/schemas'
import { and, desc, eq } from 'drizzle-orm'

export class ApplicationRepository {
	async create(data: typeof application.$inferInsert) {
		const [created] = await db.insert(application).values(data).returning()
		return created
	}

	async findById(id: string) {
		return await db.query.application.findFirst({
			where: eq(application.id, id),
			with: {
				job: true,
				resume: true,
			},
		})
	}

	async findAllByUserId(userId: string) {
		return await db.query.application.findMany({
			orderBy: [desc(application.updatedAt)],
			where: eq(application.userId, userId),
			with: {
				job: true,
				resume: true,
			},
		})
	}

	async updateStatus(id: string, status: typeof application.$inferSelect.status) {
		const [updated] = await db
			.update(application)
			.set({ status })
			.where(eq(application.id, id))
			.returning()
		return updated
	}

	async updateResume(id: string, resumeId: string) {
		const [updated] = await db
			.update(application)
			.set({ resumeId })
			.where(eq(application.id, id))
			.returning()
		return updated
	}

	async updateMatchScore(id: string, matchScore: number) {
		const [updated] = await db
			.update(application)
			.set({ matchScore })
			.where(eq(application.id, id))
			.returning()
		return updated
	}
}

export const applicationRepository = new ApplicationRepository()
