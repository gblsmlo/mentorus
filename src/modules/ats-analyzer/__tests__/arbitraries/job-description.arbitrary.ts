/**
 * Arbitrary generators for job description and categorized keywords
 *
 * These generators create valid job-related data for property-based testing.
 */

import * as fc from 'fast-check';
import type { CategorizedKeyword } from '../../utils/score-calculator';

// Common hard skills for realistic test data
const HARD_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'react', 'vue', 'angular',
  'nodejs', 'express', 'nextjs', 'postgresql', 'mongodb', 'redis', 'aws',
  'docker', 'kubernetes', 'git', 'graphql', 'rest api', 'sql', 'nosql',
  'html', 'css', 'sass', 'webpack', 'vite', 'jest', 'cypress', 'terraform'
];

// Common soft skills
const SOFT_SKILLS = [
  'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
  'time management', 'adaptability', 'creativity', 'collaboration', 'attention to detail',
  'organization', 'initiative', 'flexibility', 'interpersonal skills', 'work ethic'
];

// General keywords that might appear in job descriptions
const GENERAL_KEYWORDS = [
  'agile', 'scrum', 'remote', 'hybrid', 'startup', 'enterprise', 'saas',
  'b2b', 'b2c', 'fintech', 'healthcare', 'ecommerce', 'mobile', 'web',
  'full stack', 'frontend', 'backend', 'devops', 'cloud', 'microservices'
];

/**
 * Generate a categorized keyword with specified category
 */
const categorizedKeywordArbitrary = (
  category: 'hard_skill' | 'soft_skill' | 'general',
  keywords: string[]
): fc.Arbitrary<CategorizedKeyword> =>
  fc.record({
    keyword: fc.constantFrom(...keywords),
    category: fc.constant(category),
    frequency: fc.integer({ min: 1, max: 5 }),
  });

/**
 * Generate a hard skill keyword
 */
export const hardSkillKeywordArbitrary: fc.Arbitrary<CategorizedKeyword> =
  categorizedKeywordArbitrary('hard_skill', HARD_SKILLS);

/**
 * Generate a soft skill keyword
 */
export const softSkillKeywordArbitrary: fc.Arbitrary<CategorizedKeyword> =
  categorizedKeywordArbitrary('soft_skill', SOFT_SKILLS);

/**
 * Generate a general keyword
 */
export const generalKeywordArbitrary: fc.Arbitrary<CategorizedKeyword> =
  categorizedKeywordArbitrary('general', GENERAL_KEYWORDS);

/**
 * Generate a list of categorized keywords (simulating extracted job keywords)
 */
export const jobKeywordsArbitrary: fc.Arbitrary<CategorizedKeyword[]> = fc.tuple(
  fc.array(hardSkillKeywordArbitrary, { minLength: 1, maxLength: 10 }),
  fc.array(softSkillKeywordArbitrary, { minLength: 0, maxLength: 5 }),
  fc.array(generalKeywordArbitrary, { minLength: 0, maxLength: 5 })
).map(([hard, soft, general]) => {
  // Deduplicate by keyword
  const seen = new Set<string>();
  const result: CategorizedKeyword[] = [];
  
  for (const kw of [...hard, ...soft, ...general]) {
    if (!seen.has(kw.keyword)) {
      seen.add(kw.keyword);
      result.push(kw);
    }
  }
  
  return result;
});

/**
 * Generate job keywords with guaranteed non-empty hard skills
 */
export const nonEmptyJobKeywordsArbitrary: fc.Arbitrary<CategorizedKeyword[]> = fc.tuple(
  fc.array(hardSkillKeywordArbitrary, { minLength: 1, maxLength: 10 }),
  fc.array(softSkillKeywordArbitrary, { minLength: 1, maxLength: 5 }),
  fc.array(generalKeywordArbitrary, { minLength: 0, maxLength: 5 })
).map(([hard, soft, general]) => {
  const seen = new Set<string>();
  const result: CategorizedKeyword[] = [];
  
  for (const kw of [...hard, ...soft, ...general]) {
    if (!seen.has(kw.keyword)) {
      seen.add(kw.keyword);
      result.push(kw);
    }
  }
  
  return result;
});

/**
 * Generate a job description text (for integration testing)
 */
export const jobDescriptionTextArbitrary: fc.Arbitrary<string> = fc.tuple(
  fc.constantFrom('Software Engineer', 'Frontend Developer', 'Full Stack Developer', 'Backend Engineer'),
  fc.array(fc.constantFrom(...HARD_SKILLS), { minLength: 3, maxLength: 8 }),
  fc.array(fc.constantFrom(...SOFT_SKILLS), { minLength: 1, maxLength: 3 }),
  fc.constantFrom('3+ years', '5+ years', '2+ years', '1+ years')
).map(([title, skills, softSkills, experience]) => {
  return `
    Job Title: ${title}
    
    We are looking for a talented ${title} with ${experience} of experience.
    
    Required Skills:
    ${skills.map(s => `- ${s}`).join('\n')}
    
    Soft Skills:
    ${softSkills.map(s => `- ${s}`).join('\n')}
    
    Join our team and work on exciting projects!
  `.trim();
});

// Export keyword lists for use in other tests
export { HARD_SKILLS, SOFT_SKILLS, GENERAL_KEYWORDS };
