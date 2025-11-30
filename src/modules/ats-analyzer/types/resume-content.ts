/**
 * ResumeContent Type Definitions
 *
 * The core data structure that drives the entire Optimization Cockpit system.
 * This interface must be used consistently across UI, validation, and storage.
 *
 * Requirements: 8.1, 8.2
 */

export interface ResumeLocation {
	city: string
	region?: string
	countryCode: string
}

export interface ResumeProfile {
	network: string // e.g., "LinkedIn", "GitHub"
	url: string
}

export interface ResumeBasics {
	name: string
	email: string
	phone?: string
	label?: string // Professional headline
	location: ResumeLocation
	profiles: ResumeProfile[]
}

export interface ResumeWorkExperience {
	id: string
	company: string
	position: string
	startDate: string // ISO date string
	endDate?: string
	isCurrent: boolean
	summary: string // Description used for keyword matching
}

export interface ResumeEducation {
	id: string
	institution: string
	area: string // Field of study
	studyType: string // e.g., "Bachelor", "Master"
	startDate: string
	endDate?: string
}

export interface ResumeHardSkill {
	name: string
	level?: string
}

export interface ResumeSkills {
	hard: ResumeHardSkill[] // High weight (60%)
	soft: string[] // Medium weight (30%)
	tools: string[] // Included in hard skills matching
}

export interface ResumeLanguage {
	language: string
	fluency: string // e.g., "Native", "Fluent", "Intermediate"
}

export interface ResumeMeta {
	template: string
	completionScore: number // 0-100
}

export interface ResumeContent {
	basics: ResumeBasics
	summary: string
	work: ResumeWorkExperience[]
	education: ResumeEducation[]
	skills: ResumeSkills
	languages: ResumeLanguage[]
	meta: ResumeMeta
}
