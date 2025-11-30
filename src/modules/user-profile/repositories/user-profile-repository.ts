import { db } from '@infra/db/client'
import { userProfile } from '@infra/db/schemas'
import { eq } from 'drizzle-orm'

export class UserProfileRepository {
	async findByUserId(userId: string) {
		return await db.query.userProfile.findFirst({
			where: eq(userProfile.userId, userId),
		})
	}

	async create(data: typeof userProfile.$inferInsert) {
		const [created] = await db.insert(userProfile).values(data).returning()
		return created
	}

	async upsert(userId: string, data: Partial<typeof userProfile.$inferInsert>) {
		const existing = await this.findByUserId(userId)

		if (existing) {
			const [updated] = await db
				.update(userProfile)
				.set({
					...data,
					updatedAt: new Date(),
				})
				.where(eq(userProfile.userId, userId))
				.returning()
			return updated
		}

		return this.create({
			userId,
			...data,
		} as typeof userProfile.$inferInsert)
	}

	async updatePersonalInfo(
		userId: string,
		personalInfo: {
			name: string
			email: string
			phone?: string
			location?: string
			linkedin?: string
			github?: string
			website?: string
		},
	) {
		const [updated] = await db
			.update(userProfile)
			.set({
				personalInfo,
				updatedAt: new Date(),
			})
			.where(eq(userProfile.userId, userId))
			.returning()

		return updated
	}
}

export const userProfileRepository = new UserProfileRepository()
