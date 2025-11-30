'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { analyzeResume } from '../actions/analysis-actions'

interface UseJobAnalysisProps {
	userId: string
	resumeId: string
	jobId: string
}

export function useJobAnalysis({ userId, resumeId, jobId }: UseJobAnalysisProps) {
	const [isAnalyzing, setIsAnalyzing] = useState(false)
	const [analysisResult, setAnalysisResult] = useState<any>(null)

	const analyze = async (currentVersionId?: string) => {
		if (!currentVersionId) {
			toast.error('No resume version available to analyze')
			return
		}

		setIsAnalyzing(true)
		try {
			const result = await analyzeResume(userId, currentVersionId, jobId)
			setAnalysisResult(result)
			toast.success('Analysis complete!')
			return result
		} catch (error) {
			toast.error('Analysis failed')
			console.error(error)
		} finally {
			setIsAnalyzing(false)
		}
	}

	return {
		analysisResult,
		analyze,
		isAnalyzing,
	}
}
