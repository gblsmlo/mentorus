'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { analyzeResume } from '../actions/analysis-actions'
import { saveJob } from '../actions/job-actions'

interface AnalysisDashboardProps {
	userId: string
	resumeId: string
	currentVersionId?: string
}

export function AnalysisDashboard({ userId, resumeId, currentVersionId }: AnalysisDashboardProps) {
	const [jobTitle, setJobTitle] = useState('')
	const [jobCompany, setJobCompany] = useState('')
	const [jobDescription, setJobDescription] = useState('')
	const [jobUrl, setJobUrl] = useState('')
	const [analyzing, setAnalyzing] = useState(false)
	const [result, setResult] = useState<any>(null)

	async function handleAnalyze() {
		if (!jobTitle || !jobDescription) {
			toast.error('Please fill in job title and description')
			return
		}

		if (!currentVersionId) {
			toast.error('No resume version available to analyze')
			return
		}

		setAnalyzing(true)
		setResult(null)

		try {
			// Save job first
			const job = await saveJob(userId, {
				company: jobCompany || undefined,
				description: jobDescription,
				title: jobTitle,
				url: jobUrl || undefined,
			})

			// Run analysis
			const analysisResult = await analyzeResume(userId, currentVersionId, job.id)

			setResult(analysisResult)
			toast.success('Analysis complete!')
		} catch (error) {
			toast.error('Analysis failed', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		} finally {
			setAnalyzing(false)
		}
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Job Description</CardTitle>
					<CardDescription>
						Paste the job description you want to analyze your resume against
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label className="font-medium text-sm">Job Title *</label>
							<Input
								onChange={(e) => setJobTitle(e.target.value)}
								placeholder="Senior Software Engineer"
								value={jobTitle}
							/>
						</div>
						<div>
							<label className="font-medium text-sm">Company</label>
							<Input
								onChange={(e) => setJobCompany(e.target.value)}
								placeholder="Google"
								value={jobCompany}
							/>
						</div>
					</div>

					<div>
						<label className="font-medium text-sm">Description *</label>
						<Textarea
							className="min-h-[200px]"
							onChange={(e) => setJobDescription(e.target.value)}
							placeholder="Paste the full job description here..."
							value={jobDescription}
						/>
					</div>

					<div>
						<label className="font-medium text-sm">Job URL</label>
						<Input
							onChange={(e) => setJobUrl(e.target.value)}
							placeholder="https://..."
							value={jobUrl}
						/>
					</div>

					<Button className="w-full" disabled={analyzing} onClick={handleAnalyze}>
						{analyzing ? 'Analyzing...' : 'Analyze Resume'}
					</Button>
				</CardContent>
			</Card>

			{result && (
				<>
					{/* Match Score */}
					<Card>
						<CardHeader>
							<CardTitle>Match Score</CardTitle>
							<CardDescription>How well your resume matches this job description</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="text-center">
								<div className="font-bold text-5xl">{result.matchScore}%</div>
								<p className="mt-2 text-muted-foreground">Overall Match</p>
							</div>
							<Progress className="h-3" value={result.matchScore} />
							<div className="text-muted-foreground text-sm">
								{result.matchScore >= 80 && '🎉 Excellent match!'}
								{result.matchScore >= 60 && result.matchScore < 80 && '✅ Good match'}
								{result.matchScore >= 40 && result.matchScore < 60 && '⚠️ Moderate match'}
								{result.matchScore < 40 && '❌ Low match'}
							</div>
						</CardContent>
					</Card>

					{/* Detailed Results */}
					<Tabs className="w-full" defaultValue="feedback">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="feedback">Feedback</TabsTrigger>
							<TabsTrigger value="matched">Matched ({result.matchedKeywords.length})</TabsTrigger>
							<TabsTrigger value="missing">Missing ({result.missingKeywords.length})</TabsTrigger>
						</TabsList>

						<TabsContent value="feedback">
							<Card>
								<CardHeader>
									<CardTitle>Detailed Feedback</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="whitespace-pre-wrap">{result.feedback}</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="matched">
							<Card>
								<CardHeader>
									<CardTitle>Matched Keywords</CardTitle>
									<CardDescription>Skills and keywords found in your resume</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="flex flex-wrap gap-2">
										{result.matchedKeywords.map((item: any, i: number) => (
											<Badge key={i} variant="default">
												{item.keyword}
												<span className="ml-1 text-xs opacity-70">{item.category}</span>
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="missing">
							<Card>
								<CardHeader>
									<CardTitle>Missing Keywords</CardTitle>
									<CardDescription>
										Keywords from the job description not found in your resume
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{result.missingKeywords.map((item: any, i: number) => (
										<div className="border-destructive border-l-2 py-2 pl-4" key={i}>
											<div className="mb-1 flex items-center gap-2">
												<Badge variant="destructive">{item.keyword}</Badge>
												<span className="text-muted-foreground text-xs">{item.category}</span>
											</div>
											<p className="text-muted-foreground text-sm">{item.suggestion}</p>
										</div>
									))}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</>
			)}
		</div>
	)
}
