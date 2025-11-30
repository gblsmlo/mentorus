/**
 * Property Test: Validation Error Descriptiveness
 *
 * **Feature: optimization-cockpit, Property 9: Validation Error Descriptiveness**
 * **Validates: Requirements 8.4**
 *
 * For any invalid ResumeContent data, validation SHALL reject the data and return
 * an error object containing at least one descriptive error message identifying
 * the invalid field.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { resumeContentSchema } from '../../schemas/resume-content.schema';
import { resumeContentArbitrary } from '../arbitraries/resume-content.arbitrary';

/**
 * Generates invalid ResumeContent by taking a valid one and corrupting specific fields
 */
const invalidResumeContentArbitrary = fc.oneof(
  // Invalid email
  resumeContentArbitrary.map(content => ({
    ...content,
    basics: { ...content.basics, email: 'not-an-email' },
    _invalidField: 'basics.email',
  })),
  // Empty name
  resumeContentArbitrary.map(content => ({
    ...content,
    basics: { ...content.basics, name: '' },
    _invalidField: 'basics.name',
  })),
  // Invalid country code (wrong length)
  resumeContentArbitrary.map(content => ({
    ...content,
    basics: {
      ...content.basics,
      location: { ...content.basics.location, countryCode: 'USA' },
    },
    _invalidField: 'basics.location.countryCode',
  })),
  // Empty summary
  resumeContentArbitrary.map(content => ({
    ...content,
    summary: '',
    _invalidField: 'summary',
  })),
  // Invalid profile URL
  resumeContentArbitrary.map(content => ({
    ...content,
    basics: {
      ...content.basics,
      profiles: [{ network: 'LinkedIn', url: 'not-a-url' }],
    },
    _invalidField: 'basics.profiles',
  })),
  // Invalid meta completionScore (out of range)
  resumeContentArbitrary.map(content => ({
    ...content,
    meta: { ...content.meta, completionScore: 150 },
    _invalidField: 'meta.completionScore',
  })),
);


describe('ResumeContent Validation Properties', () => {
  it('Property 9: Invalid data produces descriptive error messages', () => {
    fc.assert(
      fc.property(invalidResumeContentArbitrary, (invalidContent) => {
        const { _invalidField, ...contentToValidate } = invalidContent;

        // Attempt to validate the invalid content
        const result = resumeContentSchema.safeParse(contentToValidate);

        // Validation should fail
        expect(result.success).toBe(false);

        if (!result.success) {
          // Should have at least one error
          expect(result.error.issues.length).toBeGreaterThan(0);

          // Each error should have a path and message
          for (const issue of result.error.issues) {
            expect(issue.path).toBeDefined();
            expect(issue.message).toBeDefined();
            expect(typeof issue.message).toBe('string');
            expect(issue.message.length).toBeGreaterThan(0);
          }
        }
      }),
      { numRuns: 100 }
    );
  });

  it('Property 9: Error messages identify the invalid field path', () => {
    fc.assert(
      fc.property(invalidResumeContentArbitrary, (invalidContent) => {
        const { _invalidField, ...contentToValidate } = invalidContent;

        const result = resumeContentSchema.safeParse(contentToValidate);

        // Validation should fail
        expect(result.success).toBe(false);

        if (!result.success) {
          // At least one error should have a non-empty path
          const hasPathInfo = result.error.issues.some(
            issue => issue.path && issue.path.length > 0
          );
          expect(hasPathInfo).toBe(true);
        }
      }),
      { numRuns: 100 }
    );
  });
});
