/**
 * Keyword Extractor - Extract meaningful keywords from job descriptions
 */

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

// Common technical skill patterns
const TECH_SKILL_PATTERNS = [
	// Programming languages
	/\b(javascript|typescript|python|java|c\+\+|c#|ruby|go|rust|php|swift|kotlin|scala)\b/gi,
	// Frameworks
	/\b(react|vue|angular|next\.?js|nuxt|svelte|express|nestjs|django|flask|spring|laravel)\b/gi,
	// Databases
	/\b(postgresql|postgres|mysql|mongodb|redis|elasticsearch|dynamodb|cassandra)\b/gi,
	// Cloud/DevOps
	/\b(aws|azure|gcp|docker|kubernetes|k8s|terraform|jenkins|gitlab|github actions)\b/gi,
	// Tools & Methodologies
	/\b(git|agile|scrum|ci\/cd|restful|graphql|microservices|api)\b/gi,
]

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
