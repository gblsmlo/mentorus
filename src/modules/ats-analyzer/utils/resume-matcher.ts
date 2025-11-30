/**
 * Resume Matcher - Compare resume content against job keywords
 *
 * Includes gap analysis with priority sorting:
 * - Hard skills first (highest importance)
 * - Soft skills second
 * - General keywords last
 *
 * Requirements: 4.1, 4.2
 */

import type { ResumeContent } from '../schemas'
import type { ResumeContent as NewResumeContent } from '../types/resume-content'
import {
	type ExtractedKeyword,
	extractKeywords,
	normalizeKeyword,
	extractCategorizedKeywords,
} from './keyword-extractor'
import type { CategorizedKeyword } from './score-calculator'

export interface MatchResult {
	matchScore: number // 0-100
	matchedKeywords: Array<{
		keyword: string
		weight: number
		category: 'skill' | 'experience' | 'education' | 'general'
	}>
	missingKeywords: Array<{
		keyword: string
		suggestion: string
		category: 'skill' | 'experience' | 'education' | 'general'
	}>
	feedback: string
}

/**
 * Gap analysis result with priority-sorted missing keywords
 */
export interface GapAnalysisResult {
	matchedKeywords: CategorizedKeyword[]
	missingKeywords: CategorizedKeyword[]
	gapsByCategory: {
		hardSkills: CategorizedKeyword[]
		softSkills: CategorizedKeyword[]
		general: CategorizedKeyword[]
	}
	suggestions: GapSuggestion[]
}

export interface GapSuggestion {
	keyword: string
	category: 'hard_skill' | 'soft_skill' | 'general'
	priority: number // 1 = highest (hard skill), 2 = medium (soft skill), 3 = lowest (general)
	suggestion: string
}

/**
 * Main matching function
 */
export function matchResumeToJob(
	resumeContent: ResumeContent,
	jobDescription: string,
): MatchResult {
	// Extract keywords from job description
	const jobKeywords = extractKeywords(jobDescription)

	// Convert resume to searchable text
	const resumeText = resumeToText(resumeContent)

	// Perform matching
	const matchedKeywords: MatchResult['matchedKeywords'] = []
	const missingKeywords: MatchResult['missingKeywords'] = []

	for (const jobKeyword of jobKeywords) {
		if (isKeywordInResume(jobKeyword.keyword, resumeText)) {
			matchedKeywords.push({
				category: jobKeyword.category,
				keyword: jobKeyword.keyword,
				weight: jobKeyword.weight,
			})
		} else {
			missingKeywords.push({
				category: jobKeyword.category,
				keyword: jobKeyword.keyword,
				suggestion: generateSuggestion(jobKeyword),
			})
		}
	}

	// Calculate score
	const matchScore = calculateScore(matchedKeywords, jobKeywords)

	// Generate feedback
	const feedback = generateFeedback(matchScore, matchedKeywords, missingKeywords)

	return {
		feedback,
		matchedKeywords,
		matchScore,
		missingKeywords: missingKeywords.slice(0, 10), // Top 10 missing
	}
}

/**
 * Convert resume content to searchable text
 */
function resumeToText(content: ResumeContent): string {
	const parts: string[] = []

	// Headline and About (new fields)
	if (content.headline) parts.push(content.headline)
	if (content.about) parts.push(content.about)

	// Competencies (new field)
	if (content.competencies) parts.push(...content.competencies)

	// Summary
	if (content.summary) parts.push(content.summary)

	// Experience
	for (const exp of content.experience) {
		parts.push(exp.company, exp.title, exp.description || '')
		parts.push(...exp.bullets)
	}

	// Education
	for (const edu of content.education) {
		parts.push(edu.school, edu.degree, edu.field || '')
	}

	// Skills (only technical and soft now)
	parts.push(...content.skills.technical)
	parts.push(...content.skills.soft)

	// Projects
	for (const project of content.projects) {
		parts.push(project.name, project.description || '')
		parts.push(...project.technologies)
	}

	return parts.join(' ').toLowerCase()
}

/**
 * Check if keyword exists in resume text
 */
function isKeywordInResume(keyword: string, resumeText: string): boolean {
	const normalized = normalizeKeyword(keyword)
	const normalizedResume = resumeText.toLowerCase()

	// Direct match
	if (normalizedResume.includes(normalized)) {
		return true
	}

	// Handle variations (e.g., "next.js" vs "nextjs")
	const variations = [
		normalized.replace(/\./g, ''),
		normalized.replace(/\s/g, ''),
		normalized.replace(/-/g, ' '),
	]

	return variations.some((variation) => normalizedResume.includes(variation))
}

/**
 * Calculate overall match score (0-100)
 */
function calculateScore(
	matched: MatchResult['matchedKeywords'],
	allKeywords: ExtractedKeyword[],
): number {
	if (allKeywords.length === 0) return 0

	// Weighted scoring: skills matter more than general keywords
	const totalWeight = allKeywords.reduce((sum, kw) => sum + kw.weight * kw.frequency, 0)
	const matchedWeight = matched.reduce((sum, kw) => sum + kw.weight, 0)

	const rawScore = (matchedWeight / totalWeight) * 100

	// Normalize to 0-100 range
	return Math.min(100, Math.max(0, Math.round(rawScore)))
}

/**
 * Generate suggestion for missing keyword
 */
function generateSuggestion(keyword: ExtractedKeyword): string {
	switch (keyword.category) {
		case 'skill':
			return `Add "${keyword.keyword}" to your Skills section or mention it in relevant project/experience descriptions`
		case 'experience':
			return `Highlight experience related to "${keyword.keyword}" in your work history`
		case 'education':
			return `Include "${keyword.keyword}" in your Education section if applicable`
		default:
			return `Consider mentioning "${keyword.keyword}" in your resume summary or relevant sections`
	}
}

/**
 * Generate actionable feedback text
 */
function generateFeedback(
	score: number,
	matched: MatchResult['matchedKeywords'],
	missing: MatchResult['missingKeywords'],
): string {
	const parts: string[] = []

	// Overall assessment
	if (score >= 80) {
		parts.push('🎉 Excellent match! Your resume aligns very well with this job description.')
	} else if (score >= 60) {
		parts.push(
			'✅ Good match! Your resume shows relevant qualifications with some areas for improvement.',
		)
	} else if (score >= 40) {
		parts.push('⚠️ Moderate match. Consider emphasizing more relevant skills and experiences.')
	} else {
		parts.push(
			'❌ Low match. This role may require skills or experiences not currently highlighted in your resume.',
		)
	}

	// Matched keywords summary
	const techMatches = matched.filter((k) => k.category === 'skill')
	if (techMatches.length > 0) {
		parts.push(
			`\n✨ Strong technical alignment: You match ${techMatches.length} key technical requirements.`,
		)
	}

	// Missing critical skills
	const missingSkills = missing.filter((k) => k.category === 'skill').slice(0, 3)
	if (missingSkills.length > 0) {
		parts.push(`\n🔧 Key skills to add: ${missingSkills.map((k) => k.keyword).join(', ')}`)
	}

	// Top recommendations
	if (missing.length > 0) {
		parts.push('\n📝 Top recommendations:')
		const topMissing = missing.slice(0, 3)
		for (let i = 0; i < topMissing.length; i++) {
			parts.push(`${i + 1}. ${topMissing[i].suggestion}`)
		}
	}

	return parts.join('\n')
}


/**
 * Perform gap analysis between job keywords and resume content
 *
 * Identifies missing keywords and sorts them by importance:
 * 1. Hard skills (highest priority)
 * 2. Soft skills (medium priority)
 * 3. General keywords (lowest priority)
 *
 * Requirements: 4.1, 4.2
 */
export function analyzeGaps(
	resume: NewResumeContent,
	jobKeywords: CategorizedKeyword[]
): GapAnalysisResult {
	// Extract resume text for matching
	const resumeText = newResumeToText(resume)
	const resumeKeywords = extractNewResumeKeywords(resume)

	const matchedKeywords: CategorizedKeyword[] = []
	const missingKeywords: CategorizedKeyword[] = []

	// Categorize each job keyword as matched or missing
	for (const keyword of jobKeywords) {
		if (isKeywordPresent(keyword.keyword, resumeKeywords, resumeText)) {
			matchedKeywords.push(keyword)
		} else {
			missingKeywords.push(keyword)
		}
	}

	// Sort missing keywords by priority (hard_skill > soft_skill > general)
	const sortedMissing = sortByPriority(missingKeywords)

	// Group gaps by category
	const gapsByCategory = {
		hardSkills: sortedMissing.filter(k => k.category === 'hard_skill'),
		softSkills: sortedMissing.filter(k => k.category === 'soft_skill'),
		general: sortedMissing.filter(k => k.category === 'general'),
	}

	// Generate suggestions with priority
	const suggestions = generateGapSuggestions(sortedMissing)

	return {
		matchedKeywords,
		missingKeywords: sortedMissing,
		gapsByCategory,
		suggestions,
	}
}

/**
 * Analyze gaps directly from job description text
 */
export function analyzeGapsFromJobDescription(
	resume: NewResumeContent,
	jobDescription: string
): GapAnalysisResult {
	const jobKeywords = extractCategorizedKeywords(jobDescription)
	return analyzeGaps(resume, jobKeywords)
}

/**
 * Convert new ResumeContent to searchable text
 */
function newResumeToText(content: NewResumeContent): string {
	const parts: string[] = []

	// Basics
	if (content.basics.label) parts.push(content.basics.label)

	// Summary
	if (content.summary) parts.push(content.summary)

	// Work experience
	for (const work of content.work) {
		parts.push(work.company, work.position, work.summary)
	}

	// Education
	for (const edu of content.education) {
		parts.push(edu.institution, edu.area, edu.studyType)
	}

	// Skills - hard skills
	for (const skill of content.skills.hard) {
		parts.push(skill.name)
	}

	// Skills - soft skills
	parts.push(...content.skills.soft)

	// Skills - tools
	parts.push(...content.skills.tools)

	// Languages
	for (const lang of content.languages) {
		parts.push(lang.language)
	}

	return parts.join(' ').toLowerCase()
}

/**
 * Extract keywords from new ResumeContent as a set
 */
function extractNewResumeKeywords(resume: NewResumeContent): Set<string> {
	const keywords = new Set<string>()

	// Hard skills
	for (const skill of resume.skills.hard) {
		keywords.add(normalizeKeyword(skill.name))
	}

	// Soft skills
	for (const skill of resume.skills.soft) {
		keywords.add(normalizeKeyword(skill))
	}

	// Tools
	for (const tool of resume.skills.tools) {
		keywords.add(normalizeKeyword(tool))
	}

	return keywords
}

/**
 * Check if a keyword is present in resume
 */
function isKeywordPresent(
	keyword: string,
	resumeKeywords: Set<string>,
	resumeText: string
): boolean {
	const normalized = normalizeKeyword(keyword)

	// Check in explicit keywords
	if (resumeKeywords.has(normalized)) {
		return true
	}

	// Check in full text
	if (resumeText.includes(normalized)) {
		return true
	}

	// Check variations
	const variations = [
		normalized.replace(/\s/g, ''),      // Remove spaces
		normalized.replace(/\s/g, '-'),     // Replace spaces with dash
		normalized.replace(/-/g, ' '),      // Replace dash with space
		normalized.replace(/-/g, ''),       // Remove dashes
	]

	return variations.some(v => resumeKeywords.has(v) || resumeText.includes(v))
}

/**
 * Sort keywords by priority: hard_skill (1) > soft_skill (2) > general (3)
 */
export function sortByPriority(keywords: CategorizedKeyword[]): CategorizedKeyword[] {
	const priorityMap: Record<CategorizedKeyword['category'], number> = {
		hard_skill: 1,
		soft_skill: 2,
		general: 3,
	}

	return [...keywords].sort((a, b) => {
		const priorityDiff = priorityMap[a.category] - priorityMap[b.category]
		if (priorityDiff !== 0) return priorityDiff
		// Within same category, sort by frequency (higher first)
		return b.frequency - a.frequency
	})
}

/**
 * Generate suggestions for missing keywords
 */
function generateGapSuggestions(missingKeywords: CategorizedKeyword[]): GapSuggestion[] {
	return missingKeywords.map(keyword => ({
		keyword: keyword.keyword,
		category: keyword.category,
		priority: getPriority(keyword.category),
		suggestion: getSuggestionText(keyword),
	}))
}

/**
 * Get numeric priority for category
 */
function getPriority(category: CategorizedKeyword['category']): number {
	switch (category) {
		case 'hard_skill':
			return 1
		case 'soft_skill':
			return 2
		case 'general':
			return 3
	}
}

/**
 * Generate suggestion text for a missing keyword
 */
function getSuggestionText(keyword: CategorizedKeyword): string {
	switch (keyword.category) {
		case 'hard_skill':
			return `Add "${keyword.keyword}" to your Skills section or highlight it in your work experience`
		case 'soft_skill':
			return `Demonstrate "${keyword.keyword}" through specific examples in your experience descriptions`
		case 'general':
			return `Consider mentioning "${keyword.keyword}" in your summary or relevant sections`
	}
}
