'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { duplicateResume } from '../actions/resume-actions'

interface Resume {
	id: string
	title: string
	currentVersionId: string | null
	createdAt: Date
	updatedAt: Date
}

interface ResumeListProps {
	resumes: Resume[]
	userId: string
}

export function ResumeList({ resumes, userId }: ResumeListProps) {
	const router = useRouter()
	const [duplicating, setDuplicating] = useState<string | null>(null)

	async function handleDuplicate(resumeId: string, title: string) {
		const newTitle = prompt(`Duplicate "${title}" as:`, `${title} (Copy)`)
		if (!newTitle) return

		setDuplicating(resumeId)
		try {
			await duplicateResume(userId, resumeId, newTitle)
			toast.success('Resume duplicated successfully!')
			router.refresh()
		} catch (error) {
			toast.error('Failed to duplicate resume', {
				description: error instanceof Error ? error.message : 'Unknown error',
			})
		} finally {
			setDuplicating(null)
		}
	}

	if (resumes.length === 0) {
		return (
			<Card>
				<CardContent className="flex flex-col items-center justify-center py-12">
					<div className="space-y-4 text-center">
						<div className="text-4xl">📄</div>
						<div>
							<h3 className="font-semibold text-lg">No resumes yet</h3>
							<p className="text-muted-foreground text-sm">
								Create your first resume to get started with ATS analysis
							</p>
						</div>
						<Button asChild>
							<Link href="/resumes/new">Create Your First Resume</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{resumes.map((resume) => (
				<Card className="transition-shadow hover:shadow-lg" key={resume.id}>
					<CardHeader>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<CardTitle className="line-clamp-1">{resume.title}</CardTitle>
								<CardDescription>
									Updated {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
								</CardDescription>
							</div>
							{resume.currentVersionId && <Badge variant="secondary">Active</Badge>}
						</div>
					</CardHeader>
					<CardContent>
						<div className="flex flex-col gap-2">
							<div className="flex gap-2">
								<Button asChild className="flex-1" size="sm" variant="default">
									<Link href={`/resumes/${resume.id}`}>Edit</Link>
								</Button>
								<Button asChild className="flex-1" size="sm" variant="outline">
									<Link href={`/resumes/${resume.id}/analyze`}>Analyze</Link>
								</Button>
							</div>
							<Button
								disabled={duplicating === resume.id}
								onClick={() => handleDuplicate(resume.id, resume.title)}
								size="sm"
								variant="ghost"
							>
								{duplicating === resume.id ? 'Duplicating...' : '📋 Duplicate'}
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
