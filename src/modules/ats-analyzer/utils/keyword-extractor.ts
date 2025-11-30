/**
 * Keyword Extractor - Extract meaningful keywords from job descriptions
 *
 * Categorizes keywords into:
 * - hard_skill: Technical skills (programming languages, frameworks, tools)
 * - soft_skill: Interpersonal and behavioral skills
 * - general: Other relevant keywords
 *
 * Requirements: 3.1, 3.2
 */

import type { CategorizedKeyword } from './score-calculator'

// Common stop words to filter out
const STOP_WORDS = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'by',
	'for',
	'from',
	'has',
	'he',
	'in',
	'is',
	'it',
	'its',
	'of',
	'on',
	'that',
	'the',
	'to',
	'was',
	'will',
	'with',
	'we',
	'you',
	'your',
	'our',
	'can',
	'should',
	'must',
	'have',
	'this',
	'they',
	'their',
])

// Hard skills - Technical skills with high weight (60%)
const HARD_SKILL_PATTERNS = [
	// Programming languages
	/\b(javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|php|swift|kotlin|scala|sql|html|css|sass|less)\b/gi,
	// Frameworks & Libraries
	/\b(react|vue|angular|next\.?js|nuxt|svelte|express|nestjs|django|flask|spring|laravel|rails|fastapi|gatsby)\b/gi,
	// Databases
	/\b(postgresql|postgres|mysql|mongodb|redis|elasticsearch|dynamodb|cassandra|sqlite|oracle|mariadb)\b/gi,
	// Cloud/DevOps
	/\b(aws|azure|gcp|docker|kubernetes|k8s|terraform|jenkins|gitlab|github actions|circleci|ansible|puppet)\b/gi,
	// Tools & Technologies
	/\b(git|graphql|rest\s?api|restful|microservices|webpack|vite|babel|npm|yarn|pnpm)\b/gi,
	// Testing
	/\b(jest|vitest|cypress|playwright|selenium|mocha|pytest|junit|testing library)\b/gi,
	// Data & ML
	/\b(machine learning|deep learning|tensorflow|pytorch|pandas|numpy|scikit-learn|data science)\b/gi,
]

// Soft skills - Interpersonal skills with medium weight (30%)
const SOFT_SKILL_PATTERNS = [
	/\b(communication|teamwork|leadership|problem[\s-]?solving|critical[\s-]?thinking)\b/gi,
	/\b(time[\s-]?management|adaptability|creativity|collaboration|attention to detail)\b/gi,
	/\b(organization|initiative|flexibility|interpersonal|work[\s-]?ethic)\b/gi,
	/\b(self[\s-]?motivated|proactive|analytical|decision[\s-]?making|mentoring)\b/gi,
	/\b(presentation|negotiation|conflict[\s-]?resolution|empathy|patience)\b/gi,
]

// Tools - Treated as hard skills in matching
const TOOL_PATTERNS = [
	/\b(jira|confluence|slack|notion|figma|sketch|adobe|photoshop|illustrator)\b/gi,
	/\b(vs\s?code|visual studio|intellij|webstorm|xcode|android studio)\b/gi,
	/\b(postman|insomnia|swagger|openapi)\b/gi,
]

// Legacy interface for backward compatibility
export interface ExtractedKeyword {
	keyword: string
	weight: number // 0-1 score
	category: 'skill' | 'experience' | 'education' | 'general'
	frequency: number
}

/**
 * Main function to extract keywords from job description
 */
export function extractKeywords(jobDescription: string): ExtractedKeyword[] {
	const keywords: Map<string, ExtractedKeyword> = new Map()

	// 1. Extract technical skills (highest weight)
	const techSkills = extractTechnicalSkills(jobDescription)
	for (const skill of techSkills) {
		keywords.set(skill.toLowerCase(), {
			category: 'skill',
			frequency: countOccurrences(jobDescription, skill),
			keyword: skill,
			weight: 1.0,
		})
	}

	// 2. Extract experience-related keywords
	const experienceKeywords = extractExperienceKeywords(jobDescription)
	for (const keyword of experienceKeywords) {
		if (!keywords.has(keyword.toLowerCase())) {
			keywords.set(keyword.toLowerCase(), {
				category: 'experience',
				frequency: countOccurrences(jobDescription, keyword),
				keyword,
				weight: 0.8,
			})
		}
	}

	// 3. Extract significant nouns/phrases
	const significantTerms = extractSignificantTerms(jobDescription)
	for (const term of significantTerms) {
		if (!keywords.has(term.toLowerCase())) {
			keywords.set(term.toLowerCase(), {
				category: 'general',
				frequency: countOccurrences(jobDescription, term),
				keyword: term,
				weight: 0.5,
			})
		}
	}

	// Sort by weight * frequency
	return Array.from(keywords.values()).sort(
		(a, b) => b.weight * b.frequency - a.weight * a.frequency,
	)
}

/**
 * Extract technical skills using pattern matching
 */
function extractTechnicalSkills(text: string): string[] {
	const skills: Set<string> = new Set()

	for (const pattern of TECH_SKILL_PATTERNS) {
		const matches = text.matchAll(pattern)
		for (const match of matches) {
			if (match[0]) {
				skills.add(match[0].toLowerCase())
			}
		}
	}

	return Array.from(skills)
}

/**
 * Extract experience-related keywords
 */
function extractExperienceKeywords(text: string): string[] {
	const keywords: Set<string> = new Set()

	// Years of experience patterns
	const yearPatterns = /(\d+)\+?\s*years?/gi
	const yearMatches = text.matchAll(yearPatterns)
	for (const match of yearMatches) {
		keywords.add(`${match[1]} years`)
	}

	// Education levels
	const educationTerms = [
		"bachelor's",
		"master's",
		'phd',
		'doctorate',
		'degree',
		'bs',
		'ms',
		'mba',
		'computer science',
		'engineering',
	]
	for (const term of educationTerms) {
		if (text.toLowerCase().includes(term)) {
			keywords.add(term)
		}
	}

	// Job role keywords
	const rolePatterns =
		/\b(senior|junior|lead|principal|staff|director|manager|engineer|developer|designer|analyst)\b/gi
	const roleMatches = text.matchAll(rolePatterns)
	for (const match of roleMatches) {
		keywords.add(match[0].toLowerCase())
	}

	return Array.from(keywords)
}

/**
 * Extract significant terms (simple noun extraction)
 */
function extractSignificantTerms(text: string): string[] {
	// Tokenize and clean
	const words = text
		.toLowerCase()
		.split(/\W+/)
		.filter((word) => word.length > 3 && !STOP_WORDS.has(word))

	// Count frequency
	const frequency = new Map<string, number>()
	for (const word of words) {
		frequency.set(word, (frequency.get(word) || 0) + 1)
	}

	// Get top terms that appear more than once
	return Array.from(frequency.entries())
		.filter(([_, count]) => count > 1)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 20)
		.map(([word]) => word)
}

/**
 * Count case-insensitive occurrences of a term
 */
function countOccurrences(text: string, term: string): number {
	const pattern = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
	return (text.match(pattern) || []).length
}

/**
 * Normalize keyword for comparison
 */
export function normalizeKeyword(keyword: string): string {
	return keyword
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s]/g, '')
		.replace(/\s+/g, ' ')
}

/**
 * Extract and categorize keywords from job description
 *
 * Returns keywords categorized as:
 * - hard_skill: Technical skills (60% weight in scoring)
 * - soft_skill: Interpersonal skills (30% weight in scoring)
 * - general: Other relevant keywords (10% weight via density)
 *
 * Requirements: 3.1, 3.2
 */
export function extractCategorizedKeywords(jobDescription: string): CategorizedKeyword[] {
	const keywords: Map<string, CategorizedKeyword> = new Map()

	// 1. Extract hard skills (highest priority)
	const hardSkills = extractPatternMatches(jobDescription, HARD_SKILL_PATTERNS)
	for (const skill of hardSkills) {
		const normalized = skill.toLowerCase()
		if (!keywords.has(normalized)) {
			keywords.set(normalized, {
				keyword: normalized,
				category: 'hard_skill',
				frequency: countOccurrences(jobDescription, skill),
			})
		}
	}

	// 2. Extract tools (treated as hard skills)
	const tools = extractPatternMatches(jobDescription, TOOL_PATTERNS)
	for (const tool of tools) {
		const normalized = tool.toLowerCase()
		if (!keywords.has(normalized)) {
			keywords.set(normalized, {
				keyword: normalized,
				category: 'hard_skill',
				frequency: countOccurrences(jobDescription, tool),
			})
		}
	}

	// 3. Extract soft skills
	const softSkills = extractPatternMatches(jobDescription, SOFT_SKILL_PATTERNS)
	for (const skill of softSkills) {
		const normalized = skill.toLowerCase().replace(/[\s-]+/g, ' ')
		if (!keywords.has(normalized)) {
			keywords.set(normalized, {
				keyword: normalized,
				category: 'soft_skill',
				frequency: countOccurrences(jobDescription, skill),
			})
		}
	}

	// 4. Extract general keywords (significant terms not already categorized)
	const generalTerms = extractSignificantTerms(jobDescription)
	for (const term of generalTerms) {
		const normalized = term.toLowerCase()
		if (!keywords.has(normalized)) {
			keywords.set(normalized, {
				keyword: normalized,
				category: 'general',
				frequency: countOccurrences(jobDescription, term),
			})
		}
	}

	// Sort by category priority (hard_skill > soft_skill > general) then by frequency
	return Array.from(keywords.values()).sort((a, b) => {
		const categoryOrder = { hard_skill: 0, soft_skill: 1, general: 2 }
		const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category]
		if (categoryDiff !== 0) return categoryDiff
		return b.frequency - a.frequency
	})
}

/**
 * Extract matches from text using pattern array
 */
function extractPatternMatches(text: string, patterns: RegExp[]): string[] {
	const matches: Set<string> = new Set()

	for (const pattern of patterns) {
		// Reset lastIndex for global patterns
		pattern.lastIndex = 0
		const found = text.matchAll(pattern)
		for (const match of found) {
			if (match[0]) {
				matches.add(match[0].toLowerCase())
			}
		}
	}

	return Array.from(matches)
}

/**
 * Get category for a keyword (useful for external categorization)
 */
export function categorizeKeyword(keyword: string): 'hard_skill' | 'soft_skill' | 'general' {
	const testText = ` ${keyword} `

	// Check hard skills
	for (const pattern of HARD_SKILL_PATTERNS) {
		pattern.lastIndex = 0
		if (pattern.test(testText)) {
			return 'hard_skill'
		}
	}

	// Check tools (treated as hard skills)
	for (const pattern of TOOL_PATTERNS) {
		pattern.lastIndex = 0
		if (pattern.test(testText)) {
			return 'hard_skill'
		}
	}

	// Check soft skills
	for (const pattern of SOFT_SKILL_PATTERNS) {
		pattern.lastIndex = 0
		if (pattern.test(testText)) {
			return 'soft_skill'
		}
	}

	return 'general'
}
