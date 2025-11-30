/**
 * Resume Matcher - Compare resume content against job keywords
 */

import type { ResumeContent } from '../schemas'
import { type ExtractedKeyword, extractKeywords, normalizeKeyword } from './keyword-extractor'

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

	// Personal info
	parts.push(content.personalInfo.name)
	parts.push(content.personalInfo.email)
	if (content.personalInfo.location) parts.push(content.personalInfo.location)

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

	// Skills
	parts.push(...content.skills.technical)
	parts.push(...content.skills.soft)
	parts.push(...content.skills.languages)
	parts.push(...content.skills.certifications)

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
