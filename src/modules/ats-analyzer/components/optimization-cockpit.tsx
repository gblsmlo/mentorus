'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { saveApplicationResume } from '../actions/application-actions'
import { useJobAnalysis } from '../hooks/use-job-analysis'
import { ResumeForm } from './resume-form'

interface OptimizationCockpitProps {
	application: any // Type this properly
	job: any
	resume: any
	userId: string
}

export function OptimizationCockpit({
	application,
	job,
	resume,
	userId,
}: OptimizationCockpitProps) {
	const [isSaving, setIsSaving] = useState(false)
	const { analyze, isAnalyzing, analysisResult } = useJobAnalysis({
		jobId: job.id,
		resumeId: resume.id,
		userId,
	})

	const handleSave = async (data: any) => {
		setIsSaving(true)
		try {
			const result = await saveApplicationResume({
				applicationId: application.id,
				content: data.content,
				title: data.title,
			})
			toast.success('Resume saved & optimized for this job!')

			// Auto-analyze after save if needed, or user clicks button
			// For now, let's just return the result so we can update local state if needed
		} catch (error) {
			toast.error('Failed to save')
			console.error(error)
		} finally {
			setIsSaving(false)
		}
	}

	return (
		<div className="flex h-[calc(100vh-4rem)] flex-col">
			{/* Header */}
			<div className="flex shrink-0 items-center justify-between border-b bg-background p-4">
				<div className="flex items-center gap-4">
					<Button asChild size="icon" variant="ghost">
						<Link href="/dashboard/applications">
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
							{application.matchScore && (
								<Badge variant={application.matchScore >= 70 ? 'default' : 'secondary'}>
									Match: {application.matchScore}%
								</Badge>
							)}
						</div>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button
						disabled={isAnalyzing}
						onClick={() => analyze(resume.currentVersionId)}
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
					<div className="flex h-full flex-col bg-muted/10">
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
							<div className="p-6">
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
		</div>
	)
}
