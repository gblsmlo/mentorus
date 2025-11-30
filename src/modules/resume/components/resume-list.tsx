'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { duplicateResumeAction } from '../actions/duplicate-resume-action'
import { ResumeListEmpty } from './resume-list-empty'

interface Resume {
	id: string
	headline: string
	currentVersionId: string | null
}

interface ResumeListProps {
	resumes: Resume[]
	userId: string
}

export function ResumeList({ resumes, userId }: ResumeListProps) {
	const router = useRouter()
	const [duplicating, setDuplicating] = useState<string | null>(null)

	async function handleDuplicate(resumeId: string, headline: string) {
		const newHeadline = prompt(`Duplicate "${headline}" as:`, `${headline} (Copy)`)
		if (!newHeadline) return

		setDuplicating(resumeId)

		try {
			await duplicateResumeAction(resumeId, newHeadline)
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
		return <ResumeListEmpty />
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{resumes.map((resume) => (
				<Link href={`/resumes/${resume.id}`} key={resume.id}>
					<Card className="transition-shadow hover:shadow-lg hover:outline-1" key={resume.id}>
						<CardHeader className="relative gap-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<CardTitle className="line-clamp-1">{resume.headline}</CardTitle>
								</div>
							</div>
							<div className="absolute top-0 right-4">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button size="icon" variant="outline">
											<MoreHorizontal className="size-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="start" className="w-56">
										<DropdownMenuItem>
											<Link href={`/resumes/${resume.id}/analyze`}>Analyze</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuGroup>
											<DropdownMenuItem>
												<Link href={`/resumes/${resume.id}`}>Open</Link>
											</DropdownMenuItem>
											<DropdownMenuItem>
												<Link href={`/resumes/${resume.id}/edit`}>Edit</Link>
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => handleDuplicate(resume.id, resume.headline)}>
												Duplicate
											</DropdownMenuItem>
										</DropdownMenuGroup>
										<DropdownMenuSeparator />
										<DropdownMenuItem variant="destructive">
											<Trash2 size={16} />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>

						<CardFooter className="flex">
							{resume.currentVersionId && <Badge variant="secondary">Active</Badge>}
						</CardFooter>
					</Card>
				</Link>
			))}
		</div>
	)
}
