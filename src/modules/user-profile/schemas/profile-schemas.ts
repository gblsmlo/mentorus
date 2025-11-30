import { z } from 'zod'

export const profileBasicInfoSchema = z.object({
	email: z.string().email('Invalid email address'),
	location: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	phone: z.string().optional(),
})

export const profileSocialInfoSchema = z.object({
	github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
	linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
	website: z.string().url('Invalid website URL').optional().or(z.literal('')),
})

export const personalInfoSchema = profileBasicInfoSchema.merge(profileSocialInfoSchema)

export type ProfileBasicInfo = z.infer<typeof profileBasicInfoSchema>
export type ProfileSocialInfo = z.infer<typeof profileSocialInfoSchema>
export type PersonalInfo = z.infer<typeof personalInfoSchema>
