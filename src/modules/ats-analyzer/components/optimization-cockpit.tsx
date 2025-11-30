'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ArrowLeft, ExternalLink, RefreshCw, Save, History } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { saveApplicationResume } from '../actions/application-actions'
import { useAutoSave } from '../hooks/use-auto-save'
import { useDebouncedAnalysis } from '../hooks/use-debounced-analysis'
import type { ResumeContent } from '../types/resume-content'
import { FloatingScoreBadge } from './floating-score-badge'
import { KeywordAnalysisBar } from './keyword-analysis-bar'
import { ResumeForm } from './resume-form'
import { VersionHistoryDrawer } from './version-history-drawer'

interface OptimizationCockpitProps {
	application: {
		id: string
		status: string
		matchScore?: number
	}
	job: {
		id: string
		title: string
		company: string
		description: string
		url?: string
	}
	resume: {
		id: string
		title: string
		currentVersionId?: string
		currentVersion?: {
			content: ResumeContent
		}
	}
	userId: string
	versions?: Array<{
		id: string
		versionNumber: number
		createdAt: Date
		commitMessage?: string
		atsScore?: number
	}>
}

/**
 * OptimizationCockpit - Split-screen interface for resume optimization
 *
 * Requirements: 1.1, 1.2, 1.4, 6.2, 6.4
 * - Display job description in read-only left panel
 * - Display resume editor in editable right panel
 * - Persist panel width ratio for user session
 * - Display "Saved" indicator after auto-save
 * - Prompt for confirmation when navigating away with unsaved changes
 */
export function OptimizationCockpit({
	application,
	job,
	resume,
	userId,
	versions = [],
}: OptimizationCockpitProps) {
	const [isSaving, setIsSaving] = useState(false)
	const [isVersionDrawerOpen, setIsVersionDrawerOpen] = useState(false)
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
	const formContentRef = useRef<ResumeContent | null>(null)

	// Debounced analysis hook for real-time ATS scoring
	const {
		analyze,
		result: analysisResult,
		isAnalyzing,
		score,
		previousScore,
	} = useDebouncedAnalysis({
		jobDescription: job.description,
		debounceMs: 500,
	})

	// Auto-save hook with retry logic
	const {
		save: autoSave,
		status: autoSaveStatus,
		lastSaved,
	} = useAutoSave({
		resumeId: resume.id,
		debounceMs: 2000,
		maxRetries: 3,
		onSave: async (resumeId, content) => {
			await saveApplicationResume({
				applicationId: application.id,
				content,
				title: resume.title,
			})
		},
		onError: (error) => {
			toast.error('Failed to auto-save. Please save manually.', {
				description: error.message,
			})
		},
	})

	// Handle form content changes
	const handleContentChange = useCallback(
		(content: ResumeContent) => {
			formContentRef.current = content
			setHasUnsavedChanges(true)

			// Trigger debounced analysis
			analyze(content)

			// Trigger auto-save
			autoSave(content)
		},
		[analyze, autoSave]
	)

	// Handle manual save
	const handleSave = async (data: { title: string; content: ResumeContent }) => {
		setIsSaving(true)
		try {
			await saveApplicationResume({
				applicationId: application.id,
				content: data.content,
				title: data.title,
			})
			setHasUnsavedChanges(false)
			toast.success('Resume saved & optimized for this job!')
		} catch (error) {
			toast.error('Failed to save')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	// Handle keyword click for navigation
	const handleKeywordClick = useCallback((keyword: string, type: 'matched' | 'missing') => {
		if (type === 'missing') {
			// Scroll to job description and highlight keyword
			const jobPanel = document.querySelector('[data-panel="job-description"]')
			if (jobPanel) {
				const text = jobPanel.textContent || ''
				const index = text.toLowerCase().indexOf(keyword.toLowerCase())
				if (index !== -1) {
					// Could implement highlight logic here
					toast.info(`"${keyword}" appears in the job description`)
				}
			}
		} else {
			// Scroll to resume section containing keyword
			toast.info(`"${keyword}" found in your resume`)
		}
	}, [])

	// Handle version restore
	const handleVersionRestore = useCallback((versionId: string) => {
		// This would trigger a restore action
		toast.info('Version restore functionality coming soon')
		setIsVersionDrawerOpen(false)
	}, [])

	// Unsaved changes confirmation on navigation
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault()
				e.returnValue = ''
			}
		}

		window.addEventListener('beforeunload', handleBeforeUnload)
		return () => window.removeEventListener('beforeunload', handleBeforeUnload)
	}, [hasUnsavedChanges])

	// Initial analysis on mount
	useEffect(() => {
		if (resume.currentVersion?.content) {
			analyze(resume.currentVersion.content)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// Auto-save status indicator
	const getSaveStatusText = () => {
		switch (autoSaveStatus) {
			case 'saving':
				return 'Saving...'
			case 'saved':
				return lastSaved ? `Saved ${formatTimeAgo(lastSaved)}` : 'Saved'
			case 'error':
				return 'Save failed'
			default:
				return null
		}
	}

	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col">
			{/* Floating Score Badge */}
			<FloatingScoreBadge
				score={score}
				previousScore={previousScore}
				isCalculating={isAnalyzing}
				className="top-20 right-6"
			/>

			{/* Header */}
			<div className="flex shrink-0 items-center justify-between border-b bg-background p-4">
				<div className="flex items-center gap-4">
					<Button asChild size="icon" variant="ghost">
						<Link
							href="/dashboard/applications"
							onClick={(e) => {
								if (hasUnsavedChanges) {
									const confirmed = window.confirm(
										'You have unsaved changes. Are you sure you want to leave?'
									)
									if (!confirmed) {
										e.preventDefault()
									}
								}
							}}
						>
							<ArrowLeft className="h-4 w-4" />
						</Link>
					</Button>
					<div>
						<h1 className="flex items-center gap-2 font-semibold text-lg">
							{job.title}
							<Badge className="font-normal" variant="outline">
								{job.company}
							</Badge>
						</h1>
						<div className="flex items-center gap-2 text-muted-foreground text-xs">
							<span>Status: {application.status}</span>
							{score > 0 && (
								<Badge variant={score >= 70 ? 'default' : 'secondary'}>
									Match: {score}%
								</Badge>
							)}
							{/* Auto-save status */}
							{getSaveStatusText() && (
								<span
									className={cn(
										'ml-2',
										autoSaveStatus === 'error' && 'text-destructive',
										autoSaveStatus === 'saved' && 'text-green-600 dark:text-green-400'
									)}
								>
									{getSaveStatusText()}
								</span>
							)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => setIsVersionDrawerOpen(true)}
					>
						<History className="mr-2 h-4 w-4" />
						History
					</Button>
					<Button
						disabled={isAnalyzing || isSaving}
						onClick={() => {
							if (formContentRef.current) {
								analyze(formContentRef.current)
							}
						}}
						size="sm"
						variant="outline"
					>
						<RefreshCw className={cn('mr-2 h-4 w-4', isAnalyzing && 'animate-spin')} />
						{isAnalyzing ? 'Scanning...' : 'Re-Scan'}
					</Button>
				</div>
			</div>

			{/* Split View */}
			<ResizablePanelGroup className="flex-1" direction="horizontal">
				{/* Left Panel: Job Description */}
				<ResizablePanel defaultSize={40} minSize={30}>
					<div className="flex h-full flex-col bg-muted/10" data-panel="job-description">
						<div className="flex items-center justify-between border-b p-4 font-medium text-muted-foreground text-sm">
							JOB DESCRIPTION
							{job.url && (
								<a className="hover:text-primary" href={job.url} rel="noreferrer" target="_blank">
									<ExternalLink className="h-3 w-3" />
								</a>
							)}
						</div>
						<ScrollArea className="flex-1 p-6">
							<div className="prose prose-sm dark:prose-invert max-w-none">
								<h2 className="mb-2 font-bold text-xl">{job.title}</h2>
								<div className="mb-4 font-medium text-lg text-muted-foreground">{job.company}</div>
								<div className="whitespace-pre-wrap">{job.description}</div>
							</div>
						</ScrollArea>
					</div>
				</ResizablePanel>

				<ResizableHandle withHandle />

				{/* Right Panel: Resume Editor */}
				<ResizablePanel defaultSize={60} minSize={40}>
					<div className="flex h-full flex-col">
						<div className="border-b bg-background p-4 font-medium text-muted-foreground text-sm">
							RESUME EDITOR
						</div>
						<ScrollArea className="flex-1">
							<div className="p-6 space-y-6">
								{/* Keyword Analysis Bar */}
								<KeywordAnalysisBar
									matchedKeywords={analysisResult?.matchedKeywords || []}
									missingKeywords={analysisResult?.missingKeywords || []}
									onKeywordClick={handleKeywordClick}
								/>

								{/* Resume Form */}
								<ResumeForm
									initialData={{
										content: resume.currentVersion?.content || {},
										title: resume.title,
									}}
									onSave={handleSave}
									resumeId={resume.id}
									userId={userId}
								/>
							</div>
						</ScrollArea>
					</div>
				</ResizablePanel>
			</ResizablePanelGroup>

			{/* Version History Drawer */}
			<VersionHistoryDrawer
				open={isVersionDrawerOpen}
				onOpenChange={setIsVersionDrawerOpen}
				versions={versions}
				onRestore={handleVersionRestore}
			/>
		</div>
	)
}

/**
 * Format time ago string
 */
function formatTimeAgo(date: Date): string {
	const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

	if (seconds < 60) return 'just now'
	if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
	if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
	return `${Math.floor(seconds / 86400)}d ago`
}
