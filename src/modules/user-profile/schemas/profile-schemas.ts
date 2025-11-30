import { VALIDATION_MESSAGES } from '@/shared/constants/validation-messages'
import { z } from 'zod'

// Personal Info Schemas
export const profileBasicInfoSchema = z.object({
	email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
	location: z.string().optional(),
	name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
	phone: z.string().optional(),
})

export const profileSocialInfoSchema = z.object({
	github: z.string().url(VALIDATION_MESSAGES.URL_INVALID).optional().or(z.literal('')),
	linkedin: z.string().url(VALIDATION_MESSAGES.URL_INVALID).optional().or(z.literal('')),
	website: z.string().url(VALIDATION_MESSAGES.URL_INVALID).optional().or(z.literal('')),
})

export const personalInfoSchema = profileBasicInfoSchema.merge(profileSocialInfoSchema)

// Education Schema (reused from resume)
export const educationItemSchema = z.object({
	degree: z.string().min(1, VALIDATION_MESSAGES.DEGREE_TYPE_REQUIRED),
	field: z.string().optional(),
	gpa: z.string().optional(),
	graduationDate: z.string().optional(),
	school: z.string().min(1, VALIDATION_MESSAGES.INSTITUTION_REQUIRED),
})

export const educationSchema = z.array(educationItemSchema).default([])

// Skills Schema
export const skillsSchema = z.object({
	certifications: z.array(z.string()).default([]),
	languages: z.array(z.string()).default([]),
	soft: z.array(z.string()).default([]),
	technical: z.array(z.string()).default([]),
})

// Complete Profile Schema
export const completeProfileSchema = z.object({
	education: educationSchema,
	personalInfo: personalInfoSchema,
	skills: skillsSchema,
})

export const upsertProfileSchema = completeProfileSchema

// Type Exports
export type ProfileBasicInfo = z.infer<typeof profileBasicInfoSchema>
export type ProfileSocialInfo = z.infer<typeof profileSocialInfoSchema>
export type PersonalInfo = z.infer<typeof personalInfoSchema>
export type EducationItem = z.infer<typeof educationItemSchema>
export type Skills = z.infer<typeof skillsSchema>
export type CompleteProfile = z.infer<typeof completeProfileSchema>
export type UpsertProfileData = z.infer<typeof upsertProfileSchema>
