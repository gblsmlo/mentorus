/**
 * ATS Score Calculator
 *
 * Calculates ATS compatibility score using weighted algorithm:
 * - Hard skills: 60%
 * - Soft skills: 30%
 * - Keyword density: 10%
 *
 * Requirements: 2.4
 */

import type { ResumeContent } from '../types/resume-content';

export interface CategorizedKeyword {
  keyword: string;
  category: 'hard_skill' | 'soft_skill' | 'general';
  frequency: number;
}

export interface ScoreBreakdown {
  hardSkillScore: number;
  softSkillScore: number;
  keywordDensityScore: number;
  totalScore: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  matchedKeywords: CategorizedKeyword[];
  missingKeywords: CategorizedKeyword[];
}

// Weights as specified in requirements
const WEIGHTS = {
  HARD_SKILLS: 0.6,
  SOFT_SKILLS: 0.3,
  KEYWORD_DENSITY: 0.1,
} as const;

/**
 * Calculate ATS score for a resume against a job description
 *
 * @param resume - The resume content to analyze
 * @param jobKeywords - Categorized keywords extracted from job description
 * @returns Score result with breakdown and matched/missing keywords
 */
export function calculateATSScore(
  resume: ResumeContent,
  jobKeywords: CategorizedKeyword[]
): ScoreResult {
  // Extract resume text for keyword matching
  const resumeText = extractResumeText(resume);
  const resumeKeywords = extractResumeKeywords(resume);

  // Separate job keywords by category
  const hardSkillKeywords = jobKeywords.filter(k => k.category === 'hard_skill');
  const softSkillKeywords = jobKeywords.filter(k => k.category === 'soft_skill');
  const generalKeywords = jobKeywords.filter(k => k.category === 'general');

  // Calculate matches for each category
  const hardSkillMatches = findMatches(hardSkillKeywords, resumeKeywords, resumeText);
  const softSkillMatches = findMatches(softSkillKeywords, resumeKeywords, resumeText);
  const generalMatches = findMatches(generalKeywords, resumeKeywords, resumeText);

  // Calculate individual scores (0-100)
  const hardSkillScore = calculateCategoryScore(hardSkillKeywords, hardSkillMatches.matched);
  const softSkillScore = calculateCategoryScore(softSkillKeywords, softSkillMatches.matched);
  const keywordDensityScore = calculateKeywordDensityScore(
    [...hardSkillMatches.matched, ...softSkillMatches.matched, ...generalMatches.matched],
    resumeText
  );

  // Calculate weighted total score
  const totalScore = Math.round(
    hardSkillScore * WEIGHTS.HARD_SKILLS +
    softSkillScore * WEIGHTS.SOFT_SKILLS +
    keywordDensityScore * WEIGHTS.KEYWORD_DENSITY
  );

  // Clamp to 0-100 range
  const clampedScore = Math.max(0, Math.min(100, totalScore));

  // Combine all matched and missing keywords
  const matchedKeywords = [
    ...hardSkillMatches.matched,
    ...softSkillMatches.matched,
    ...generalMatches.matched,
  ];

  const missingKeywords = [
    ...hardSkillMatches.missing,
    ...softSkillMatches.missing,
    ...generalMatches.missing,
  ];

  return {
    score: clampedScore,
    breakdown: {
      hardSkillScore: Math.round(hardSkillScore),
      softSkillScore: Math.round(softSkillScore),
      keywordDensityScore: Math.round(keywordDensityScore),
      totalScore: clampedScore,
    },
    matchedKeywords,
    missingKeywords,
  };
}

/**
 * Extract all text from resume for keyword matching
 */
function extractResumeText(resume: ResumeContent): string {
  const parts: string[] = [];

  // Basics
  if (resume.basics.label) parts.push(resume.basics.label);

  // Summary
  if (resume.summary) parts.push(resume.summary);

  // Work experience
  for (const work of resume.work) {
    parts.push(work.company, work.position, work.summary);
  }

  // Education
  for (const edu of resume.education) {
    parts.push(edu.institution, edu.area, edu.studyType);
  }

  // Skills - hard skills (names only)
  for (const skill of resume.skills.hard) {
    parts.push(skill.name);
  }

  // Skills - soft skills
  parts.push(...resume.skills.soft);

  // Skills - tools (treated as hard skills)
  parts.push(...resume.skills.tools);

  // Languages
  for (const lang of resume.languages) {
    parts.push(lang.language);
  }

  return parts.join(' ').toLowerCase();
}

/**
 * Extract keywords from resume as a set for quick lookup
 */
function extractResumeKeywords(resume: ResumeContent): Set<string> {
  const keywords = new Set<string>();

  // Hard skills
  for (const skill of resume.skills.hard) {
    keywords.add(normalizeKeyword(skill.name));
  }

  // Soft skills
  for (const skill of resume.skills.soft) {
    keywords.add(normalizeKeyword(skill));
  }

  // Tools (treated as hard skills)
  for (const tool of resume.skills.tools) {
    keywords.add(normalizeKeyword(tool));
  }

  return keywords;
}

/**
 * Find matches between job keywords and resume
 */
function findMatches(
  jobKeywords: CategorizedKeyword[],
  resumeKeywords: Set<string>,
  resumeText: string
): { matched: CategorizedKeyword[]; missing: CategorizedKeyword[] } {
  const matched: CategorizedKeyword[] = [];
  const missing: CategorizedKeyword[] = [];

  for (const keyword of jobKeywords) {
    const normalized = normalizeKeyword(keyword.keyword);
    
    // Check if keyword exists in resume keywords set or in full text
    if (resumeKeywords.has(normalized) || resumeText.includes(normalized)) {
      matched.push(keyword);
    } else {
      // Also check for variations
      const variations = getKeywordVariations(normalized);
      const found = variations.some(
        v => resumeKeywords.has(v) || resumeText.includes(v)
      );
      
      if (found) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
  }

  return { matched, missing };
}

/**
 * Calculate score for a category based on matched vs total keywords
 */
function calculateCategoryScore(
  totalKeywords: CategorizedKeyword[],
  matchedKeywords: CategorizedKeyword[]
): number {
  if (totalKeywords.length === 0) {
    return 100; // No keywords in this category = full score
  }

  // Weight by frequency
  const totalWeight = totalKeywords.reduce((sum, k) => sum + k.frequency, 0);
  const matchedWeight = matchedKeywords.reduce((sum, k) => sum + k.frequency, 0);

  if (totalWeight === 0) {
    return 100;
  }

  return (matchedWeight / totalWeight) * 100;
}

/**
 * Calculate keyword density score based on how often matched keywords appear
 */
function calculateKeywordDensityScore(
  matchedKeywords: CategorizedKeyword[],
  resumeText: string
): number {
  if (matchedKeywords.length === 0) {
    return 0;
  }

  // Count total occurrences of matched keywords in resume
  let totalOccurrences = 0;
  for (const keyword of matchedKeywords) {
    const normalized = normalizeKeyword(keyword.keyword);
    const regex = new RegExp(escapeRegex(normalized), 'gi');
    const matches = resumeText.match(regex);
    totalOccurrences += matches ? matches.length : 0;
  }

  // Calculate density score (more occurrences = higher score, capped at 100)
  // Target: average of 2 occurrences per keyword = 100%
  const targetOccurrences = matchedKeywords.length * 2;
  const densityRatio = totalOccurrences / targetOccurrences;

  return Math.min(100, densityRatio * 100);
}

/**
 * Normalize keyword for comparison
 */
function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Get variations of a keyword for fuzzy matching
 */
function getKeywordVariations(keyword: string): string[] {
  return [
    keyword,
    keyword.replace(/\s/g, ''),      // Remove spaces: "next js" -> "nextjs"
    keyword.replace(/\s/g, '-'),     // Replace spaces with dash: "next js" -> "next-js"
    keyword.replace(/-/g, ' '),      // Replace dash with space: "next-js" -> "next js"
    keyword.replace(/-/g, ''),       // Remove dashes: "next-js" -> "nextjs"
  ];
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Get the weight constants (exported for testing)
 */
export function getWeights(): typeof WEIGHTS {
  return { ...WEIGHTS };
}
