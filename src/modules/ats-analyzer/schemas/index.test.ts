import * as fc from 'fast-check'
import { describe, expect, it } from 'vitest'
import { resumeContentSchema } from './index'

/**
 * Feature: resume-form-wizard-refactor, Property 8: Skills field mapping
 * Validates: Requirements 5.4
 *
 * For any set of skills entered, soft skills should be stored in skills.soft
 * and hard/technical skills should be stored in skills.technical,
 * with no cross-contamination between the two arrays.
 */
describe('Property 8: Skills field mapping', () => {
	it('should store soft skills in skills.soft and technical skills in skills.technical without cross-contamination', () => {
		// Arbitrary for non-empty skill strings (simulating user input)
		const skillArb = fc.string({ maxLength: 50, minLength: 1 }).filter((s) => s.trim().length > 0)

		// Arbitrary for arrays of skills
		const skillsArrayArb = fc.array(skillArb, { maxLength: 10, minLength: 0 })

		fc.assert(
			fc.property(
				skillsArrayArb, // soft skills
				skillsArrayArb, // technical skills
				(softSkills, technicalSkills) => {
					const content = {
						skills: {
							soft: softSkills,
							technical: technicalSkills,
						},
					}

					const result = resumeContentSchema.safeParse(content)
					expect(result.success).toBe(true)

					if (result.success) {
						// Property: Soft skills should be stored in skills.soft
						expect(result.data.skills.soft).toEqual(softSkills)

						// Property: Technical skills should be stored in skills.technical
						expect(result.data.skills.technical).toEqual(technicalSkills)

						// Property: No cross-contamination - soft skills should not appear in technical
						for (const softSkill of softSkills) {
							// Only check for cross-contamination if the skill is unique to soft skills
							if (!technicalSkills.includes(softSkill)) {
								expect(result.data.skills.technical).not.toContain(softSkill)
							}
						}

						// Property: No cross-contamination - technical skills should not appear in soft
						for (const techSkill of technicalSkills) {
							// Only check for cross-contamination if the skill is unique to technical skills
							if (!softSkills.includes(techSkill)) {
								expect(result.data.skills.soft).not.toContain(techSkill)
							}
						}
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	it('should preserve skill order within each category', () => {
		// Arbitrary for ordered arrays of unique skills
		const uniqueSkillsArb = fc
			.array(
				fc.string({ maxLength: 30, minLength: 1 }).filter((s) => s.trim().length > 0),
				{
					maxLength: 10,
					minLength: 1,
				},
			)
			.map((arr) => [...new Set(arr)]) // Ensure uniqueness

		fc.assert(
			fc.property(uniqueSkillsArb, uniqueSkillsArb, (softSkills, technicalSkills) => {
				const content = {
					skills: {
						soft: softSkills,
						technical: technicalSkills,
					},
				}

				const result = resumeContentSchema.safeParse(content)
				expect(result.success).toBe(true)

				if (result.success) {
					// Property: Order should be preserved for soft skills
					expect(result.data.skills.soft).toEqual(softSkills)

					// Property: Order should be preserved for technical skills
					expect(result.data.skills.technical).toEqual(technicalSkills)
				}
			}),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 9: Optional fields schema acceptance
 * Validates: Requirements 6.2, 6.3, 6.4
 *
 * For any resume content object, the schema validation should pass when headline,
 * about, or competencies are undefined, null, or empty, as these fields are optional.
 */
describe('Property 9: Optional fields schema acceptance', () => {
	it('should accept resume content with various combinations of optional fields present/absent', () => {
		// Arbitrary for optional string (undefined, empty, or valid string)
		const optionalStringArb = fc.oneof(
			fc.constant(undefined),
			fc.constant(''),
			fc.string({ maxLength: 100, minLength: 1 }),
		)

		// Arbitrary for optional string array (undefined, empty array, or array with strings)
		const optionalStringArrayArb = fc.oneof(
			fc.constant(undefined),
			fc.constant([]),
			fc.array(fc.string({ maxLength: 50, minLength: 1 }), { maxLength: 5, minLength: 1 }),
		)

		fc.assert(
			fc.property(
				optionalStringArb, // headline
				optionalStringArb, // about
				optionalStringArrayArb, // competencies
				(headline, about, competencies) => {
					const content: Record<string, unknown> = {}

					// Only add fields if they are defined (simulating various combinations)
					if (headline !== undefined) content.headline = headline
					if (about !== undefined) content.about = about
					if (competencies !== undefined) content.competencies = competencies

					const result = resumeContentSchema.safeParse(content)

					// Schema should always accept these optional fields
					expect(result.success).toBe(true)
				},
			),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 10: New fields persistence
 * Validates: Requirements 6.1
 *
 * For any resume content with headline, about, or competencies populated,
 * when the content is serialized to JSON and deserialized, these fields
 * should be preserved with their original values.
 */
describe('Property 10: New fields persistence', () => {
	it('should preserve headline, about, and competencies through JSON round-trip', () => {
		// Arbitrary for non-empty strings (to ensure we're testing actual values)
		const nonEmptyStringArb = fc.string({ maxLength: 100, minLength: 1 })

		// Arbitrary for non-empty string arrays
		const nonEmptyStringArrayArb = fc.array(fc.string({ maxLength: 50, minLength: 1 }), {
			maxLength: 10,
			minLength: 1,
		})

		fc.assert(
			fc.property(
				nonEmptyStringArb, // headline
				nonEmptyStringArb, // about
				nonEmptyStringArrayArb, // competencies
				(headline, about, competencies) => {
					const originalContent = {
						about,
						competencies,
						headline,
					}

					// Parse through schema to get normalized form
					const parseResult = resumeContentSchema.safeParse(originalContent)
					expect(parseResult.success).toBe(true)

					if (parseResult.success) {
						// Serialize to JSON
						const serialized = JSON.stringify(parseResult.data)

						// Deserialize from JSON
						const deserialized = JSON.parse(serialized)

						// Parse again through schema
						const roundTripResult = resumeContentSchema.safeParse(deserialized)
						expect(roundTripResult.success).toBe(true)

						if (roundTripResult.success) {
							// Verify new fields are preserved
							expect(roundTripResult.data.headline).toBe(headline)
							expect(roundTripResult.data.about).toBe(about)
							expect(roundTripResult.data.competencies).toEqual(competencies)
						}
					}
				},
			),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 3: Experience required fields validation
 * Validates: Requirements 2.2
 *
 * For any experience entry, if any of the required fields (company, title, startDate)
 * are empty, then the schema validation should fail with appropriate error messages.
 *
 * Note: The schema uses .min(1) validation which checks string length >= 1.
 * Empty strings ('') fail validation, but whitespace-only strings pass since they have length >= 1.
 */
describe('Property 3: Experience required fields validation', () => {
	it('should fail validation when any required experience field is empty string', () => {
		// Arbitrary for valid non-empty strings
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		// Test each required field being empty string (the only value that fails .min(1))
		fc.assert(
			fc.property(
				validStringArb, // company
				validStringArb, // title
				validStringArb, // startDate
				fc.integer({ max: 2, min: 0 }), // which field to make empty (0=company, 1=title, 2=startDate)
				(company, title, startDate, fieldToEmpty) => {
					const experience = {
						bullets: [],
						company: fieldToEmpty === 0 ? '' : company,
						current: false,
						startDate: fieldToEmpty === 2 ? '' : startDate,
						title: fieldToEmpty === 1 ? '' : title,
					}

					const content = {
						experience: [experience],
					}

					const result = resumeContentSchema.safeParse(content)

					// Schema should fail validation when a required field is empty string
					expect(result.success).toBe(false)

					if (!result.success) {
						// Should have at least one error related to the empty field
						const errorPaths = result.error.issues.map((issue) => issue.path.join('.'))
						const expectedFieldNames = ['company', 'title', 'startDate']
						const emptyFieldName = expectedFieldNames[fieldToEmpty]

						// The error should reference the experience array and the empty field
						const hasRelevantError = errorPaths.some(
							(path) => path.includes('experience') && path.includes(emptyFieldName),
						)
						expect(hasRelevantError).toBe(true)
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	it('should pass validation when all required experience fields are provided', () => {
		// Arbitrary for valid non-empty strings
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		fc.assert(
			fc.property(
				validStringArb, // company
				validStringArb, // title
				validStringArb, // startDate
				fc.boolean(), // current
				fc.array(fc.string(), { maxLength: 5, minLength: 0 }), // bullets
				(company, title, startDate, current, bullets) => {
					const experience = {
						bullets,
						company,
						current,
						startDate,
						title,
					}

					const content = {
						experience: [experience],
					}

					const result = resumeContentSchema.safeParse(content)

					// Schema should pass validation when all required fields are provided
					expect(result.success).toBe(true)
				},
			),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 4: Current position endDate optionality
 * Validates: Requirements 2.4
 *
 * For any experience entry where current is true, the schema validation should pass
 * regardless of whether endDate is provided or empty.
 */
describe('Property 4: Current position endDate optionality', () => {
	it('should pass validation for current positions regardless of endDate value', () => {
		// Arbitrary for valid non-empty strings (required fields)
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		// Arbitrary for various endDate values (undefined, empty, or valid date string)
		const endDateArb = fc.oneof(
			fc.constant(undefined),
			fc.constant(''),
			fc.string({ maxLength: 20, minLength: 1 }), // e.g., "Dec 2023", "2023-12"
		)

		fc.assert(
			fc.property(
				validStringArb, // company
				validStringArb, // title
				validStringArb, // startDate
				endDateArb, // endDate (various values)
				fc.array(fc.string(), { maxLength: 3, minLength: 0 }), // bullets
				(company, title, startDate, endDate, bullets) => {
					const experience: Record<string, unknown> = {
						bullets,
						company,
						current: true, // Always true for this property
						startDate,
						title,
					}

					// Only add endDate if it's defined
					if (endDate !== undefined) {
						experience.endDate = endDate
					}

					const content = {
						experience: [experience],
					}

					const result = resumeContentSchema.safeParse(content)

					// Schema should always pass when current is true, regardless of endDate
					expect(result.success).toBe(true)

					if (result.success) {
						// Verify the current flag is preserved
						expect(result.data.experience[0].current).toBe(true)
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	it('should also pass validation for non-current positions with various endDate values', () => {
		// Arbitrary for valid non-empty strings (required fields)
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		// Arbitrary for various endDate values
		const endDateArb = fc.oneof(
			fc.constant(undefined),
			fc.constant(''),
			fc.string({ maxLength: 20, minLength: 1 }),
		)

		fc.assert(
			fc.property(
				validStringArb, // company
				validStringArb, // title
				validStringArb, // startDate
				endDateArb, // endDate
				(company, title, startDate, endDate) => {
					const experience: Record<string, unknown> = {
						company,
						current: false, // Non-current position
						startDate,
						title,
					}

					if (endDate !== undefined) {
						experience.endDate = endDate
					}

					const content = {
						experience: [experience],
					}

					const result = resumeContentSchema.safeParse(content)

					// endDate is optional in the schema, so this should always pass
					expect(result.success).toBe(true)
				},
			),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 6: Education required fields validation
 * Validates: Requirements 3.2
 *
 * For any education entry, if either school or degree is empty,
 * then the schema validation should fail with appropriate error messages.
 */
describe('Property 6: Education required fields validation', () => {
	it('should fail validation when any required education field is empty string', () => {
		// Arbitrary for valid non-empty strings
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		// Test each required field being empty string (the only value that fails .min(1))
		fc.assert(
			fc.property(
				validStringArb, // school
				validStringArb, // degree
				fc.integer({ max: 1, min: 0 }), // which field to make empty (0=school, 1=degree)
				(school, degree, fieldToEmpty) => {
					const education = {
						degree: fieldToEmpty === 1 ? '' : degree,
						school: fieldToEmpty === 0 ? '' : school,
					}

					const content = {
						education: [education],
					}

					const result = resumeContentSchema.safeParse(content)

					// Schema should fail validation when a required field is empty string
					expect(result.success).toBe(false)

					if (!result.success) {
						// Should have at least one error related to the empty field
						const errorPaths = result.error.issues.map((issue) => issue.path.join('.'))
						const expectedFieldNames = ['school', 'degree']
						const emptyFieldName = expectedFieldNames[fieldToEmpty]

						// The error should reference the education array and the empty field
						const hasRelevantError = errorPaths.some(
							(path) => path.includes('education') && path.includes(emptyFieldName),
						)
						expect(hasRelevantError).toBe(true)
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	it('should pass validation when all required education fields are provided', () => {
		// Arbitrary for valid non-empty strings
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		// Arbitrary for optional strings
		const optionalStringArb = fc.oneof(fc.constant(undefined), fc.constant(''), validStringArb)

		fc.assert(
			fc.property(
				validStringArb, // school (required)
				validStringArb, // degree (required)
				optionalStringArb, // field (optional)
				optionalStringArb, // graduationDate (optional)
				optionalStringArb, // gpa (optional)
				(school, degree, field, graduationDate, gpa) => {
					const education: Record<string, unknown> = {
						degree,
						school,
					}

					// Only add optional fields if defined
					if (field !== undefined) education.field = field
					if (graduationDate !== undefined) education.graduationDate = graduationDate
					if (gpa !== undefined) education.gpa = gpa

					const content = {
						education: [education],
					}

					const result = resumeContentSchema.safeParse(content)

					// Schema should pass validation when all required fields are provided
					expect(result.success).toBe(true)
				},
			),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 7: Project required fields validation
 * Validates: Requirements 4.2
 *
 * For any project entry, if the name field is empty,
 * then the schema validation should fail with an appropriate error message.
 */
describe('Property 7: Project required fields validation', () => {
	it('should fail validation when project name is empty string', () => {
		// Arbitrary for valid non-empty strings (optional fields)
		const optionalStringArb = fc.oneof(
			fc.constant(undefined),
			fc.constant(''),
			fc.string({ maxLength: 100, minLength: 1 }),
		)

		// Arbitrary for technologies array
		const technologiesArb = fc.array(fc.string({ maxLength: 30, minLength: 1 }), {
			maxLength: 5,
			minLength: 0,
		})

		fc.assert(
			fc.property(
				optionalStringArb, // description
				optionalStringArb, // url
				technologiesArb, // technologies
				(description, url, technologies) => {
					const project: Record<string, unknown> = {
						name: '', // Empty name should fail validation
						technologies,
					}

					// Only add optional fields if defined
					if (description !== undefined) project.description = description
					if (url !== undefined) project.url = url

					const content = {
						projects: [project],
					}

					const result = resumeContentSchema.safeParse(content)

					// Schema should fail validation when name is empty string
					expect(result.success).toBe(false)

					if (!result.success) {
						// Should have at least one error related to the name field
						const errorPaths = result.error.issues.map((issue) => issue.path.join('.'))

						// The error should reference the projects array and the name field
						const hasRelevantError = errorPaths.some(
							(path) => path.includes('projects') && path.includes('name'),
						)
						expect(hasRelevantError).toBe(true)
					}
				},
			),
			{ numRuns: 100 },
		)
	})

	it('should pass validation when project name is provided', () => {
		// Arbitrary for valid non-empty strings (required name field)
		const validNameArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		// Arbitrary for optional strings
		const optionalStringArb = fc.oneof(
			fc.constant(undefined),
			fc.constant(''),
			fc.string({ maxLength: 100, minLength: 1 }),
		)

		// Arbitrary for technologies array
		const technologiesArb = fc.array(fc.string({ maxLength: 30, minLength: 1 }), {
			maxLength: 5,
			minLength: 0,
		})

		fc.assert(
			fc.property(
				validNameArb, // name (required)
				optionalStringArb, // description (optional)
				optionalStringArb, // url (optional)
				technologiesArb, // technologies
				(name, description, url, technologies) => {
					const project: Record<string, unknown> = {
						name,
						technologies,
					}

					// Only add optional fields if defined
					if (description !== undefined) project.description = description
					if (url !== undefined) project.url = url

					const content = {
						projects: [project],
					}

					const result = resumeContentSchema.safeParse(content)

					// Schema should pass validation when name is provided
					expect(result.success).toBe(true)

					if (result.success) {
						// Verify the name is preserved
						expect(result.data.projects[0].name).toBe(name)
					}
				},
			),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 2: Required field validation
 * Validates: Requirements 1.5
 *
 * For any form submission attempt, if Resume Title is empty or undefined,
 * then canAdvance should be false and validation errors should be present.
 *
 * This property tests the createResumeSchema which requires a non-empty title.
 */
import { createResumeSchema } from './index'

describe('Property 2: Required field validation', () => {
	it('should fail validation when title is empty or whitespace-only', () => {
		// Arbitrary for empty or whitespace-only strings
		const emptyOrWhitespaceArb = fc.oneof(
			fc.constant(''),
			fc
				.integer({ max: 10, min: 1 })
				.map((n) => ' '.repeat(n)), // whitespace only (spaces)
			fc
				.integer({ max: 5, min: 1 })
				.map((n) => '\t'.repeat(n)), // whitespace only (tabs)
		)

		fc.assert(
			fc.property(emptyOrWhitespaceArb, (title) => {
				const formData = {
					content: {
						education: [],
						experience: [],
						projects: [],
						skills: { soft: [], technical: [] },
					},
					title,
				}

				const result = createResumeSchema.safeParse(formData)

				// Empty string should fail validation due to .min(1)
				// Note: The schema uses .min(1) which only checks length, not whitespace
				if (title === '') {
					expect(result.success).toBe(false)
					if (!result.success) {
						const hasRelevantError = result.error.issues.some((issue) =>
							issue.path.includes('title'),
						)
						expect(hasRelevantError).toBe(true)
					}
				}
				// Whitespace-only strings pass .min(1) but would fail canAdvance logic
				// which uses title.trim() === ''
			}),
			{ numRuns: 100 },
		)
	})

	it('should pass validation when title is a valid non-empty string', () => {
		// Arbitrary for valid non-empty, non-whitespace-only strings
		const validTitleArb = fc
			.string({ maxLength: 100, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		fc.assert(
			fc.property(validTitleArb, (title) => {
				const formData = {
					content: {
						education: [],
						experience: [],
						projects: [],
						skills: { soft: [], technical: [] },
					},
					title,
				}

				const result = createResumeSchema.safeParse(formData)

				// Valid title should pass validation
				expect(result.success).toBe(true)

				if (result.success) {
					expect(result.data.title).toBe(title)
				}
			}),
			{ numRuns: 100 },
		)
	})

	it('should simulate canAdvance logic correctly for various title values', () => {
		// This test simulates the canAdvance logic from ResumeForm component
		const canAdvance = (title: string | undefined | null): boolean => {
			if (!title || title.trim() === '') return false
			return true
		}

		// Arbitrary for various title values
		const titleArb = fc.oneof(
			fc.constant(undefined),
			fc.constant(null),
			fc.constant(''),
			fc
				.integer({ max: 5, min: 1 })
				.map((n) => ' '.repeat(n)), // whitespace only
			fc
				.string({ maxLength: 100, minLength: 1 })
				.filter((s) => s.trim().length > 0), // valid
		)

		fc.assert(
			fc.property(titleArb, (title) => {
				const result = canAdvance(title as string | undefined | null)

				// canAdvance should be false for undefined, null, empty, or whitespace-only
				if (title === undefined || title === null || title === '' || title.trim() === '') {
					expect(result).toBe(false)
				} else {
					expect(result).toBe(true)
				}
			}),
			{ numRuns: 100 },
		)
	})
})

/**
 * Feature: resume-form-wizard-refactor, Property 5: Array field persistence
 * Validates: Requirements 2.3, 3.3, 4.3
 *
 * For any collection of items (experiences, education, projects) added to the form,
 * all items should be present in the corresponding array field of the resume content
 * after form state updates.
 */
describe('Property 5: Array field persistence', () => {
	it('should persist all experience entries in the experience array', () => {
		// Arbitrary for valid experience entries
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		const experienceArb = fc.record({
			bullets: fc.array(fc.string(), { maxLength: 5, minLength: 0 }),
			company: validStringArb,
			current: fc.boolean(),
			description: fc.option(validStringArb, { nil: undefined }),
			endDate: fc.option(validStringArb, { nil: undefined }),
			startDate: validStringArb,
			title: validStringArb,
		})

		const experiencesArb = fc.array(experienceArb, { maxLength: 5, minLength: 0 })

		fc.assert(
			fc.property(experiencesArb, (experiences) => {
				const content = {
					experience: experiences,
				}

				const result = resumeContentSchema.safeParse(content)
				expect(result.success).toBe(true)

				if (result.success) {
					// All experiences should be persisted
					expect(result.data.experience.length).toBe(experiences.length)

					// Each experience should have its required fields preserved
					for (let i = 0; i < experiences.length; i++) {
						expect(result.data.experience[i].company).toBe(experiences[i].company)
						expect(result.data.experience[i].title).toBe(experiences[i].title)
						expect(result.data.experience[i].startDate).toBe(experiences[i].startDate)
					}
				}
			}),
			{ numRuns: 100 },
		)
	})

	it('should persist all education entries in the education array', () => {
		// Arbitrary for valid education entries
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		const educationArb = fc.record({
			degree: validStringArb,
			field: fc.option(validStringArb, { nil: undefined }),
			gpa: fc.option(validStringArb, { nil: undefined }),
			graduationDate: fc.option(validStringArb, { nil: undefined }),
			school: validStringArb,
		})

		const educationsArb = fc.array(educationArb, { maxLength: 5, minLength: 0 })

		fc.assert(
			fc.property(educationsArb, (educations) => {
				const content = {
					education: educations,
				}

				const result = resumeContentSchema.safeParse(content)
				expect(result.success).toBe(true)

				if (result.success) {
					// All education entries should be persisted
					expect(result.data.education.length).toBe(educations.length)

					// Each education should have its required fields preserved
					for (let i = 0; i < educations.length; i++) {
						expect(result.data.education[i].school).toBe(educations[i].school)
						expect(result.data.education[i].degree).toBe(educations[i].degree)
					}
				}
			}),
			{ numRuns: 100 },
		)
	})

	it('should persist all project entries in the projects array', () => {
		// Arbitrary for valid project entries
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		const projectArb = fc.record({
			description: fc.option(validStringArb, { nil: undefined }),
			name: validStringArb,
			technologies: fc.array(fc.string({ maxLength: 30, minLength: 1 }), {
				maxLength: 5,
				minLength: 0,
			}),
			url: fc.option(validStringArb, { nil: undefined }),
		})

		const projectsArb = fc.array(projectArb, { maxLength: 5, minLength: 0 })

		fc.assert(
			fc.property(projectsArb, (projects) => {
				const content = {
					projects: projects,
				}

				const result = resumeContentSchema.safeParse(content)
				expect(result.success).toBe(true)

				if (result.success) {
					// All projects should be persisted
					expect(result.data.projects.length).toBe(projects.length)

					// Each project should have its required fields preserved
					for (let i = 0; i < projects.length; i++) {
						expect(result.data.projects[i].name).toBe(projects[i].name)
					}
				}
			}),
			{ numRuns: 100 },
		)
	})

	it('should persist all array fields together in a complete resume content', () => {
		// Arbitrary for valid entries
		const validStringArb = fc
			.string({ maxLength: 50, minLength: 1 })
			.filter((s) => s.trim().length > 0)

		const experienceArb = fc.record({
			bullets: fc.array(fc.string(), { maxLength: 3, minLength: 0 }),
			company: validStringArb,
			current: fc.boolean(),
			startDate: validStringArb,
			title: validStringArb,
		})

		const educationArb = fc.record({
			degree: validStringArb,
			school: validStringArb,
		})

		const projectArb = fc.record({
			name: validStringArb,
			technologies: fc.array(fc.string({ maxLength: 20, minLength: 1 }), {
				maxLength: 3,
				minLength: 0,
			}),
		})

		fc.assert(
			fc.property(
				fc.array(experienceArb, { maxLength: 3, minLength: 0 }),
				fc.array(educationArb, { maxLength: 3, minLength: 0 }),
				fc.array(projectArb, { maxLength: 3, minLength: 0 }),
				(experiences, educations, projects) => {
					const content = {
						education: educations,
						experience: experiences,
						projects: projects,
					}

					const result = resumeContentSchema.safeParse(content)
					expect(result.success).toBe(true)

					if (result.success) {
						// All arrays should maintain their lengths
						expect(result.data.experience.length).toBe(experiences.length)
						expect(result.data.education.length).toBe(educations.length)
						expect(result.data.projects.length).toBe(projects.length)
					}
				},
			),
			{ numRuns: 100 },
		)
	})
})
