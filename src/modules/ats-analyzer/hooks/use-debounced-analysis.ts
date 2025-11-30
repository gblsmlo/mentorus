'use client'

import { useCallback, useRef, useState } from 'react'
import type { ResumeContent } from '../types/resume-content'
import { extractCategorizedKeywords } from '../utils/keyword-extractor'
import type { CategorizedKeyword, ScoreResult } from '../utils/score-calculator'
import { calculateATSScore } from '../utils/score-calculator'

export interface AnalysisResult {
	score: number
	previousScore?: number
	matchedKeywords: CategorizedKeyword[]
	missingKeywords: CategorizedKeyword[]
	breakdown: {
		hardSkillScore: number
		softSkillScore: number
		keywordDensityScore: number
		totalScore: number
	}
}

export interface UseDebouncedAnalysisOptions {
	jobDescription: string
	debounceMs?: number // Default: 500ms
	onAnalysisComplete?: (result: AnalysisResult) => void
}

export interface UseDebouncedAnalysisReturn {
	analyze: (content: ResumeContent) => void
	result: AnalysisResult | null
	isAnalyzing: boolean
	score: number
	previousScore?: number
}

/**
 * Debounced analysis hook for real-time ATS score calculation
 *
 * Requirements: 2.1
 * - Recalculates ATS score within 500ms after user stops typing
 * - Triggers analysis and updates score/keywords
 */
export function useDebouncedAnalysis({
	jobDescription,
	debounceMs = 500,
	onAnalysisComplete,
}: UseDebouncedAnalysisOptions): UseDebouncedAnalysisReturn {
	const [result, setResult] = useState<AnalysisResult | null>(null)
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [score, setScore] = useState(0)
	const [previousScore, setPreviousScore] = useState<number | undefined>(undefined)

	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
	const jobKeywordsRef = useRef<CategorizedKeyword[] | null>(null)

	// Extract job keywords once (or when job description changes)
	const getJobKeywords = useCallback(() => {
		if (!jobKeywordsRef.current) {
			jobKeywordsRef.current = extractCategorizedKeywords(jobDescription)
		}
		return jobKeywordsRef.current
	}, [jobDescription])

	// Reset cached keywords when job description changes
	const prevJobDescRef = useRef(jobDescription)
	if (prevJobDescRef.current !== jobDescription) {
		jobKeywordsRef.current = null
		prevJobDescRef.current = jobDescription
	}

	const performAnalysis = useCallback(
		(content: ResumeContent) => {
			setIsAnalyzing(true)

			try {
				const jobKeywords = getJobKeywords()
				const scoreResult: ScoreResult = calculateATSScore(content, jobKeywords)

				const analysisResult: AnalysisResult = {
					breakdown: scoreResult.breakdown,
					matchedKeywords: scoreResult.matchedKeywords,
					missingKeywords: scoreResult.missingKeywords,
					previousScore: score > 0 ? score : undefined,
					score: scoreResult.score,
				}

				// Update previous score before setting new score
				if (score > 0) {
					setPreviousScore(score)
				}

				setScore(scoreResult.score)
				setResult(analysisResult)
				onAnalysisComplete?.(analysisResult)
			} catch (error) {
				console.error('Analysis failed:', error)
			} finally {
				setIsAnalyzing(false)
			}
		},
		[getJobKeywords, score, onAnalysisComplete],
	)

	const analyze = useCallback(
		(content: ResumeContent) => {
			// Clear any existing debounce timer
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}

			// Set analyzing state immediately for UI feedback
			setIsAnalyzing(true)

			// Set new debounce timer
			debounceTimerRef.current = setTimeout(() => {
				performAnalysis(content)
			}, debounceMs)
		},
		[debounceMs, performAnalysis],
	)

	return {
		analyze,
		isAnalyzing,
		previousScore,
		result,
		score,
	}
}
