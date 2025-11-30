/**
 * Arbitrary generators for ResumeContent property-based testing
 *
 * These generators create valid ResumeContent objects for use with fast-check.
 */

import * as fc from 'fast-check'
import type { ResumeContent } from '../../types/resume-content'

// Generate a valid UUID v4
const uuidArbitrary = fc.uuid()

// Generate a valid 2-character country code
const countryCodeArbitrary = fc.constantFrom(
	'US',
	'GB',
	'CA',
	'DE',
	'FR',
	'ES',
	'IT',
	'JP',
	'CN',
	'BR',
	'AU',
	'IN',
	'MX',
	'NL',
	'SE',
)

// Generate a valid email that passes Zod's email validation
const emailArbitrary = fc
	.tuple(
		fc
			.string({ maxLength: 10, minLength: 1, unit: 'grapheme' })
			.map((s) => s.replace(/[^a-z0-9]/gi, 'a').toLowerCase() || 'user'),
		fc.constantFrom('gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'company.org'),
	)
	.map(([local, domain]) => `${local}@${domain}`)

// Generate a valid URL
const urlArbitrary = fc.constantFrom(
	'https://linkedin.com/in/user',
	'https://github.com/user',
	'https://twitter.com/user',
	'https://example.com/portfolio',
)

// Generate a valid ISO date string (YYYY-MM-DD)
const dateStringArbitrary = fc
	.tuple(
		fc.integer({ max: 2030, min: 1950 }),
		fc.integer({ max: 12, min: 1 }),
		fc.integer({ max: 28, min: 1 }), // Use 28 to avoid invalid dates
	)
	.map(
		([year, month, day]) =>
			`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
	)

// Generate non-empty strings with alphanumeric characters
const nonEmptyStringArbitrary = (maxLength: number): fc.Arbitrary<string> =>
	fc
		.string({ maxLength, minLength: 1, unit: 'grapheme' })
		.map((s) => s.replace(/[^\w\s]/g, 'a').trim() || 'default')

// Location arbitrary
const locationArbitrary = fc.record({
	city: nonEmptyStringArbitrary(50),
	countryCode: countryCodeArbitrary,
	region: fc.option(nonEmptyStringArbitrary(50), { nil: undefined }),
})

// Profile arbitrary
const profileArbitrary = fc.record({
	network: fc.constantFrom('LinkedIn', 'GitHub', 'Twitter', 'Portfolio'),
	url: urlArbitrary,
})

// Basics arbitrary
const basicsArbitrary = fc.record({
	email: emailArbitrary,
	label: fc.option(nonEmptyStringArbitrary(100), { nil: undefined }),
	location: locationArbitrary,
	name: nonEmptyStringArbitrary(100),
	phone: fc.option(nonEmptyStringArbitrary(20), { nil: undefined }),
	profiles: fc.array(profileArbitrary, { maxLength: 3, minLength: 0 }),
})

// Work experience arbitrary
const workArbitrary = fc.record({
	company: nonEmptyStringArbitrary(100),
	endDate: fc.option(dateStringArbitrary, { nil: undefined }),
	id: uuidArbitrary,
	isCurrent: fc.boolean(),
	position: nonEmptyStringArbitrary(100),
	startDate: dateStringArbitrary,
	summary: nonEmptyStringArbitrary(500),
})

// Education arbitrary
const educationArbitrary = fc.record({
	area: nonEmptyStringArbitrary(100),
	endDate: fc.option(dateStringArbitrary, { nil: undefined }),
	id: uuidArbitrary,
	institution: nonEmptyStringArbitrary(100),
	startDate: dateStringArbitrary,
	studyType: fc.constantFrom('Bachelor', 'Master', 'PhD', 'Associate', 'Certificate'),
})

// Hard skill arbitrary
const hardSkillArbitrary = fc.record({
	level: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'), {
		nil: undefined,
	}),
	name: nonEmptyStringArbitrary(50),
})

// Skills arbitrary
const skillsArbitrary = fc.record({
	hard: fc.array(hardSkillArbitrary, { maxLength: 10, minLength: 0 }),
	soft: fc.array(nonEmptyStringArbitrary(50), { maxLength: 10, minLength: 0 }),
	tools: fc.array(nonEmptyStringArbitrary(50), { maxLength: 10, minLength: 0 }),
})

// Language arbitrary
const languageArbitrary = fc.record({
	fluency: fc.constantFrom('Native', 'Fluent', 'Intermediate', 'Basic'),
	language: fc.constantFrom('English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'),
})

// Meta arbitrary
const metaArbitrary = fc.record({
	completionScore: fc.integer({ max: 100, min: 0 }),
	template: fc.constantFrom('default', 'modern', 'classic', 'minimal'),
})

// Complete ResumeContent arbitrary
export const resumeContentArbitrary: fc.Arbitrary<ResumeContent> = fc.record({
	basics: basicsArbitrary,
	education: fc.array(educationArbitrary, { maxLength: 3, minLength: 0 }),
	languages: fc.array(languageArbitrary, { maxLength: 5, minLength: 0 }),
	meta: metaArbitrary,
	skills: skillsArbitrary,
	summary: nonEmptyStringArbitrary(500),
	work: fc.array(workArbitrary, { maxLength: 5, minLength: 0 }),
})

// Export individual arbitraries for reuse
export {
	basicsArbitrary,
	workArbitrary,
	educationArbitrary,
	skillsArbitrary,
	languageArbitrary,
	metaArbitrary,
	locationArbitrary,
	profileArbitrary,
	hardSkillArbitrary,
}
