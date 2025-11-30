/**
 * Validation Messages Constants
 *
 * Single source of truth for all validation error messages.
 * Ensures consistency across the application.
 */

export const VALIDATION_MESSAGES = {
	CITY_REQUIRED: 'City is required',
	COMPANY_REQUIRED: 'Company is required',
	COUNTRY_CODE_INVALID: 'Country code must be 2 characters',
	DEGREE_TYPE_REQUIRED: 'Degree type is required',
	DESCRIPTION_REQUIRED: 'Description is required',
	// Email validation
	EMAIL_INVALID: 'Invalid email address',
	FIELD_OF_STUDY_REQUIRED: 'Field of study is required',
	FLUENCY_REQUIRED: 'Fluency level is required',
	HEADLINE_REQUIRED: 'Headline is required',
	INSTITUTION_REQUIRED: 'Institution is required',
	JOB_DESCRIPTION_MIN_LENGTH: 'Job description must be at least 10 characters',

	// Job-specific validations
	JOB_TITLE_REQUIRED: 'Job title is required',
	LANGUAGE_REQUIRED: 'Language is required',
	MAX_LENGTH: (field: string, max: number) => `${field} must be at most ${max} characters`,

	// String length validation
	MIN_LENGTH: (field: string, min: number) => `${field} must be at least ${min} characters`,

	// Specific field validations
	NAME_REQUIRED: 'Name is required',
	NETWORK_NAME_REQUIRED: 'Network name is required',
	POSITION_REQUIRED: 'Position is required',
	PROJECT_NAME_REQUIRED: 'Project name is required',

	// Required fields
	REQUIRED: (field: string) => `${field} is required`,
	SKILL_NAME_REQUIRED: 'Skill name is required',
	START_DATE_REQUIRED: 'Start date is required',
	SUMMARY_REQUIRED: 'Summary is required',

	// URL validation
	URL_INVALID: 'Invalid URL',
	URL_REQUIRED: 'URL is required',
} as const

/**
 * URL Validation Schema Helper
 *
 * Standardized URL validation that accepts:
 * - Valid URLs
 * - Empty string (for optional URLs)
 * - undefined (for optional URLs)
 */
export const URL_VALIDATION = {
	OPTIONAL: 'Invalid URL',
	REQUIRED: 'Must be a valid URL',
} as const
