import { VALIDATION_MESSAGES } from '@/shared/constants/validation-messages'
import { z } from 'zod'

/**
 * Canonical Resume Content Schema
 * This is the single source of truth for resume data structure.
 *
 * This schema supports two use cases:
 * 1. Simple resume creation (resume module) - uses headline, summary, competencies
 * 2. Full ATS optimization (ats-analyzer module) - uses complete structure
 *
 * @see .kiro/specs/optimization-cockpit/design.md
 */

// ============================================================================
// LEGACY SCHEMAS (for backward compatibility with existing resume module)
// ============================================================================

// Legacy Experience Schema (used by resume module)
export const legacyExperienceSchema = z.object({
	bullets: z.array(z.string()).default([]),
	company: z.string().min(1, VALIDATION_MESSAGES.COMPANY_REQUIRED),
	current: z.boolean().default(false),
	description: z.string().optional(),
	endDate: z.string().optional(),
	startDate: z.string().min(1, VALIDATION_MESSAGES.START_DATE_REQUIRED),
	title: z.string().min(1, VALIDATION_MESSAGES.JOB_TITLE_REQUIRED),
})

// Legacy Education Schema (used by resume module)
export const legacyEducationSchema = z.object({
	degree: z.string().min(1, VALIDATION_MESSAGES.DEGREE_TYPE_REQUIRED),
	field: z.string().optional(),
	gpa: z.string().optional(),
	graduationDate: z.string().optional(),
	school: z.string().min(1, VALIDATION_MESSAGES.INSTITUTION_REQUIRED),
})

// Legacy Project Schema (used by resume module)
export const legacyProjectSchema = z.object({
	description: z.string().optional(),
	name: z.string().min(1, VALIDATION_MESSAGES.PROJECT_NAME_REQUIRED),
	technologies: z.array(z.string()).default([]),
	url: z.string().url(VALIDATION_MESSAGES.URL_INVALID).optional().or(z.literal('')),
})

// Legacy Skills Schema (technical + soft)
export const legacySkillsSchema = z.object({
	soft: z.array(z.string()).default([]),
	technical: z.array(z.string()).default([]),
})

// ============================================================================
// NEW SCHEMAS (for Optimization Cockpit / ATS Analyzer)
// ============================================================================

// Location Schema
export const locationSchema = z.object({
	city: z.string().min(1, VALIDATION_MESSAGES.CITY_REQUIRED),
	countryCode: z.string().length(2, VALIDATION_MESSAGES.COUNTRY_CODE_INVALID),
	region: z.string().optional(),
})

// Profile/Social Links Schema
export const profileSchema = z.object({
	network: z.string().min(1, VALIDATION_MESSAGES.NETWORK_NAME_REQUIRED),
	url: z.string().url(VALIDATION_MESSAGES.URL_INVALID),
})

// Basics/Personal Info Schema
export const basicsSchema = z.object({
	email: z.string().email(VALIDATION_MESSAGES.EMAIL_INVALID),
	label: z.string().optional(), // Professional headline
	location: locationSchema,
	name: z.string().min(1, VALIDATION_MESSAGES.NAME_REQUIRED),
	phone: z.string().optional(),
	profiles: z.array(profileSchema).default([]),
})

// Work Experience Schema (new structure)
export const workSchema = z.object({
	company: z.string().min(1, VALIDATION_MESSAGES.COMPANY_REQUIRED),
	endDate: z.string().optional(),
	id: z.string().uuid(),
	isCurrent: z.boolean().default(false),
	position: z.string().min(1, VALIDATION_MESSAGES.POSITION_REQUIRED),
	startDate: z.string().min(1, VALIDATION_MESSAGES.START_DATE_REQUIRED),
	summary: z.string().min(1, VALIDATION_MESSAGES.DESCRIPTION_REQUIRED),
})

// Education Schema (new structure)
export const educationSchema = z.object({
	area: z.string().min(1, VALIDATION_MESSAGES.FIELD_OF_STUDY_REQUIRED),
	endDate: z.string().optional(),
	id: z.string().uuid(),
	institution: z.string().min(1, VALIDATION_MESSAGES.INSTITUTION_REQUIRED),
	startDate: z.string().min(1, VALIDATION_MESSAGES.START_DATE_REQUIRED),
	studyType: z.string().min(1, VALIDATION_MESSAGES.DEGREE_TYPE_REQUIRED),
})

// Hard Skill Schema (with optional level)
export const hardSkillSchema = z.object({
	level: z.string().optional(),
	name: z.string().min(1, VALIDATION_MESSAGES.SKILL_NAME_REQUIRED),
})

// Skills Schema - NEW STRUCTURE: hard, soft, and tools (replaces technical)
export const skillsSchema = z.object({
	hard: z.array(hardSkillSchema).default([]),
	soft: z.array(z.string()).default([]),
	tools: z.array(z.string()).default([]),
})

// Language Schema
export const languageSchema = z.object({
	fluency: z.string().min(1, VALIDATION_MESSAGES.FLUENCY_REQUIRED),
	language: z.string().min(1, VALIDATION_MESSAGES.LANGUAGE_REQUIRED),
})

// Meta Schema
export const metaSchema = z.object({
	completionScore: z.number().min(0).max(100).default(0),
	template: z.string().default('default'),
})

// ============================================================================
// UNIFIED RESUME CONTENT SCHEMA
// ============================================================================

/**
 * Complete Resume Content Schema
 * Supports both legacy (simple) and new (full) structures
 */
export const resumeContentSchema = z.object({
	// Optional fields for enhanced features
	about: z.string().optional(), // Used by ats-analyzer

	// New fields (for Optimization Cockpit)
	basics: basicsSchema.optional(),
	competencies: z.array(z.string()).optional().default([]),

	// Legacy arrays (for backward compatibility)
	education: z.array(legacyEducationSchema).default([]),
	experience: z.array(legacyExperienceSchema).default([]),
	// Core fields (always present)
	headline: z.string().min(1, VALIDATION_MESSAGES.HEADLINE_REQUIRED),
	languages: z.array(languageSchema).default([]),
	meta: metaSchema.optional(),
	projects: z.array(legacyProjectSchema).default([]),

	// Skills - supports both legacy and new structure
	skills: z.union([legacySkillsSchema, skillsSchema]).default({ hard: [], soft: [], tools: [] }),
	summary: z.string().optional(),
	work: z.array(workSchema).default([]),
})

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Legacy Types
export type LegacyExperience = z.infer<typeof legacyExperienceSchema>
export type LegacyEducation = z.infer<typeof legacyEducationSchema>
export type LegacyProject = z.infer<typeof legacyProjectSchema>
export type LegacySkills = z.infer<typeof legacySkillsSchema>

// New Types
export type Location = z.infer<typeof locationSchema>
export type Profile = z.infer<typeof profileSchema>
export type Basics = z.infer<typeof basicsSchema>
export type Work = z.infer<typeof workSchema>
export type Education = z.infer<typeof educationSchema>
export type HardSkill = z.infer<typeof hardSkillSchema>
export type Skills = z.infer<typeof skillsSchema>
export type Language = z.infer<typeof languageSchema>
export type Meta = z.infer<typeof metaSchema>

// Main Type
export type ResumeContent = z.infer<typeof resumeContentSchema>
