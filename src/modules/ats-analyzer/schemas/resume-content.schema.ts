/**
 * ResumeContent Zod Validation Schema
 *
 * Provides validation for the ResumeContent data structure used in the
 * Optimization Cockpit. This schema ensures data integrity across the application.
 *
 * Requirements: 8.1, 8.2, 8.4
 */

import { z } from 'zod'

// Location sub-schema
export const locationSchema = z.object({
	city: z.string().min(1, 'City is required'),
	countryCode: z.string().length(2, 'Country code must be 2 characters'),
	region: z.string().optional(),
})

// Profile sub-schema (LinkedIn, GitHub, etc.)
export const profileSchema = z.object({
	network: z.string().min(1, 'Network name is required'),
	url: z.string().url('Must be a valid URL'),
})

// Basics sub-schema
export const basicsSchema = z.object({
	email: z.string().email('Must be a valid email'),
	label: z.string().optional(),
	location: locationSchema,
	name: z.string().min(1, 'Name is required'),
	phone: z.string().optional(),
	profiles: z.array(profileSchema).default([]),
})

// Work experience sub-schema
export const workSchema = z.object({
	company: z.string().min(1, 'Company is required'),
	endDate: z.string().optional(),
	id: z.string().uuid(),
	isCurrent: z.boolean().default(false),
	position: z.string().min(1, 'Position is required'),
	startDate: z.string().min(1, 'Start date is required'),
	summary: z.string().min(1, 'Description is required'),
})

// Education sub-schema
export const educationSchema = z.object({
	area: z.string().min(1, 'Field of study is required'),
	endDate: z.string().optional(),
	id: z.string().uuid(),
	institution: z.string().min(1, 'Institution is required'),
	startDate: z.string().min(1, 'Start date is required'),
	studyType: z.string().min(1, 'Degree type is required'),
})

// Hard skill sub-schema
export const hardSkillSchema = z.object({
	level: z.string().optional(),
	name: z.string().min(1, 'Skill name is required'),
})

// Skills sub-schema (hard, soft, tools)
export const skillsSchema = z.object({
	hard: z.array(hardSkillSchema).default([]),
	soft: z.array(z.string()).default([]),
	tools: z.array(z.string()).default([]),
})

// Language sub-schema
export const languageSchema = z.object({
	fluency: z.string().min(1, 'Fluency level is required'),
	language: z.string().min(1, 'Language is required'),
})

// Meta sub-schema
export const metaSchema = z.object({
	completionScore: z.number().min(0).max(100).default(0),
	template: z.string().default('default'),
})

// Complete ResumeContent schema
export const resumeContentSchema = z.object({
	basics: basicsSchema,
	education: z.array(educationSchema).default([]),
	languages: z.array(languageSchema).default([]),
	meta: metaSchema,
	skills: skillsSchema,
	summary: z.string().min(1, 'Summary is required'),
	work: z.array(workSchema).default([]),
})

// Inferred type from schema
export type ResumeContentSchema = z.infer<typeof resumeContentSchema>

// Re-export individual schema types for convenience
export type LocationSchema = z.infer<typeof locationSchema>
export type ProfileSchema = z.infer<typeof profileSchema>
export type BasicsSchema = z.infer<typeof basicsSchema>
export type WorkSchema = z.infer<typeof workSchema>
export type EducationSchema = z.infer<typeof educationSchema>
export type HardSkillSchema = z.infer<typeof hardSkillSchema>
export type SkillsSchema = z.infer<typeof skillsSchema>
export type LanguageSchema = z.infer<typeof languageSchema>
export type MetaSchema = z.infer<typeof metaSchema>
