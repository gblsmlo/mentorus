/**
 * Arbitrary generators for ResumeContent property-based testing
 *
 * These generators create valid ResumeContent objects for use with fast-check.
 */

import * as fc from 'fast-check';
import type { ResumeContent } from '../../types/resume-content';

// Generate a valid UUID v4
const uuidArbitrary = fc.uuid();

// Generate a valid 2-character country code
const countryCodeArbitrary = fc.constantFrom(
  'US', 'GB', 'CA', 'DE', 'FR', 'ES', 'IT', 'JP', 'CN', 'BR', 'AU', 'IN', 'MX', 'NL', 'SE'
);

// Generate a valid email that passes Zod's email validation
const emailArbitrary = fc.tuple(
  fc.string({ minLength: 1, maxLength: 10, unit: 'grapheme' }).map(s => s.replace(/[^a-z0-9]/gi, 'a').toLowerCase() || 'user'),
  fc.constantFrom('gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'company.org')
).map(([local, domain]) => `${local}@${domain}`);

// Generate a valid URL
const urlArbitrary = fc.constantFrom(
  'https://linkedin.com/in/user',
  'https://github.com/user',
  'https://twitter.com/user',
  'https://example.com/portfolio'
);

// Generate a valid ISO date string (YYYY-MM-DD)
const dateStringArbitrary = fc.tuple(
  fc.integer({ min: 1950, max: 2030 }),
  fc.integer({ min: 1, max: 12 }),
  fc.integer({ min: 1, max: 28 }) // Use 28 to avoid invalid dates
).map(([year, month, day]) => 
  `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
);

// Generate non-empty strings with alphanumeric characters
const nonEmptyStringArbitrary = (maxLength: number): fc.Arbitrary<string> =>
  fc.string({ minLength: 1, maxLength, unit: 'grapheme' })
    .map(s => s.replace(/[^\w\s]/g, 'a').trim() || 'default');

// Location arbitrary
const locationArbitrary = fc.record({
  city: nonEmptyStringArbitrary(50),
  region: fc.option(nonEmptyStringArbitrary(50), { nil: undefined }),
  countryCode: countryCodeArbitrary,
});


// Profile arbitrary
const profileArbitrary = fc.record({
  network: fc.constantFrom('LinkedIn', 'GitHub', 'Twitter', 'Portfolio'),
  url: urlArbitrary,
});

// Basics arbitrary
const basicsArbitrary = fc.record({
  name: nonEmptyStringArbitrary(100),
  email: emailArbitrary,
  phone: fc.option(nonEmptyStringArbitrary(20), { nil: undefined }),
  label: fc.option(nonEmptyStringArbitrary(100), { nil: undefined }),
  location: locationArbitrary,
  profiles: fc.array(profileArbitrary, { minLength: 0, maxLength: 3 }),
});

// Work experience arbitrary
const workArbitrary = fc.record({
  id: uuidArbitrary,
  company: nonEmptyStringArbitrary(100),
  position: nonEmptyStringArbitrary(100),
  startDate: dateStringArbitrary,
  endDate: fc.option(dateStringArbitrary, { nil: undefined }),
  isCurrent: fc.boolean(),
  summary: nonEmptyStringArbitrary(500),
});

// Education arbitrary
const educationArbitrary = fc.record({
  id: uuidArbitrary,
  institution: nonEmptyStringArbitrary(100),
  area: nonEmptyStringArbitrary(100),
  studyType: fc.constantFrom('Bachelor', 'Master', 'PhD', 'Associate', 'Certificate'),
  startDate: dateStringArbitrary,
  endDate: fc.option(dateStringArbitrary, { nil: undefined }),
});

// Hard skill arbitrary
const hardSkillArbitrary = fc.record({
  name: nonEmptyStringArbitrary(50),
  level: fc.option(fc.constantFrom('Beginner', 'Intermediate', 'Advanced', 'Expert'), { nil: undefined }),
});

// Skills arbitrary
const skillsArbitrary = fc.record({
  hard: fc.array(hardSkillArbitrary, { minLength: 0, maxLength: 10 }),
  soft: fc.array(nonEmptyStringArbitrary(50), { minLength: 0, maxLength: 10 }),
  tools: fc.array(nonEmptyStringArbitrary(50), { minLength: 0, maxLength: 10 }),
});

// Language arbitrary
const languageArbitrary = fc.record({
  language: fc.constantFrom('English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'),
  fluency: fc.constantFrom('Native', 'Fluent', 'Intermediate', 'Basic'),
});

// Meta arbitrary
const metaArbitrary = fc.record({
  template: fc.constantFrom('default', 'modern', 'classic', 'minimal'),
  completionScore: fc.integer({ min: 0, max: 100 }),
});

// Complete ResumeContent arbitrary
export const resumeContentArbitrary: fc.Arbitrary<ResumeContent> = fc.record({
  basics: basicsArbitrary,
  summary: nonEmptyStringArbitrary(500),
  work: fc.array(workArbitrary, { minLength: 0, maxLength: 5 }),
  education: fc.array(educationArbitrary, { minLength: 0, maxLength: 3 }),
  skills: skillsArbitrary,
  languages: fc.array(languageArbitrary, { minLength: 0, maxLength: 5 }),
  meta: metaArbitrary,
});

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
};
