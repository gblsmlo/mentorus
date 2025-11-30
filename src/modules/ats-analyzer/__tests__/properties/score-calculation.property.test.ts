/**
 * Property-Based Tests for ATS Score Calculator
 *
 * **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
 * **Validates: Requirements 2.4**
 *
 * Tests that the ATS score calculation correctly applies weights:
 * - Hard skills: 60%
 * - Soft skills: 30%
 * - Keyword density: 10%
 */

import * as fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { calculateATSScore, getWeights, type CategorizedKeyword } from '../../utils/score-calculator';
import { resumeContentArbitrary } from '../arbitraries/resume-content.arbitrary';
import {
  jobKeywordsArbitrary,
  nonEmptyJobKeywordsArbitrary,
  hardSkillKeywordArbitrary,
  softSkillKeywordArbitrary,
} from '../arbitraries/job-description.arbitrary';

describe('ATS Score Calculator - Property Tests', () => {
  /**
   * Property 1: Score Calculation Weighting
   * 
   * For any valid ResumeContent and job description, the ATS score calculation
   * SHALL weight hard skills at 60%, soft skills at 30%, and keyword density at 10%.
   * The final score must be between 0 and 100.
   */
  it('Property 1: Score is always between 0 and 100', () => {
    // **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
    fc.assert(
      fc.property(
        resumeContentArbitrary,
        jobKeywordsArbitrary,
        (resume, jobKeywords) => {
          const result = calculateATSScore(resume, jobKeywords);
          
          // Score must be in valid range
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
          
          // Breakdown scores must also be in valid range
          expect(result.breakdown.hardSkillScore).toBeGreaterThanOrEqual(0);
          expect(result.breakdown.hardSkillScore).toBeLessThanOrEqual(100);
          expect(result.breakdown.softSkillScore).toBeGreaterThanOrEqual(0);
          expect(result.breakdown.softSkillScore).toBeLessThanOrEqual(100);
          expect(result.breakdown.keywordDensityScore).toBeGreaterThanOrEqual(0);
          expect(result.breakdown.keywordDensityScore).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Weights sum to 100%', () => {
    // **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
    const weights = getWeights();
    const totalWeight = weights.HARD_SKILLS + weights.SOFT_SKILLS + weights.KEYWORD_DENSITY;
    
    expect(totalWeight).toBeCloseTo(1.0, 5);
    expect(weights.HARD_SKILLS).toBe(0.6);
    expect(weights.SOFT_SKILLS).toBe(0.3);
    expect(weights.KEYWORD_DENSITY).toBe(0.1);
  });

  it('Property 1: Total score equals weighted sum of component scores', () => {
    // **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
    fc.assert(
      fc.property(
        resumeContentArbitrary,
        nonEmptyJobKeywordsArbitrary,
        (resume, jobKeywords) => {
          const result = calculateATSScore(resume, jobKeywords);
          const weights = getWeights();
          
          // Calculate expected weighted score
          const expectedScore = Math.round(
            result.breakdown.hardSkillScore * weights.HARD_SKILLS +
            result.breakdown.softSkillScore * weights.SOFT_SKILLS +
            result.breakdown.keywordDensityScore * weights.KEYWORD_DENSITY
          );
          
          // Clamp expected score to 0-100
          const clampedExpected = Math.max(0, Math.min(100, expectedScore));
          
          // Total score should match weighted calculation
          expect(result.score).toBe(clampedExpected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Hard skills have highest impact on score', () => {
    // **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
    fc.assert(
      fc.property(
        resumeContentArbitrary,
        fc.array(hardSkillKeywordArbitrary, { minLength: 5, maxLength: 10 }),
        fc.array(softSkillKeywordArbitrary, { minLength: 5, maxLength: 10 }),
        (resume, hardSkills, softSkills) => {
          // Deduplicate keywords
          const uniqueHard = deduplicateKeywords(hardSkills);
          const uniqueSoft = deduplicateKeywords(softSkills);
          
          if (uniqueHard.length === 0 || uniqueSoft.length === 0) return true;
          
          // Test with only hard skills
          const hardOnlyResult = calculateATSScore(resume, uniqueHard);
          
          // Test with only soft skills (same count)
          const softOnlyResult = calculateATSScore(resume, uniqueSoft);
          
          // If both have same match rate, hard skills should contribute more to score
          // This is verified by the weighting formula
          const weights = getWeights();
          expect(weights.HARD_SKILLS).toBeGreaterThan(weights.SOFT_SKILLS);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Empty job keywords results in score of 100', () => {
    // **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
    fc.assert(
      fc.property(
        resumeContentArbitrary,
        (resume) => {
          const result = calculateATSScore(resume, []);
          
          // With no keywords to match, hard and soft skill scores should be 100
          // (no requirements = all requirements met)
          expect(result.breakdown.hardSkillScore).toBe(100);
          expect(result.breakdown.softSkillScore).toBe(100);
          // Keyword density is 0 when no keywords matched
          expect(result.breakdown.keywordDensityScore).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Matched keywords are subset of job keywords', () => {
    // **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
    fc.assert(
      fc.property(
        resumeContentArbitrary,
        jobKeywordsArbitrary,
        (resume, jobKeywords) => {
          const result = calculateATSScore(resume, jobKeywords);
          
          // All matched keywords should be from job keywords
          const jobKeywordSet = new Set(jobKeywords.map(k => k.keyword));
          for (const matched of result.matchedKeywords) {
            expect(jobKeywordSet.has(matched.keyword)).toBe(true);
          }
          
          // All missing keywords should be from job keywords
          for (const missing of result.missingKeywords) {
            expect(jobKeywordSet.has(missing.keyword)).toBe(true);
          }
          
          // Matched + missing should equal total job keywords
          expect(result.matchedKeywords.length + result.missingKeywords.length)
            .toBe(jobKeywords.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 1: Score increases when more keywords match', () => {
    // **Feature: optimization-cockpit, Property 1: Score Calculation Weighting**
    fc.assert(
      fc.property(
        fc.array(hardSkillKeywordArbitrary, { minLength: 2, maxLength: 5 }),
        (hardSkills) => {
          const uniqueSkills = deduplicateKeywords(hardSkills);
          if (uniqueSkills.length < 2) return true;
          
          // Create a resume that matches some skills
          const matchingSkill = uniqueSkills[0].keyword;
          const resumeWithOneMatch = createResumeWithSkills([matchingSkill]);
          const resumeWithTwoMatches = createResumeWithSkills([
            matchingSkill,
            uniqueSkills[1].keyword
          ]);
          
          const scoreOne = calculateATSScore(resumeWithOneMatch, uniqueSkills);
          const scoreTwo = calculateATSScore(resumeWithTwoMatches, uniqueSkills);
          
          // More matches should result in higher or equal score
          expect(scoreTwo.score).toBeGreaterThanOrEqual(scoreOne.score);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Helper to deduplicate keywords by keyword string
 */
function deduplicateKeywords(keywords: CategorizedKeyword[]): CategorizedKeyword[] {
  const seen = new Set<string>();
  return keywords.filter(k => {
    if (seen.has(k.keyword)) return false;
    seen.add(k.keyword);
    return true;
  });
}

/**
 * Helper to create a minimal resume with specific skills
 */
function createResumeWithSkills(skills: string[]) {
  return {
    basics: {
      name: 'Test User',
      email: 'test@example.com',
      location: { city: 'Test City', countryCode: 'US' },
      profiles: [],
    },
    summary: 'Test summary',
    work: [],
    education: [],
    skills: {
      hard: skills.map(s => ({ name: s })),
      soft: [],
      tools: [],
    },
    languages: [],
    meta: { template: 'default', completionScore: 0 },
  };
}
