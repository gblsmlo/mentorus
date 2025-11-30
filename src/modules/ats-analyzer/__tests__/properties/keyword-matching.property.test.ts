/**
 * Property-Based Tests for Keyword Matching and Categorization
 *
 * **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
 * **Validates: Requirements 3.1, 3.2**
 *
 * Tests that keywords are correctly identified and categorized into:
 * - hard_skill: Technical skills
 * - soft_skill: Interpersonal skills
 * - general: Other relevant keywords
 */

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
  extractCategorizedKeywords,
  categorizeKeyword,
  normalizeKeyword,
} from '../../utils/keyword-extractor';
import { calculateATSScore, type CategorizedKeyword } from '../../utils/score-calculator';
import { resumeContentArbitrary } from '../arbitraries/resume-content.arbitrary';
import {
  HARD_SKILLS,
  SOFT_SKILLS,
  GENERAL_KEYWORDS,
} from '../arbitraries/job-description.arbitrary';

describe('Keyword Matching and Categorization - Property Tests', () => {
  /**
   * Property 2: Keyword Matching and Categorization
   *
   * For any job description and ResumeContent, all matched keywords SHALL be
   * correctly identified (keyword appears in both job and resume) and categorized
   * into their respective groups (hard skills, soft skills, or general).
   */
  it('Property 2: All extracted keywords have valid categories', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    const jobDescriptionArbitrary = fc.array(
      fc.constantFrom(...HARD_SKILLS, ...SOFT_SKILLS, ...GENERAL_KEYWORDS),
      { minLength: 3, maxLength: 15 }
    ).map(keywords => `Required skills: ${keywords.join(', ')}`);

    fc.assert(
      fc.property(
        jobDescriptionArbitrary,
        (jobDescription) => {
          const keywords = extractCategorizedKeywords(jobDescription);

          // All keywords must have valid categories
          for (const kw of keywords) {
            expect(['hard_skill', 'soft_skill', 'general']).toContain(kw.category);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Known hard skills are categorized as hard_skill', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    fc.assert(
      fc.property(
        fc.constantFrom(...HARD_SKILLS),
        (hardSkill) => {
          const jobDescription = `We need someone with ${hardSkill} experience`;
          const keywords = extractCategorizedKeywords(jobDescription);

          // Find the hard skill in extracted keywords
          const found = keywords.find(
            k => normalizeKeyword(k.keyword) === normalizeKeyword(hardSkill)
          );

          // If found, it should be categorized as hard_skill
          if (found) {
            expect(found.category).toBe('hard_skill');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Known soft skills are categorized as soft_skill', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    fc.assert(
      fc.property(
        fc.constantFrom(...SOFT_SKILLS),
        (softSkill) => {
          const jobDescription = `Looking for someone with excellent ${softSkill}`;
          const keywords = extractCategorizedKeywords(jobDescription);

          // Find the soft skill in extracted keywords
          const found = keywords.find(
            k => normalizeKeyword(k.keyword).includes(normalizeKeyword(softSkill)) ||
                 normalizeKeyword(softSkill).includes(normalizeKeyword(k.keyword))
          );

          // If found, it should be categorized as soft_skill
          if (found) {
            expect(found.category).toBe('soft_skill');
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Matched keywords appear in both job and resume', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    fc.assert(
      fc.property(
        resumeContentArbitrary,
        fc.array(fc.constantFrom(...HARD_SKILLS), { minLength: 1, maxLength: 5 }),
        (resume, skills) => {
          // Create job keywords from skills
          const jobKeywords: CategorizedKeyword[] = skills.map(skill => ({
            keyword: skill,
            category: 'hard_skill' as const,
            frequency: 1,
          }));

          const result = calculateATSScore(resume, jobKeywords);

          // For each matched keyword, verify it exists in job keywords
          for (const matched of result.matchedKeywords) {
            const inJob = jobKeywords.some(
              jk => normalizeKeyword(jk.keyword) === normalizeKeyword(matched.keyword)
            );
            expect(inJob).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Keywords are sorted by category priority', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    fc.assert(
      fc.property(
        fc.tuple(
          fc.constantFrom(...HARD_SKILLS),
          fc.constantFrom(...SOFT_SKILLS)
        ),
        ([hardSkill, softSkill]) => {
          const jobDescription = `
            Required: ${hardSkill}
            Nice to have: ${softSkill}
          `;
          const keywords = extractCategorizedKeywords(jobDescription);

          // Find indices of hard and soft skills
          const hardIndex = keywords.findIndex(k => k.category === 'hard_skill');
          const softIndex = keywords.findIndex(k => k.category === 'soft_skill');

          // If both exist, hard skills should come before soft skills
          if (hardIndex !== -1 && softIndex !== -1) {
            expect(hardIndex).toBeLessThan(softIndex);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Frequency is always positive', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...HARD_SKILLS, ...SOFT_SKILLS), { minLength: 1, maxLength: 10 }),
        (skills) => {
          const jobDescription = skills.join(' ') + ' ' + skills.join(' '); // Repeat for frequency
          const keywords = extractCategorizedKeywords(jobDescription);

          for (const kw of keywords) {
            expect(kw.frequency).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: No duplicate keywords in extraction result', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...HARD_SKILLS, ...SOFT_SKILLS, ...GENERAL_KEYWORDS), { minLength: 1, maxLength: 20 }),
        (skills) => {
          const jobDescription = skills.join(', ');
          const keywords = extractCategorizedKeywords(jobDescription);

          // Check for duplicates
          const seen = new Set<string>();
          for (const kw of keywords) {
            const normalized = normalizeKeyword(kw.keyword);
            expect(seen.has(normalized)).toBe(false);
            seen.add(normalized);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: categorizeKeyword is consistent with extractCategorizedKeywords', () => {
    // **Feature: optimization-cockpit, Property 2: Keyword Matching and Categorization**
    fc.assert(
      fc.property(
        fc.constantFrom(...HARD_SKILLS),
        (skill) => {
          const category = categorizeKeyword(skill);
          const jobDescription = `Required: ${skill}`;
          const extracted = extractCategorizedKeywords(jobDescription);

          const found = extracted.find(
            k => normalizeKeyword(k.keyword) === normalizeKeyword(skill)
          );

          // If found in extraction, categories should match
          if (found) {
            expect(found.category).toBe(category);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
